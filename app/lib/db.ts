import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Database operations will fail. Please set DATABASE_URL environment variable.",
  );
}

export const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL }) : null;
export const db = pool ? drizzle(pool, { schema }) : null;

