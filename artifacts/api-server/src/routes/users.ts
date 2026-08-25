import { Router, type IRouter } from 'express';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@workspace/db';
import { crmRoles, crmUsersTable } from '@workspace/db/schema';
import { requireCrmUser, requireRole, type AuthenticatedRequest } from '../middleware/require-auth';

const router: IRouter = Router();
const userIdSchema = z.string().trim().min(1).max(255);
const updateUserSchema = z.object({
  role: z.enum(crmRoles),
  active: z.boolean(),
}).strict();
const createUserSchema = z.object({
  clerkUserId: userIdSchema,
  email: z.string().email().max(320),
  name: z.string().trim().min(2).max(240),
  role: z.enum(crmRoles).default('operator'),
}).strict();

router.use('/users', requireCrmUser);

router.get('/users/me', (req: AuthenticatedRequest, res) => {
  res.json({ user: req.crmUser });
});

router.get('/users', requireRole('owner', 'admin'), async (_req, res, next) => {
  try {
    const users = await db.select().from(crmUsersTable).orderBy(desc(crmUsersTable.updatedAt));
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.post('/users', requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Informe o ID do usuário Clerk, nome, e-mail e papel.', details: parsed.error.flatten() });
      return;
    }
    if (parsed.data.role === 'owner' && req.crmUser?.role !== 'owner') {
      res.status(403).json({ error: 'Somente owner pode criar outro owner.' });
      return;
    }
    const [user] = await db.insert(crmUsersTable).values(parsed.data).returning();
    res.status(201).json({ user });
  } catch (error: any) {
    if (error?.code === '23505') {
      res.status(409).json({ error: 'Este usuário já está cadastrado no CRM.' });
      return;
    }
    next(error);
  }
});

router.patch('/users/:clerkUserId', requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const clerkUserId = userIdSchema.parse(req.params.clerkUserId);
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Dados de usuário inválidos.', details: parsed.error.flatten() });
      return;
    }
    if (clerkUserId === req.userId && (!parsed.data.active || parsed.data.role !== 'owner')) {
      res.status(400).json({ error: 'Você não pode remover seu próprio acesso de owner.' });
      return;
    }
    if (parsed.data.role === 'owner' && req.crmUser?.role !== 'owner') {
      res.status(403).json({ error: 'Somente owner pode promover outro owner.' });
      return;
    }
    const [user] = await db.update(crmUsersTable)
      .set({ ...parsed.data, active: parsed.data.active ? 1 : 0, updatedAt: new Date() })
      .where(eq(crmUsersTable.clerkUserId, clerkUserId))
      .returning();
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado no CRM.' });
      return;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;