import { Router, type IRouter, type Response } from 'express';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@workspace/db';
import { crmServicesTable, leadActivitiesTable, leadServicesTable, leadsTable, serviceBillingTypes } from '@workspace/db/schema';
import { requireCrmUser, type AuthenticatedRequest } from '../middleware/require-auth';
import { logger } from '../lib/logger';

const router: IRouter = Router();
const leadIdSchema = z.coerce.number().int().positive();
const leadServiceIdSchema = z.coerce.number().int().positive();

const createLeadServiceSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
}).strict();

const updateLeadServiceSchema = z.object({
  price: z.number().finite().min(0).max(9999999999.99).nullable().optional(),
  billingType: z.enum(serviceBillingTypes).nullable().optional(),
}).strict().refine(
  (fields) => Object.keys(fields).length > 0,
  'Informe o preço ou o tipo de cobrança para atualizar.',
);

router.use('/leads', requireCrmUser);

async function findAccessibleLead(
  leadId: number,
  req: AuthenticatedRequest,
  res: Response,
) {
  const [lead] = await db.select({
    id: leadsTable.id,
    assignedUserId: leadsTable.assignedUserId,
  }).from(leadsTable).where(eq(leadsTable.id, leadId));
  if (!lead) {
    res.status(404).json({ error: 'Lead não encontrado.' });
    return null;
  }
  if (req.crmUser?.role === 'operator' && req.crmUser.id !== lead.assignedUserId) {
    res.status(403).json({ error: 'Você não tem acesso a este lead.' });
    return null;
  }
  return lead;
}

router.get('/leads/:leadId/services', async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsedLeadId = leadIdSchema.safeParse(req.params.leadId);
    if (!parsedLeadId.success) {
      res.status(400).json({ error: 'ID de lead inválido.' });
      return;
    }
    const lead = await findAccessibleLead(parsedLeadId.data, req, res);
    if (!lead) return;

    const services = await db.select({
      id: leadServicesTable.id,
      serviceId: leadServicesTable.serviceId,
      name: leadServicesTable.serviceName,
      description: crmServicesTable.description,
      price: leadServicesTable.price,
      billingType: leadServicesTable.billingType,
      createdAt: leadServicesTable.createdAt,
      updatedAt: leadServicesTable.updatedAt,
    }).from(leadServicesTable)
      .innerJoin(crmServicesTable, eq(leadServicesTable.serviceId, crmServicesTable.id))
      .where(and(eq(leadServicesTable.leadId, lead.id), isNull(leadServicesTable.removedAt)))
      .orderBy(asc(leadServicesTable.createdAt));
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

router.post('/leads/:leadId/services', async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsedLeadId = leadIdSchema.safeParse(req.params.leadId);
    const parsedBody = createLeadServiceSchema.safeParse(req.body);
    if (!parsedLeadId.success) {
      res.status(400).json({ error: 'ID de lead inválido.' });
      return;
    }
    if (!parsedBody.success) {
      res.status(400).json({ error: 'Selecione um serviço válido.', details: parsedBody.error.flatten() });
      return;
    }
    const lead = await findAccessibleLead(parsedLeadId.data, req, res);
    if (!lead) return;
    const [catalogService] = await db.select().from(crmServicesTable).where(and(
      eq(crmServicesTable.id, parsedBody.data.serviceId),
      isNull(crmServicesTable.deletedAt),
    ));
    if (!catalogService) {
      res.status(404).json({ error: 'O serviço não está mais ativo no catálogo.' });
      return;
    }

    const [existingLink] = await db.select({ id: leadServicesTable.id }).from(leadServicesTable).where(and(
      eq(leadServicesTable.leadId, lead.id),
      eq(leadServicesTable.serviceId, catalogService.id),
      isNull(leadServicesTable.removedAt),
    ));
    if (existingLink) {
      res.status(409).json({ error: 'Este serviço já está vinculado ao lead.' });
      return;
    }

    const leadService = await db.transaction(async (tx) => {
      const [createdLink] = await tx.insert(leadServicesTable).values({
        leadId: lead.id,
        serviceId: catalogService.id,
        serviceName: catalogService.name,
        price: catalogService.basePrice,
        billingType: catalogService.billingType,
      }).returning();
      await tx.update(leadsTable).set({ updatedAt: new Date() }).where(eq(leadsTable.id, lead.id));
      await tx.insert(leadActivitiesTable).values({
        leadId: lead.id,
        actorId: req.userId,
        type: 'service_added',
        detail: `Serviço adicionado: ${catalogService.name}`,
      });
      return { ...createdLink, description: catalogService.description };
    });

    logger.info({ event: 'lead.service_added', leadId: lead.id, serviceId: catalogService.id, actorId: req.userId }, 'Service linked to lead');
    res.status(201).json({ leadService });
  } catch (error) {
    next(error);
  }
});

