import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
const quoteIdentifier = (value) => `"${String(value).replaceAll('"', '""')}"`;
const defaultServices = [
  {
    name: "Tráfego pago como consultoria",
    description: "Gestão de campanhas com visão estratégica da aquisição, analisando o caminho entre anúncios, geração de leads e vendas para identificar oportunidades de melhoria.",
  },
  {
    name: "Consultoria de Marketing",
    description: "Organização da estratégia, equipe, conteúdo e mídia, considerando o momento, os recursos e as metas da empresa para estruturar um marketing com direção e consistência.",
  },
  {
    name: "Internalização de Marketing",
    description: "Estruturação de uma operação própria de marketing, com equipe, processos e rotinas que aumentam a autonomia da empresa e reduzem a dependência de terceiros.",
  },
  {
    name: "Manager as a Service",
    description: "Liderança estratégica do marketing como extensão do negócio, conectando estratégia, equipe, parceiros e resultados.",
  },
  {
    name: "Branding e presença de marca",
    description: "Fortalecimento do posicionamento e da percepção da marca, construindo uma presença coerente para que a empresa seja reconhecida, lembrada e escolhida.",
  },
  {
    name: "Sites e Landing Pages",
    description: "Criação de presença digital que facilita a descoberta da empresa, comunica sua oferta com clareza e conduz o visitante à próxima etapa de contato ou conversão.",
  },
  {
    name: "Conteúdo para redes sociais",
    description: "Planejamento estratégico e produção de conteúdo para atrair atenção, reforçar a marca, gerar autoridade e comunicar com objetivos definidos.",
  },
];

try {
  await client.connect();
  await client.query("BEGIN");

  await client.query(`
    ALTER TABLE crm_users
      ADD COLUMN IF NOT EXISTS id integer,
      ADD COLUMN IF NOT EXISTS deleted_at timestamptz
  `);
  await client.query("CREATE SEQUENCE IF NOT EXISTS crm_users_id_seq");
  await client.query("ALTER SEQUENCE crm_users_id_seq OWNED BY crm_users.id");
  await client.query("ALTER TABLE crm_users ALTER COLUMN id SET DEFAULT nextval('crm_users_id_seq')");
  await client.query("UPDATE crm_users SET id = nextval('crm_users_id_seq') WHERE id IS NULL");
  await client.query(`
    SELECT setval(
      'crm_users_id_seq',
      COALESCE((SELECT MAX(id) FROM crm_users), 0) + 1,
      false
    )
  `);
  await client.query("ALTER TABLE crm_users ALTER COLUMN id SET NOT NULL");
  await client.query("ALTER TABLE crm_users ALTER COLUMN clerk_user_id DROP NOT NULL");

  const primaryKeyResult = await client.query(`
    SELECT
      c.conname AS constraint_name,
      array_agg(a.attname ORDER BY array_position(c.conkey, a.attnum)) AS columns
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid
      AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'crm_users'::regclass
      AND c.contype = 'p'
    GROUP BY c.conname
  `);
  const primaryKey = primaryKeyResult.rows[0];
  const primaryKeyColumns = primaryKey?.columns || [];
  const referencingForeignKeyResult = await client.query(`
    SELECT 1
    FROM pg_constraint
    WHERE confrelid = 'crm_users'::regclass
      AND contype = 'f'
    LIMIT 1
  `);
  const hasReferencingForeignKeys = referencingForeignKeyResult.rowCount > 0;
  if (!hasReferencingForeignKeys && (primaryKeyColumns.length !== 1 || primaryKeyColumns[0] !== 'id')) {
    if (primaryKey?.constraint_name) {
      await client.query(`ALTER TABLE crm_users DROP CONSTRAINT ${quoteIdentifier(primaryKey.constraint_name)}`);
    }
    await client.query("ALTER TABLE crm_users ADD CONSTRAINT crm_users_pkey PRIMARY KEY (id)");
  }

  await client.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_user_id integer");
  await client.query(`
    ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS utm_source varchar(255),
      ADD COLUMN IF NOT EXISTS utm_medium varchar(255),
      ADD COLUMN IF NOT EXISTS utm_campaign varchar(255),
      ADD COLUMN IF NOT EXISTS utm_term varchar(255),
      ADD COLUMN IF NOT EXISTS utm_content varchar(255),
      ADD COLUMN IF NOT EXISTS gclid varchar(500),
      ADD COLUMN IF NOT EXISTS fbclid varchar(500),
       ADD COLUMN IF NOT EXISTS ctwa_clid varchar(500),
      ADD COLUMN IF NOT EXISTS referrer varchar(1000),
       ADD COLUMN IF NOT EXISTS landing_page varchar(2000),
       ADD COLUMN IF NOT EXISTS objective varchar(160),
       ADD COLUMN IF NOT EXISTS marketing_budget varchar(80),
       ADD COLUMN IF NOT EXISTS ip_address varchar(64),
       ADD COLUMN IF NOT EXISTS latitude double precision,
       ADD COLUMN IF NOT EXISTS longitude double precision
  `);
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'leads'
          AND constraint_name = 'leads_assigned_user_id_fkey'
      ) THEN
        ALTER TABLE leads
          ADD CONSTRAINT leads_assigned_user_id_fkey
          FOREIGN KEY (assigned_user_id) REFERENCES crm_users(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS crm_services (
      id serial PRIMARY KEY,
      name varchar(180) NOT NULL,
      description text NOT NULL DEFAULT '',
      scope text NOT NULL DEFAULT '',
      base_price numeric(12, 2),
      billing_type varchar(20),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      deleted_at timestamptz
    )
  `);
  for (const service of defaultServices) {
    await client.query(
      `INSERT INTO crm_services (name, description, scope, base_price, billing_type)
       SELECT $1::varchar(180), $2::text, '', NULL, NULL
       WHERE NOT EXISTS (
         SELECT 1 FROM crm_services WHERE lower(name) = lower($1::varchar(180))
       )`,
      [service.name, service.description],
    );
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS lead_services (
      id serial PRIMARY KEY,
      lead_id integer NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      service_id integer NOT NULL REFERENCES crm_services(id) ON DELETE RESTRICT,
      service_name varchar(180) NOT NULL,
      price numeric(12, 2),
      billing_type varchar(20),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      removed_at timestamptz
    )
  `);
  await client.query(`
    CREATE INDEX IF NOT EXISTS lead_services_active_by_lead_idx
      ON lead_services (lead_id, created_at)
      WHERE removed_at IS NULL
  `);

  await client.query("COMMIT");
  console.log("CRM migration completed without deleting existing users, services, or lead-service history.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}