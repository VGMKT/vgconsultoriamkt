import { Router, type IRouter } from 'express';
import { and, desc, eq, gte, ilike, isNull, or, sql } from 'drizzle-orm';
import { db } from '@workspace/db';
import { crmUsersTable, leadActivitiesTable, leadNotesTable, leadsTable, leadSources, leadStatuses, manualLeadSources, type LeadSource, type LeadStatus } from '@workspace/db/schema';
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
  utm_source: z.string().trim().max(255).optional().nullable(),
  utm_medium: z.string().trim().max(255).optional().nullable(),
  utm_campaign: z.string().trim().max(255).optional().nullable(),
  utm_term: z.string().trim().max(255).optional().nullable(),
  utm_content: z.string().trim().max(255).optional().nullable(),
  gclid: z.string().trim().max(500).optional().nullable(),
  fbclid: z.string().trim().max(500).optional().nullable(),
  referrer: z.string().trim().max(1000).optional().nullable(),
  landing_page: z.string().trim().max(2000).optional().nullable(),
}).strict();

const manualLeadSchema = publicLeadSchema.extend({
  source: z.enum(manualLeadSources).optional(),
});

const leadFiltersSchema = z.object({
  status: z.enum(leadStatuses).optional(),
  source: z.enum(leadSources).optional(),
  search: z.string().trim().max(100, 'A busca deve ter no máximo 100 caracteres.').optional().default(''),
  page: z.coerce.number().int().min(1).max(100000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(25),
}).strict();

const reportPeriodSchema = z.object({
  period: z.enum(['30', '90', 'all']).optional().default('30'),
}).strict();

const updateLeadSchema = z.object({
  status: z.enum(leadStatuses).optional(),
  assignedUserId: z.coerce.number().int().positive().nullable().optional(),
}).strict().refine(
  (data) => data.status !== undefined || data.assignedUserId !== undefined,
  { message: 'Informe o status ou o responsável para atualizar o lead.' },
);

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

function parseAttribution(data: z.infer<typeof publicLeadSchema>) {
  return {
    utmSource: data.utm_source || null,
    utmMedium: data.utm_medium || null,
    utmCampaign: data.utm_campaign || null,
    utmTerm: data.utm_term || null,
    utmContent: data.utm_content || null,
    gclid: data.gclid || null,
    fbclid: data.fbclid || null,
    referrer: data.referrer || null,
    landingPage: data.landing_page || null,
  };
}

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
      ...parseAttribution(parsed.data),
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
    const parsed = manualLeadSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Preencha nome, e-mail e WhatsApp corretamente.', details: parsed.error.flatten() });
      return;
    }
    const [lead] = await db.insert(leadsTable).values({
      ...parsed.data,
      source: parseSource(parsed.data.source, 'manual'),
      ...parseAttribution(parsed.data),
      status: 'new',
    }).returning();
    await db.insert(leadActivitiesTable).values({ leadId: lead.id, actorId: req.userId, type: 'created', detail: 'Lead cadastrado manualmente' });
    logger.info({ event: 'lead.created', leadId: lead.id, source: parseSource(parsed.data.source, 'manual'), actorType: 'authenticated', actorId: req.userId }, 'Manual lead created');
    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
});

router.get('/leads/summary', async (req: AuthenticatedRequest, res, next) => {
  try {
    const visibilityFilter = req.crmUser?.role === 'operator' && req.crmUser.id
      ? eq(leadsTable.assignedUserId, req.crmUser.id)
      : undefined;
    const rows = await db.select({ status: leadsTable.status, count: sql<number>`count(*)::int` }).from(leadsTable)
      .where(visibilityFilter)
      .groupBy(leadsTable.status);
    const summary = Object.fromEntries(leadStatuses.map((status) => [status, { count: rows.find((row) => row.status === status)?.count ?? 0, label: statusLabels[status] }]));
    res.json({ summary });
  } catch (error) {
    next(error);
  }
});

router.get('/leads', async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = leadFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Filtros inválidos.', details: parsed.error.flatten() });
      return;
    }
    const { status, source, search, page, limit } = parsed.data;
    const filters = [];
    if (req.crmUser?.role === 'operator' && req.crmUser.id) {
      filters.push(eq(leadsTable.assignedUserId, req.crmUser.id));
    }
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

