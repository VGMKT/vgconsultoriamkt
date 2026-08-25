import { getAuth } from '@clerk/express';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';
import { and, count, eq, isNull } from 'drizzle-orm';
import { db } from '@workspace/db';
import { crmUsersTable, crmRoles, type CrmRole } from '@workspace/db/schema';

export type AuthenticatedRequest = Request & {
  userId?: string;
  crmUser?: typeof crmUsersTable.$inferSelect;
};

type ClerkUserProfile = {
  first_name?: string | null;
  username?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{ id?: string; email_address?: string }>;
};

async function getClerkUserProfile(userId: string): Promise<ClerkUserProfile | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) return null;
  const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) {
    logger.warn({ event: 'auth.profile_lookup_failed', userId, status: response.status }, 'Could not load Clerk user profile');
    return null;
  }
  return await response.json() as ClerkUserProfile;
}

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
      const auth = getAuth(req);
      const claims = auth?.sessionClaims as Record<string, unknown> | undefined;
      let email = typeof claims?.email === 'string'
        ? claims.email
        : typeof claims?.email_address === 'string' ? claims.email_address : undefined;
      let name = typeof claims?.name === 'string'
        ? claims.name
        : typeof claims?.first_name === 'string' ? claims.first_name : 'Usuário do CRM';
      const [existing] = await db.select().from(crmUsersTable).where(
        and(isNull(crmUsersTable.deletedAt), email
          ? eq(crmUsersTable.clerkUserId, req.userId!)
          : eq(crmUsersTable.clerkUserId, req.userId!)),
      );
      if (!existing && (!email || name === 'Usuário do CRM')) {
        const clerkUser = await getClerkUserProfile(req.userId!);
        const primaryEmail = clerkUser?.email_addresses?.find(
          (address) => address.id === clerkUser.primary_email_address_id,
        )?.email_address || clerkUser?.email_addresses?.[0]?.email_address;
        email = email || primaryEmail;
        name = name !== 'Usuário do CRM'
          ? name
          : clerkUser?.first_name || clerkUser?.username || primaryEmail || name;
      }
      const [emailMatch] = !existing && email
        ? await db.select().from(crmUsersTable).where(and(isNull(crmUsersTable.deletedAt), eq(crmUsersTable.email, email)))
        : [];
      const linkedUser = existing || emailMatch;
      if (!linkedUser) {
        const [{ value: userCount }] = await db.select({ value: count() }).from(crmUsersTable);
        if (Number(userCount) !== 0) {
          res.status(403).json({ error: 'Usuário ainda não foi habilitado no CRM.' });
          return;
        }
        const [owner] = await db.insert(crmUsersTable).values({
          clerkUserId: req.userId!,
          email: email || 'conta principal',
          name,
          role: 'owner',
        }).returning();
        req.crmUser = owner;
      } else {
        if (!linkedUser.active) {
          res.status(403).json({ error: 'Usuário desativado.' });
          return;
        }
        const [updated] = await db.update(crmUsersTable).set({ clerkUserId: req.userId!, lastSeenAt: new Date() }).where(eq(crmUsersTable.id, linkedUser.id)).returning();
        req.crmUser = updated;
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