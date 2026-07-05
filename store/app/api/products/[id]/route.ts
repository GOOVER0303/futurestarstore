import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { genId, now } from "@/lib/utils";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { requireAuth } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, schema } = await getDb();
  const rows = await db.select().from(schema.products).where(eq(schema.products.id, id));
  const product = rows[0];
  if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

  const fieldValues = await db.select().from(schema.productCustomValues).where(eq(schema.productCustomValues.productId, id));
  const fieldDefs = await db.select().from(schema.customFieldDefinitions).where(eq(schema.customFieldDefinitions.isActive, true));
  const customFields: Record<string, string> = {};
  for (const v of fieldValues) {
    const def = fieldDefs.find((f) => f.id === v.fieldDefinitionId);
    if (def) customFields[def.name] = v.value;
  }

  return NextResponse.json({ ...product, customFields });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { title, description, price, images, sizes, stock, categoryId, isActive, customFields } = body;
  const { db, schema } = await getDb();

  const rows = await db.select().from(schema.products).where(eq(schema.products.id, id));
  const existing = rows[0];
  if (!existing) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

  await db.update(schema.products).set({
    title: title ?? existing.title,
    description: description ?? existing.description,
    price: price ?? existing.price,
    images: images ?? existing.images,
    sizes: sizes ?? existing.sizes,
    stock: stock ?? existing.stock,
    categoryId: categoryId ?? existing.categoryId,
    isActive: isActive ?? existing.isActive,
    updatedAt: now(),
  }).where(eq(schema.products.id, id));

  if (customFields && typeof customFields === "object") {
    await db.delete(schema.productCustomValues).where(eq(schema.productCustomValues.productId, id));
    for (const [fieldDefId, value] of Object.entries(customFields)) {
      if (value) {
        await db.insert(schema.productCustomValues).values({
          id: genId(), productId: id, fieldDefinitionId: fieldDefId, value: String(value),
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { db, schema } = await getDb();
  const rows = await db.select().from(schema.products).where(eq(schema.products.id, id));
  const product = rows[0];
  if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  if (product.images) {
    for (const img of product.images) {
      const fname = img.split("/").pop();
      if (fname) {
        const fp = path.join(uploadsDir, fname);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      }
    }
  }

  await db.delete(schema.productCustomValues).where(eq(schema.productCustomValues.productId, id));
  await db.delete(schema.products).where(eq(schema.products.id, id));

  return NextResponse.json({ success: true });
}