router.get('/leads/reports', async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsed = reportPeriodSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Período de relatório inválido.', details: parsed.error.flatten() });
      return;
    }

    const { period } = parsed.data;
    const filters = [];
    if (req.crmUser?.role === 'operator' && req.crmUser.id) {
      filters.push(eq(leadsTable.assignedUserId, req.crmUser.id));
    }
    if (period !== 'all') {
      const days = Number(period);
      const since = new Date();
      since.setDate(since.getDate() - days);
      filters.push(gte(leadsTable.createdAt, since));
    }

    const reportLeads = await db.select({
      status: leadsTable.status,
      source: leadsTable.source,
      assignedUserId: leadsTable.assignedUserId,
    }).from(leadsTable).where(filters.length ? and(...filters) : undefined);
    const consultants = await db.select({ id: crmUsersTable.id, name: crmUsersTable.name }).from(crmUsersTable);
    const consultantNames = new Map(consultants.map((consultant) => [consultant.id, consultant.name]));

    const statusCounts = Object.fromEntries(leadStatuses.map((status) => [status, 0])) as Record<LeadStatus, number>;
    const sourceCounts = new Map<string, { source: string; total: number; won: number }>();
    const consultantCounts = new Map<number, { consultantId: number; name: string; total: number; won: number }>();
    let unassigned = 0;

    for (const lead of reportLeads) {
      const status = lead.status as LeadStatus;
      if (status in statusCounts) statusCounts[status] += 1;

      const source = lead.source || 'other';
      const sourceRow = sourceCounts.get(source) || { source, total: 0, won: 0 };
      sourceRow.total += 1;
      if (status === 'won') sourceRow.won += 1;
      sourceCounts.set(source, sourceRow);

      if (lead.assignedUserId === null) {
        unassigned += 1;
      } else {
        const consultantRow = consultantCounts.get(lead.assignedUserId) || {
          consultantId: lead.assignedUserId,
          name: consultantNames.get(lead.assignedUserId) || 'Consultor removido',
          total: 0,
          won: 0,
        };
        consultantRow.total += 1;
        if (status === 'won') consultantRow.won += 1;
        consultantCounts.set(lead.assignedUserId, consultantRow);
      }
    }

    const totalLeads = reportLeads.length;
    const wonLeads = statusCounts.won;
    const openLeads = totalLeads - wonLeads - statusCounts.lost;
    const toConversionRow = <T extends { total: number; won: number }>(row: T) => ({
      ...row,
      conversionRate: row.total ? Math.round((row.won / row.total) * 1000) / 10 : 0,
    });

    res.json({
      period,
      totalLeads,
      wonLeads,
      openLeads,
      conversionRate: totalLeads ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0,
      byStatus: leadStatuses.map((status) => ({ status, count: statusCounts[status] })),
      bySource: [...sourceCounts.values()].map(toConversionRow).sort((a, b) => b.total - a.total),
      byConsultant: [...consultantCounts.values()].map(toConversionRow).sort((a, b) => b.total - a.total),
      unassigned,
    });
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

router.delete('/leads/:id', requireRole('owner', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsedId = parseLeadId(req.params.id);
    if (!parsedId.success) {
      res.status(400).json({ error: 'ID de lead inválido.' });
      return;
    }

    const id = parsedId.data;
    const [existingLead] = await db.select({ id: leadsTable.id, name: leadsTable.name }).from(leadsTable).where(eq(leadsTable.id, id));
    if (!existingLead) {
      res.status(404).json({ error: 'Lead não encontrado.' });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.delete(leadNotesTable).where(eq(leadNotesTable.leadId, id));
      await tx.delete(leadActivitiesTable).where(eq(leadActivitiesTable.leadId, id));
      await tx.delete(leadsTable).where(eq(leadsTable.id, id));
    });

    logger.info({ event: 'lead.deleted', leadId: id, leadName: existingLead.name, actorId: req.userId }, 'Lead deleted');
    res.status(204).send();
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
    const { status, assignedUserId } = parsed.data;
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
    const updateValues = {
      ...(status === undefined ? {} : { status }),
      ...(assignedUserId === undefined ? {} : { assignedUserId }),
      updatedAt: new Date(),
    };
    const [lead] = await db.update(leadsTable).set(updateValues).where(eq(leadsTable.id, id)).returning();
    if (!lead) {
      res.status(404).json({ error: 'Lead não encontrado.' });
      return;
    }
    if (status !== undefined) {
      await db.insert(leadActivitiesTable).values({ leadId: id, actorId: req.userId, type: 'status_changed', detail: `Status alterado para ${statusLabels[status]}` });
    }
    logger.info({ event: 'lead.updated', leadId: id, status, assignedUserId, actorId: req.userId }, 'Lead status or assignment updated');
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