import { Router, type IRouter } from 'express';
import { and, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';
import { db } from '@workspace/db';
import { crmUsersTable, leadActivitiesTable, leadNotesTable, leadsTable, leadSources, leadStatuses, type LeadSource, type LeadStatus } from '@workspace/db/schema';
import { requireCrmUser, requireRole, type AuthenticatedRequest } from '../middleware/require-auth';
import { logger } from '../lib/logger';
import { z } from 'zod';

const router: IRouter = Router();
const leadIdSchema = z.coerce.number().int().positive();
const publicLeadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(160),
  email: z.string().trim().email('Informe um e-mail válido.').max(320),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido.').max(40),
  company: z.string().trim().max(180).optional().nullable(),
  service: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
  source: z.string().trim().max(80).optional().nullable(),
}).strict();

const leadFiltersSchema = z.object({
  status: z.enum(leadStatuses).optional(),
  source: z.enum(leadSources).optional(),
  search: z.string().trim().max(100, 'A busca deve ter no máximo 100 caracteres.').optional().default(''),
  page: z.coerce.number().int().min(1).max(100000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
}).strict();

const updateLeadSchema = z.object({
  status: z.enum(leadStatuses),
  source: z.enum(leadSources),
  assignedUserId: z.coerce.number().int().positive().nullable().optional(),
}).strict();

const noteSchema = z.object({
  body: z.string().trim().min(1, 'Escreva uma observação antes de salvar.').max(5000, 'A observação deve ter no máximo 5.000 caracteres.'),
}).strict();

const publicLeadAttempts = new Map<string, { count: number; resetAt: number }>();
const PUBLIC_LEAD_WINDOW_MS = 15 * 60 * 1000;
const PUBLIC_LEAD_MAX_ATTEMPTS = 20;

function allowPublicLead(req: { ip?: string }, now = Date.now()): boolean {
  const key = req.ip || 'unknown';
  const current = publicLeadAttempts.get(key);
  if (!current || current.resetAt <= now) {
    publicLeadAttempts.set(key, { count: 1, resetAt: now + PUBLIC_LEAD_WINDOW_MS });
    return true;
  }
  if (current.count >= PUBLIC_LEAD_MAX_ATTEMPTS) return false;
  current.count += 1;
  return true;
}

function parseLeadId(value: unknown) {
  return leadIdSchema.safeParse(value);
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&');
}

const parseSource = (value: unknown, fallback: LeadSource): LeadSource => {
  return typeof value === 'string' && leadSources.includes(value as LeadSource) ? value as LeadSource : fallback;
};

const statusLabels: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contato iniciado',
  meeting: 'Reunião agendada',
  proposal: 'Proposta enviada',
  won: 'Ganho',
  lost: 'Perdido',
};

router.post('/leads', async (req, res, next) => {
  try {
    if (!allowPublicLead(req)) {
      res.status(429).json({ error: 'Muitas tentativas. Tente novamente mais tarde.' });
      return;
    }
    const parsed = publicLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Preencha nome, e-mail e WhatsApp corretamente.', details: parsed.error.flatten() });
      return;
    }
    const [lead] = await db.insert(leadsTable).values({
      ...parsed.data,
       source: parseSource(parsed.data.source, 'site'),
      status: 'new',
    }).returning();
    await db.insert(leadActivitiesTable).values({ leadId: lead.id, type: 'created', detail: 'Lead recebido pelo site' });
    logger.info({ event: 'lead.created', leadId: lead.id, source: parseSource(parsed.data.source, 'site'), actorType: 'public' }, 'Public lead created');
    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
});

router.use('/leads', requireCrmUser);

router.post('/leads/manual', requireRole('owner', 'admin', 'manager', 'operator'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = publicLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Preencha nome, e-mail e WhatsApp corretamente.', details: parsed.error.flatten() });
      return;
    }
    const [lead] = await db.insert(leadsTable).values({
      ...parsed.data,
       source: parseSource(parsed.data.source, 'manual'),
      status: 'new',
    }).returning();
    await db.insert(leadActivitiesTable).values({ leadId: lead.id, actorId: req.userId, type: 'created', detail: 'Lead cadastrado manualmente' });
    logger.info({ event: 'lead.created', leadId: lead.id, source: parseSource(parsed.data.source, 'manual'), actorType: 'authenticated', actorId: req.userId }, 'Manual lead created');
    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
});

