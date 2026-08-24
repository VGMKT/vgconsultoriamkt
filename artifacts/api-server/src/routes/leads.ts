import { Router, type IRouter } from 'express';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@workspace/db';
import { leadActivitiesTable, leadNotesTable, leadsTable, leadSources, leadStatuses, type LeadSource, type LeadStatus } from '@workspace/db/schema';
import { requireAuth, type AuthenticatedRequest } from '../middleware/require-auth';
import { z } from 'zod';

const router: IRouter = Router();
const publicLeadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(160),
  email: z.string().trim().email('Informe um e-mail válido.').max(320),
  whatsapp: z.string().trim().min(8, 'Informe um WhatsApp válido.').max(40),
  company: z.string().trim().max(180).optional().nullable(),
  service: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().max(5000).optional().nullable(),
  source: z.string().trim().optional().nullable(),
});

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
    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
});

router.use('/leads', requireAuth);

router.post('/leads/manual', async (req: AuthenticatedRequest, res, next) => {
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
    const status = typeof req.query.status === 'string' && leadStatuses.includes(req.query.status as LeadStatus) ? req.query.status : undefined;
    const source = typeof req.query.source === 'string' && leadSources.includes(req.query.source as LeadSource) ? req.query.source : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const filters = [];
    if (status) filters.push(eq(leadsTable.status, status));
    if (source) filters.push(eq(leadsTable.source, source));
    if (search) filters.push(or(ilike(leadsTable.name, `%${search}%`), ilike(leadsTable.email, `%${search}%`), ilike(leadsTable.company, `%${search}%`)));
    const leads = await db.select().from(leadsTable).where(filters.length ? and(...filters) : undefined).orderBy(desc(leadsTable.createdAt));
    res.json({ leads });
  } catch (error) {
    next(error);
  }
});

router.get('/leads/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
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

router.patch('/leads/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = req.body.status as LeadStatus;
    const source = typeof req.body.source === 'string' && leadSources.includes(req.body.source as LeadSource)
      ? req.body.source as LeadSource
      : undefined;
    if (!leadStatuses.includes(status)) {
      res.status(400).json({ error: 'Status inválido.' });
      return;
    }
    if (!source) {
      res.status(400).json({ error: 'Origem inválida.' });
      return;
    }
    const [lead] = await db.update(leadsTable).set({ status, source, updatedAt: new Date() }).where(eq(leadsTable.id, id)).returning();
    if (!lead) {
      res.status(404).json({ error: 'Lead não encontrado.' });
      return;
    }
    await db.insert(leadActivitiesTable).values({ leadId: id, actorId: req.userId, type: 'status_changed', detail: `Status alterado para ${statusLabels[status]}` });
    res.json({ lead });
  } catch (error) {
    next(error);
  }
});

router.post('/leads/:id/notes', async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
    if (!body) {
      res.status(400).json({ error: 'Escreva uma observação antes de salvar.' });
      return;
    }
    const [lead] = await db.select({ id: leadsTable.id }).from(leadsTable).where(eq(leadsTable.id, id));
    if (!lead) {
      res.status(404).json({ error: 'Lead não encontrado.' });
      return;
    }
    const [note] = await db.insert(leadNotesTable).values({ leadId: id, authorId: req.userId!, body }).returning();
    await db.insert(leadActivitiesTable).values({ leadId: id, actorId: req.userId, type: 'note_added', detail: 'Observação adicionada' });
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

export default router;