import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// In local development, allow the app to run without a database. When
// DATABASE_URL is missing, export undefined clients so callers can choose
// an alternative storage (e.g., in-memory) without crashing on import.
export let pool: Pool | undefined;
export let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "DATABASE_URL not set. Running without a database. In-memory features only.",
  );
}