router.patch('/leads/:leadId/services/:leadServiceId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsedLeadId = leadIdSchema.safeParse(req.params.leadId);
    const parsedLeadServiceId = leadServiceIdSchema.safeParse(req.params.leadServiceId);
    const parsedBody = updateLeadServiceSchema.safeParse(req.body);
    if (!parsedLeadId.success || !parsedLeadServiceId.success) {
      res.status(400).json({ error: 'ID de lead ou serviço inválido.' });
      return;
    }
    if (!parsedBody.success) {
      res.status(400).json({ error: 'Informe um preço ou tipo de cobrança válido.', details: parsedBody.error.flatten() });
      return;
    }
    const lead = await findAccessibleLead(parsedLeadId.data, req, res);
    if (!lead) return;
    const [currentLink] = await db.select().from(leadServicesTable).where(and(
      eq(leadServicesTable.id, parsedLeadServiceId.data),
      eq(leadServicesTable.leadId, lead.id),
      isNull(leadServicesTable.removedAt),
    ));
    if (!currentLink) {
      res.status(404).json({ error: 'Serviço não encontrado neste lead.' });
      return;
    }
    const [catalogService] = await db.select({
      description: crmServicesTable.description,
    }).from(crmServicesTable).where(eq(crmServicesTable.id, currentLink.serviceId));
    if (!catalogService) {
      res.status(409).json({ error: 'A descrição deste serviço não está disponível.' });
      return;
    }

    const leadService = await db.transaction(async (tx) => {
      const [updatedLink] = await tx.update(leadServicesTable)
        .set({ ...parsedBody.data, updatedAt: new Date() })
        .where(and(
          eq(leadServicesTable.id, currentLink.id),
          eq(leadServicesTable.leadId, lead.id),
          isNull(leadServicesTable.removedAt),
        ))
        .returning();
      await tx.update(leadsTable).set({ updatedAt: new Date() }).where(eq(leadsTable.id, lead.id));
      await tx.insert(leadActivitiesTable).values({
        leadId: lead.id,
        actorId: req.userId,
        type: 'service_updated',
        detail: `Valores atualizados: ${currentLink.serviceName}`,
      });
      return { ...updatedLink, description: catalogService.description };
    });

    logger.info({ event: 'lead.service_updated', leadId: lead.id, leadServiceId: currentLink.id, actorId: req.userId }, 'Lead service updated');
    res.json({ leadService });
  } catch (error) {
    next(error);
  }
});

router.delete('/leads/:leadId/services/:leadServiceId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const parsedLeadId = leadIdSchema.safeParse(req.params.leadId);
    const parsedLeadServiceId = leadServiceIdSchema.safeParse(req.params.leadServiceId);
    if (!parsedLeadId.success || !parsedLeadServiceId.success) {
      res.status(400).json({ error: 'ID de lead ou serviço inválido.' });
      return;
    }
    const lead = await findAccessibleLead(parsedLeadId.data, req, res);
    if (!lead) return;
    const [currentLink] = await db.select().from(leadServicesTable).where(and(
      eq(leadServicesTable.id, parsedLeadServiceId.data),
      eq(leadServicesTable.leadId, lead.id),
      isNull(leadServicesTable.removedAt),
    ));
    if (!currentLink) {
      res.status(404).json({ error: 'Serviço não encontrado neste lead.' });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.update(leadServicesTable).set({ removedAt: new Date(), updatedAt: new Date() }).where(eq(leadServicesTable.id, currentLink.id));
      await tx.update(leadsTable).set({ updatedAt: new Date() }).where(eq(leadsTable.id, lead.id));
      await tx.insert(leadActivitiesTable).values({
        leadId: lead.id,
        actorId: req.userId,
        type: 'service_removed',
        detail: `Serviço removido do lead: ${currentLink.serviceName}`,
      });
    });

    logger.info({ event: 'lead.service_removed', leadId: lead.id, leadServiceId: currentLink.id, actorId: req.userId }, 'Service unlinked from lead');
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
