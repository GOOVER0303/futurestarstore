import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { genId } from "@/lib/utils";
import { requireAuth } from "@/lib/api-auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const { db, schema } = await getDb();
  const raw = db.select().from(schema.customFieldDefinitions).orderBy(schema.customFieldDefinitions.sortOrder).all();
  const fields = raw.map(f => {
    let options: string[] = [];
    try { options = JSON.parse(f.options as string); } catch {}
    return { ...f, options };
  });
  return NextResponse.json(fields);
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { name, label, type, options, required, sortOrder } = await req.json();
  if (!name || !label || !type) {
    return NextResponse.json({ error: "字段名、标签和类型必填" }, { status: 400 });
  }
  const { db, schema } = await getDb();
  const id = genId();
  db.insert(schema.customFieldDefinitions).values({
    id, name, label, type, options: options || [], required: !!required, sortOrder: sortOrder || 0, isActive: true,
  }).run();
  saveDb();
  return NextResponse.json({ id, name, label, type }, { status: 201 });
}