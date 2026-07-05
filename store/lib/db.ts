import initSqlJs from "sql.js";
import type { Database as SqlJsDatabase } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./db-schema";
import * as fs from "fs";
import * as path from "path";

const DB_PATH = path.join(process.cwd(), "data", "store.db");

let sqlJsDb: SqlJsDatabase | null = null;
let ormDb: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (ormDb) return { db: ormDb, schema };

  const SQL = await initSqlJs();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqlJsDb = new SQL.Database(buffer);
  } else {
    sqlJsDb = new SQL.Database();
  }

  ormDb = drizzle(sqlJsDb, { schema });
  return { db: ormDb, schema };
}

export function saveDb() {
  if (!sqlJsDb) return;
  const data = sqlJsDb.export();
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export function getRawDb(): SqlJsDatabase {
  if (!sqlJsDb) throw new Error("Database not initialized");
  return sqlJsDb;
}
