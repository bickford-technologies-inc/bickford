import { Client } from "pg";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error(
    "DATABASE_URL is not set. Please set it in your environment variables.",
  );
  process.exit(1);
}

async function validateDb(url: string) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.query("SELECT 1");
    // Privilege check: try to create and drop a table
    await client.query(
      "CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY)",
    );
    await client.query("DROP TABLE test_table");
    await client.end();
    return true;
  } catch (err) {
    console.error("DB validation failed:", err.message);
    return false;
  }
}

(async () => {
  if (await validateDb(dbUrl)) {
    console.log(
      "Database credentials and privileges are valid. Running migration...",
    );
    const { stdout, stderr, exitCode } =
      await Bun.$`npx prisma migrate dev --name init-chat-ledger --schema=packages/ledger/prisma/schema.prisma`;
    if (exitCode === 0) {
      console.log("Migration successful:", stdout);
    } else {
      console.error("Migration failed:", stderr);
    }
  } else {
    console.error(
      "Invalid DB credentials or privileges. Please update DATABASE_URL and ensure the user has migration privileges.",
    );
    process.exit(1);
  }
})();
