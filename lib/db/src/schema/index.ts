import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const leadStatuses = ['new', 'contacted', 'meeting', 'proposal', 'won', 'lost'] as const;
export type LeadStatus = (typeof leadStatuses)[number];
export const leadSources = ['google', 'meta_ads', 'organic', 'site', 'manual', 'referral', 'active_offer', 'other'] as const;
export type LeadSource = (typeof leadSources)[number];
export const manualLeadSources = ['manual', 'referral', 'active_offer', 'other'] as const;
export type ManualLeadSource = (typeof manualLeadSources)[number];
export const crmRoles = ['owner', 'admin', 'manager', 'operator'] as const;
export type CrmRole = (typeof crmRoles)[number];

export const leadsTable = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 40 }).notNull(),
  company: varchar('company', { length: 180 }),
  service: varchar('service', { length: 100 }),
  message: text('message'),
  source: varchar('source', { length: 80 }).notNull().default('site'),
  utmSource: varchar('utm_source', { length: 255 }),
  utmMedium: varchar('utm_medium', { length: 255 }),
  utmCampaign: varchar('utm_campaign', { length: 255 }),
  utmTerm: varchar('utm_term', { length: 255 }),
  utmContent: varchar('utm_content', { length: 255 }),
  gclid: varchar('gclid', { length: 500 }),
  fbclid: varchar('fbclid', { length: 500 }),
  referrer: varchar('referrer', { length: 1000 }),
  landingPage: varchar('landing_page', { length: 2000 }),
  status: varchar('status', { length: 20 }).notNull().default('new'),
  assignedUserId: integer('assigned_user_id').references(() => crmUsersTable.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const leadNotesTable = pgTable('lead_notes', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').notNull().references(() => leadsTable.id, { onDelete: 'cascade' }),
  authorId: varchar('author_id', { length: 255 }).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const leadActivitiesTable = pgTable('lead_activities', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').notNull().references(() => leadsTable.id, { onDelete: 'cascade' }),
  actorId: varchar('actor_id', { length: 255 }),
  type: varchar('type', { length: 40 }).notNull(),
  detail: text('detail'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const crmUsersTable = pgTable('crm_users', {
  id: serial('id').primaryKey(),
  clerkUserId: varchar('clerk_user_id', { length: 255 }),
  email: varchar('email', { length: 320 }).notNull(),
  name: varchar('name', { length: 240 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('operator'),
  active: integer('active').notNull().default(1),
  invitedAt: timestamp('invited_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Lead = typeof leadsTable.$inferSelect;
export type LeadNote = typeof leadNotesTable.$inferSelect;
export type LeadActivity = typeof leadActivitiesTable.$inferSelect;
export type CrmUser = typeof crmUsersTable.$inferSelect;