router.get('/leads/summary', async (_req, res, next) => {
  try {
    const rows = await db.select({ status: leadsTable.status, count: sql<number>`count(*)::int` }).from(leadsTable).groupBy(leadsTable.status);
    const summary = Object.fromEntries(leadStatuses.map((status) => [status, { count: rows.find((row) => row.status === status)?.count ?? 0, label: statusLabels[status] }]));
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

router.get('/leads', async (req, res, next) => {
  try {
    const parsed = leadFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Filtros inválidos.', details: parsed.error.flatten() });
      return;
    }
    const { status, source, search, page, limit } = parsed.data;
    const filters = [];
    if (status) filters.push(eq(leadsTable.status, status));
    if (source) filters.push(eq(leadsTable.source, source));
    if (search) {
      const safeSearch = escapeLike(search);
      filters.push(or(ilike(leadsTable.name, `%${safeSearch}%`), ilike(leadsTable.email, `%${safeSearch}%`), ilike(leadsTable.company, `%${safeSearch}%`)));
    }
    const leads = await db.select().from(leadsTable)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(leadsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    res.json({ leads, page, limit });
  } catch (error) {
    next(error);
  }
});

router.get('/leads/:id', async (req, res, next) => {
  try {
    const parsedId = parseLeadId(req.params.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'ID de lead inválido.' });
      return;
    }
    const id = parsedId.data;
    const [lead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
    if (!lead) {
      res.status(404).json({ error: 'Lead não encontrado.' });
      return;
    }
    const [notes, activities] = await Promise.all([
      db.select().from(leadNotesTable).where(eq(leadNotesTable.leadId, id)).orderBy(desc(leadNotesTable.createdAt)),
      db.select().from(leadActivitiesTable).where(eq(leadActivitiesTable.leadId, id)).orderBy(desc(leadActivitiesTable.createdAt)),
    ]);
    res.json({ lead, notes, activities });
  } catch (error) {
    next(error);
  }
});

router.patch('/leads/:id', requireRole('owner', 'admin', 'manager', 'operator'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsedId = parseLeadId(req.params.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'ID de lead inválido.' });
      return;
    }
    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Dados de atualização inválidos.', details: parsed.error.flatten() });
      return;
    }
    const { status, source, assignedUserId } = parsed.data;
    if (assignedUserId !== undefined && !['owner', 'admin', 'manager'].includes(req.crmUser?.role || '')) {
      res.status(403).json({ error: 'Somente gestor ou superior pode alterar o consultor responsável.' });
      return;
    }
    if (assignedUserId !== undefined && assignedUserId !== null) {
      const [consultant] = await db.select({ id: crmUsersTable.id }).from(crmUsersTable).where(and(
        eq(crmUsersTable.id, assignedUserId),
        eq(crmUsersTable.role, 'operator'),
        eq(crmUsersTable.active, 1),
        isNull(crmUsersTable.deletedAt),
      ));
      if (!consultant) {
        res.status(400).json({ error: 'O responsável precisa ser um consultor ativo.' });
        return;
      }
    }
    const id = parsedId.data;
    const updateValues = assignedUserId === undefined
      ? { status, source, updatedAt: new Date() }
      : { status, source, assignedUserId, updatedAt: new Date() };
    const [lead] = await db.update(leadsTable).set(updateValues).where(eq(leadsTable.id, id)).returning();
    if (!lead) {
      res.status(404).json({ error: 'Lead não encontrado.' });
      return;
    }
    await db.insert(leadActivitiesTable).values({ leadId: id, actorId: req.userId, type: 'status_changed', detail: `Status alterado para ${statusLabels[status]}` });
    logger.info({ event: 'lead.updated', leadId: id, status, source, actorId: req.userId }, 'Lead status or source updated');
    res.json({ lead });
  } catch (error) {
    next(error);
  }
});

router.post('/leads/:id/notes', requireRole('owner', 'admin', 'manager', 'operator'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsedId = parseLeadId(req.params.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'ID de lead inválido.' });
      return;
    }
    const parsed = noteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Observação inválida.', details: parsed.error.flatten() });
      return;
    }
    const id = parsedId.data;
    const { body } = parsed.data;
    const [lead] = await db.select({ id: leadsTable.id }).from(leadsTable).where(eq(leadsTable.id, id));
    if (!lead) {
      res.status(404).json({ error: 'Lead não encontrado.' });
      return;
    }
    const [note] = await db.insert(leadNotesTable).values({ leadId: id, authorId: req.userId!, body }).returning();
    await db.insert(leadActivitiesTable).values({ leadId: id, actorId: req.userId, type: 'note_added', detail: 'Observação adicionada' });
    logger.info({ event: 'lead.note_added', leadId: id, actorId: req.userId }, 'Lead note added');
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

export default router;