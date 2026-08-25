import { Router, type IRouter } from 'express';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@workspace/db';
import { crmRoles, crmUsersTable } from '@workspace/db/schema';
import { requireCrmUser, requireRole, type AuthenticatedRequest } from '../middleware/require-auth';

const router: IRouter = Router();
const updateUserSchema = z.object({
  role: z.enum(crmRoles),
  active: z.boolean(),
}).strict();
const createUserSchema = z.object({
  email: z.string().email().max(320),
  name: z.string().trim().min(2).max(240),
  role: z.enum(crmRoles).default('operator'),
}).strict();

function canManageRole(actorRole: string | undefined, targetRole: string) {
  if (actorRole === 'owner') return true;
  if (actorRole === 'admin') return targetRole === 'manager' || targetRole === 'operator';
  if (actorRole === 'manager') return targetRole === 'operator';
  return false;
}

router.use('/users', requireCrmUser);

router.get('/users/me', (req: AuthenticatedRequest, res) => {
  res.json({ user: req.crmUser });
});

router.get('/users', requireRole('owner', 'admin'), async (_req, res, next) => {
  try {
    const users = await db.select().from(crmUsersTable).where(isNull(crmUsersTable.deletedAt)).orderBy(desc(crmUsersTable.updatedAt));
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.get('/users/assignable', async (_req, res, next) => {
  try {
    const users = await db.select({
      id: crmUsersTable.id,
      name: crmUsersTable.name,
      email: crmUsersTable.email,
      role: crmUsersTable.role,
    }).from(crmUsersTable)
      .where(and(isNull(crmUsersTable.deletedAt), eq(crmUsersTable.active, 1), eq(crmUsersTable.role, 'operator')))
      .orderBy(crmUsersTable.name);
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

router.post('/users', requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Informe nome, e-mail e papel.', details: parsed.error.flatten() });
      return;
    }
    if (!canManageRole(req.crmUser?.role, parsed.data.role)) {
      res.status(403).json({ error: 'Seu papel não pode cadastrar um usuário com essa função.' });
      return;
    }
    if (!process.env.CLERK_SECRET_KEY) {
      res.status(503).json({ error: 'O serviço de convites ainda não está configurado.' });
      return;
    }
    const [existingUser] = await db.select({ id: crmUsersTable.id }).from(crmUsersTable).where(
      and(eq(crmUsersTable.email, parsed.data.email), isNull(crmUsersTable.deletedAt)),
    );
    if (existingUser) {
      res.status(409).json({ error: 'Este e-mail já está cadastrado no CRM.' });
      return;
    }
    const origin = typeof req.headers.origin === 'string' && req.headers.origin.startsWith('https://')
      ? req.headers.origin
      : 'https://vgconsultoriamkt.com.br';
    const clerkResponse = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: parsed.data.email,
        public_metadata: { crmRole: parsed.data.role },
        redirect_url: `${origin}/sign-in`,
        notify: true,
      }),
    });
    if (!clerkResponse.ok) {
      const clerkError = await clerkResponse.json().catch(() => null) as { errors?: Array<{ message?: string }> } | null;
      res.status(clerkResponse.status === 422 ? 409 : 502).json({
        error: clerkError?.errors?.[0]?.message || 'Não foi possível enviar o convite por e-mail.',
      });
      return;
    }
    const [user] = await db.insert(crmUsersTable).values(parsed.data).returning();
    res.status(201).json({ user, invitationSent: true });
  } catch (error: any) {
    if (error?.code === '23505') {
      res.status(409).json({ error: 'Este usuário já está cadastrado no CRM.' });
      return;
    }
    next(error);
  }
});

router.patch('/users/:id', requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Dados de usuário inválidos.', details: parsed.error.flatten() });
      return;
    }
    if (id === req.crmUser?.id && (!parsed.data.active || parsed.data.role !== 'owner')) {
      res.status(400).json({ error: 'Você não pode remover seu próprio acesso de owner.' });
      return;
    }
    const [currentUser] = await db.select().from(crmUsersTable).where(eq(crmUsersTable.id, id));
    if (!currentUser) {
      res.status(404).json({ error: 'Usuário não encontrado no CRM.' });
      return;
    }
    if (!canManageRole(req.crmUser?.role, parsed.data.role)
      || (currentUser.role === 'owner' && req.crmUser?.role !== 'owner')
      || (currentUser.role === 'admin' && req.crmUser?.role !== 'owner')) {
      res.status(403).json({ error: 'Seu papel não pode alterar este usuário para essa função.' });
      return;
    }
    const [user] = await db.update(crmUsersTable)
      .set({ ...parsed.data, active: parsed.data.active ? 1 : 0, updatedAt: new Date() })
      .where(eq(crmUsersTable.id, id))
      .returning();
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    if (id === req.crmUser?.id) {
      res.status(400).json({ error: 'Você não pode excluir o próprio acesso.' });
      return;
    }
    const [currentUser] = await db.select().from(crmUsersTable).where(eq(crmUsersTable.id, id));
    if (!currentUser) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    if (!canManageRole(req.crmUser?.role, currentUser.role)) {
      res.status(403).json({ error: 'Seu papel não pode excluir este usuário.' });
      return;
    }
    const [user] = await db.update(crmUsersTable)
      .set({ active: 0, deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(crmUsersTable.id, id))
      .returning();
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;