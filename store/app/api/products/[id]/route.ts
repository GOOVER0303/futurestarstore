import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { genId, now } from "@/lib/utils";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { requireAuth } from "@/lib/api-auth";

function parseProduct(p: any) {
  let sizes: string[] = [];
  let stock: Record<string, number> = {};
  let images: string[] = [];
  try { sizes = JSON.parse(p.sizes); } catch { sizes = []; }
  try { stock = JSON.parse(p.stock); } catch { stock = {}; }
  try { images = JSON.parse(p.images); } catch { images = []; }
  return { ...p, sizes, stock, images };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { db, schema } = await getDb();
  const raw = db.select().from(schema.products).where(eq(schema.products.id, id)).get();
  if (!raw) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

  const product = parseProduct(raw);
  const fieldValues = db.select().from(schema.productCustomValues).where(eq(schema.productCustomValues.productId, id)).all();
  const fieldDefs = db.select().from(schema.customFieldDefinitions).where(eq(schema.customFieldDefinitions.isActive, true)).all();
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

  const existing = db.select().from(schema.products).where(eq(schema.products.id, id)).get();
  if (!existing) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

  db.update(schema.products).set({
    title: title ?? existing.title,
    description: description ?? existing.description,
    price: price ?? existing.price,
    images: images != null ? JSON.stringify(images) : existing.images,
    sizes: sizes != null ? JSON.stringify(sizes) : existing.sizes,
    stock: stock != null ? JSON.stringify(stock) : existing.stock,
    categoryId: categoryId ?? existing.categoryId,
    isActive: isActive ?? existing.isActive,
    updatedAt: now(),
  }).where(eq(schema.products.id, id)).run();

  if (customFields && typeof customFields === "object") {
    db.delete(schema.productCustomValues).where(eq(schema.productCustomValues.productId, id)).run();
    for (const [fieldDefId, value] of Object.entries(customFields)) {
      if (value) {
        db.insert(schema.productCustomValues).values({
          id: genId(), productId: id, fieldDefinitionId: fieldDefId, value: String(value),
        }).run();
      }
    }
  }

  saveDb();
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { db, schema } = await getDb();
  const raw = db.select().from(schema.products).where(eq(schema.products.id, id)).get();
  if (!raw) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

  const product = parseProduct(raw);

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
  for (const img of product.images) {
    const fname = img.split("/").pop();
    if (fname) {
      const fp = path.join(uploadsDir, fname);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  }

  db.delete(schema.productCustomValues).where(eq(schema.productCustomValues.productId, id)).run();
  db.delete(schema.products).where(eq(schema.products.id, id)).run();
  saveDb();
  return NextResponse.json({ success: true });
}
