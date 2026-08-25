import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

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
  await client.query(`
    DO $$
    DECLARE primary_key_name text;
    BEGIN
      SELECT constraint_name INTO primary_key_name
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'crm_users'
        AND constraint_type = 'PRIMARY KEY';
      IF primary_key_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE crm_users DROP CONSTRAINT %I', primary_key_name);
      END IF;
    END $$;
  `);
  await client.query(`
    ALTER TABLE crm_users
      ADD CONSTRAINT crm_users_pkey PRIMARY KEY (id)
  `);

  await client.query("ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_user_id integer");
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