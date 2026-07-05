import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { label, type, options, required, sortOrder, isActive } = await req.json();
  const { db, schema } = await getDb();
  const existing = db.select().from(schema.customFieldDefinitions).where(eq(schema.customFieldDefinitions.id, id)).get();
  if (!existing) return NextResponse.json({ error: "字段不存在" }, { status: 404 });

  db.update(schema.customFieldDefinitions).set({
    label: label ?? existing.label,
    type: type ?? existing.type,
    options: options ?? existing.options,
    required: required ?? existing.required,
    sortOrder: sortOrder ?? existing.sortOrder,
    isActive: isActive ?? existing.isActive,
  }).where(eq(schema.customFieldDefinitions.id, id)).run();
  saveDb();
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { db, schema } = await getDb();
  db.delete(schema.productCustomValues).where(eq(schema.productCustomValues.fieldDefinitionId, id)).run();
  db.delete(schema.customFieldDefinitions).where(eq(schema.customFieldDefinitions.id, id)).run();
  saveDb();
  return NextResponse.json({ success: true });
}