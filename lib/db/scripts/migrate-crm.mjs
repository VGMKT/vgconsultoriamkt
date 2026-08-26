import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
const quoteIdentifier = (value) => `"${String(value).replaceAll('"', '""')}"`;

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

  await client.query("COMMIT");
  console.log("CRM migration completed without deleting existing users.");
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  throw error;
} finally {
  await client.end();
}