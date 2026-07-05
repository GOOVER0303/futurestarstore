import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db-schema";

const sql = neon(process.env.POSTGRES_URL!);

export async function getDb() {
  const db = drizzle(sql, { schema });
  return { db, schema };
}