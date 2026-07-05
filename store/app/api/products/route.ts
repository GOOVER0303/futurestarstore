import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { genId, now } from "@/lib/utils";
import { requireAuth } from "@/lib/api-auth";
import { eq, like, and, desc } from "drizzle-orm";

function parseProduct(p: any) {
  let sizes: string[] = [];
  let stock: Record<string, number> = {};
  let images: string[] = [];
  try { sizes = JSON.parse(p.sizes); } catch { sizes = []; }
  try { stock = JSON.parse(p.stock); } catch { stock = {}; }
  try { images = JSON.parse(p.images); } catch { images = []; }
  return { ...p, sizes, stock, images };
}

export async function GET(req: NextRequest) {
  const { db, schema } = await getDb();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "12");
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");
  const admin = url.searchParams.get("admin") === "1";

  let conditions = [];
  if (!admin) conditions.push(eq(schema.products.isActive, true));
  if (category) conditions.push(eq(schema.products.categoryId, category));
  if (search) conditions.push(like(schema.products.title, `%${search}%`));

  const base = db.select().from(schema.products).where(and(...conditions));
  const total = base.all().length;
  const raw = base.orderBy(desc(schema.products.createdAt)).limit(limit).offset((page - 1) * limit).all();

  const items = raw.map((p) => {
    const parsed = parseProduct(p);
    const fieldValues = db.select().from(schema.productCustomValues).where(eq(schema.productCustomValues.productId, p.id)).all();
    const fieldDefs = db.select().from(schema.customFieldDefinitions).where(eq(schema.customFieldDefinitions.isActive, true)).all();
    const customFields: Record<string, string> = {};
    for (const v of fieldValues) {
      const def = fieldDefs.find((f) => f.id === v.fieldDefinitionId);
      if (def) customFields[def.name] = v.value;
    }
    return { ...parsed, customFields };
  });

  return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const body = await req.json();
  const { title, description, price, images, sizes, stock, categoryId, customFields } = body;

  if (!title || price == null) {
    return NextResponse.json({ error: "商品名称和价格必填" }, { status: 400 });
  }

  const { db, schema } = await getDb();
  const id = genId();
  const ts = now();

  db.insert(schema.products).values({
    id, title, description: description || "", price,
    images: JSON.stringify(images || []),
    sizes: JSON.stringify(sizes || []),
    stock: JSON.stringify(stock || {}),
    categoryId: categoryId || null, isActive: true,
    createdAt: ts, updatedAt: ts,
  }).run();

  if (customFields && typeof customFields === "object") {
    for (const [fieldDefId, value] of Object.entries(customFields)) {
      if (value) {
        db.insert(schema.productCustomValues).values({
          id: genId(), productId: id, fieldDefinitionId: fieldDefId, value: String(value),
        }).run();
      }
    }
  }

  saveDb();
  return NextResponse.json({ id }, { status: 201 });
}
