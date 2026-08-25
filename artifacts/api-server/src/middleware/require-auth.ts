import { getAuth } from '@clerk/express';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';
import { and, count, eq } from 'drizzle-orm';
import { db } from '@workspace/db';
import { crmUsersTable, crmRoles, type CrmRole } from '@workspace/db/schema';

export type AuthenticatedRequest = Request & {
  userId?: string;
  crmUser?: typeof crmUsersTable.$inferSelect;
};

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    logger.warn({
      event: 'auth.denied',
      method: req.method,
      path: req.originalUrl?.split('?')[0] || req.path,
    }, 'Protected route access denied');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.userId = userId;
  next();
}

export async function requireCrmUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, async (error) => {
    if (error) return next(error);
    try {
      const [existing] = await db.select().from(crmUsersTable).where(eq(crmUsersTable.clerkUserId, req.userId!));
      if (!existing) {
        const [{ value: userCount }] = await db.select({ value: count() }).from(crmUsersTable);
        if (Number(userCount) !== 0) {
          res.status(403).json({ error: 'Usuário ainda não foi habilitado no CRM.' });
          return;
        }
        const [owner] = await db.insert(crmUsersTable).values({
          clerkUserId: req.userId!,
          email: String(req.headers['x-clerk-user-email'] || 'conta principal'),
          name: String(req.headers['x-clerk-user-name'] || 'Proprietário'),
          role: 'owner',
        }).returning();
        req.crmUser = owner;
      } else {
        if (!existing.active) {
          res.status(403).json({ error: 'Usuário desativado.' });
          return;
        }
        await db.update(crmUsersTable).set({ lastSeenAt: new Date() }).where(eq(crmUsersTable.clerkUserId, req.userId!));
        req.crmUser = existing;
      }
      next();
    } catch (error) {
      next(error);
    }
  });
}

export function requireRole(...allowedRoles: CrmRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.crmUser || !allowedRoles.includes(req.crmUser.role as CrmRole)) {
      res.status(403).json({ error: 'Você não tem permissão para esta ação.' });
      return;
    }
    next();
  };
}