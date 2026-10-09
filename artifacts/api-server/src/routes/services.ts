import { Router, type IRouter } from 'express';
import { and, asc, eq, isNull, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@workspace/db';
import { crmServicesTable, serviceBillingTypes } from '@workspace/db/schema';
import { requireCrmUser, requireRole } from '../middleware/require-auth';

const router: IRouter = Router();

const serviceFieldsSchema = z.object({
  name: z.string().trim().min(1).max(180),
  description: z.string().max(5000).optional(),
  scope: z.string().max(10000).optional(),
  basePrice: z.number().finite().min(0).max(9999999999.99).nullable().optional(),
  billingType: z.enum(serviceBillingTypes).nullable().optional(),
}).strict();

const updateServiceSchema = serviceFieldsSchema.partial().refine(
  (fields) => Object.keys(fields).length > 0,
  'Informe ao menos um campo para atualizar.',
);

router.use('/services', requireCrmUser);

router.get('/services', async (_req, res, next) => {
  try {
    const services = await db.select().from(crmServicesTable)
      .where(isNull(crmServicesTable.deletedAt))
      .orderBy(asc(crmServicesTable.id));
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

router.post('/services', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const parsed = serviceFieldsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Confira o nome, a descrição, o escopo e os valores do serviço.', details: parsed.error.flatten() });
      return;
    }

    const duplicate = await db.select({ id: crmServicesTable.id }).from(crmServicesTable).where(
      and(
        isNull(crmServicesTable.deletedAt),
        sql`lower(${crmServicesTable.name}) = lower(${parsed.data.name})`,
      ),
    ).limit(1);
    if (duplicate.length) {
      res.status(409).json({ error: 'Já existe um serviço ativo com esse nome.' });
      return;
    }

    const [service] = await db.insert(crmServicesTable).values({
      name: parsed.data.name,
      description: parsed.data.description ?? '',
      scope: parsed.data.scope ?? '',
      basePrice: parsed.data.basePrice ?? null,
      billingType: parsed.data.billingType ?? null,
    }).returning();
    res.status(201).json({ service });
  } catch (error) {
    next(error);
  }
});

router.patch('/services/:serviceId', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const serviceId = z.coerce.number().int().positive().parse(req.params.serviceId);
    const parsed = updateServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Confira os campos informados para o serviço.', details: parsed.error.flatten() });
      return;
    }

    const [currentService] = await db.select().from(crmServicesTable).where(
      and(eq(crmServicesTable.id, serviceId), isNull(crmServicesTable.deletedAt)),
    );
    if (!currentService) {
      res.status(404).json({ error: 'Serviço não encontrado.' });
      return;
    }

    if (parsed.data.name) {
      const duplicate = await db.select({ id: crmServicesTable.id }).from(crmServicesTable).where(
        and(
          isNull(crmServicesTable.deletedAt),
          ne(crmServicesTable.id, serviceId),
          sql`lower(${crmServicesTable.name}) = lower(${parsed.data.name})`,
        ),
      ).limit(1);
      if (duplicate.length) {
        res.status(409).json({ error: 'Já existe um serviço ativo com esse nome.' });
        return;
      }
    }

    const [service] = await db.update(crmServicesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(and(eq(crmServicesTable.id, serviceId), isNull(crmServicesTable.deletedAt)))
      .returning();
    res.json({ service });
  } catch (error) {
    next(error);
  }
});

router.delete('/services/:serviceId', requireRole('owner', 'admin'), async (req, res, next) => {
  try {
    const serviceId = z.coerce.number().int().positive().parse(req.params.serviceId);
    const [service] = await db.update(crmServicesTable)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(crmServicesTable.id, serviceId), isNull(crmServicesTable.deletedAt)))
      .returning({ id: crmServicesTable.id });
    if (!service) {
      res.status(404).json({ error: 'Serviço não encontrado.' });
      return;
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
