import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { genId } from "@/lib/utils";
import { requireAuth } from "@/lib/api-auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const { db, schema } = await getDb();
  const fields = await db.select().from(schema.customFieldDefinitions).orderBy(schema.customFieldDefinitions.sortOrder);
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
  await db.insert(schema.customFieldDefinitions).values({
    id, name, label, type, options: options || [], required: !!required, sortOrder: sortOrder || 0, isActive: true,
  });
  return NextResponse.json({ id, name, label, type }, { status: 201 });
}