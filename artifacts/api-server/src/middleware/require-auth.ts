import { getAuth } from '@clerk/express';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';

export type AuthenticatedRequest = Request & { userId?: string };

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