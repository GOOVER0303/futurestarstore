import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { genId, now, generateOrderNum } from "@/lib/utils";
import { requireAuth } from "@/lib/api-auth";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { db, schema } = await getDb();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const all = db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).all();
  const total = all.length;
  const items = all.slice((page - 1) * limit, page * limit);

  // Attach order items
  const ordersWithItems = items.map((o) => {
    const items = db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, o.id)).all();
    return { ...o, items };
  });

  return NextResponse.json({ items: ordersWithItems, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { customerName, customerPhone, customerAddress, customerNote, paymentMethod, items } = await req.json();

  if (!customerName || !customerPhone || !customerAddress || !items?.length) {
    return NextResponse.json({ error: "收货信息不可为空" }, { status: 400 });
  }

  const { db, schema } = await getDb();
  const id = genId();
  const orderNum = generateOrderNum();

  let totalAmount = 0;
  const orderItemRecords: typeof schema.orderItems.$inferInsert[] = [];

  for (const item of items) {
    const product = db.select().from(schema.products).where(eq(schema.products.id, item.productId)).get();
    if (!product) {
      return NextResponse.json({ error: `商品 ${item.productId} 不存在` }, { status: 400 });
    }
    const unitPrice = product.price;
    totalAmount += unitPrice * item.quantity;

    orderItemRecords.push({
      id: genId(),
      orderId: id,
      productId: product.id,
      productTitle: product.title,
      quantity: item.quantity,
      size: item.size || "",
      unitPrice,
    });

    // Deduct stock
    if (item.size && product.stock && (product.stock as Record<string, number>)[item.size]) {
      const newStock = { ...(product.stock as Record<string, number>) };
      newStock[item.size] = Math.max(0, newStock[item.size] - item.quantity);
      db.update(schema.products).set({ stock: newStock, updatedAt: now() }).where(eq(schema.products.id, product.id)).run();
    }
  }

  db.insert(schema.orders).values({
    id, orderNum, customerName, customerPhone, customerAddress,
    customerNote: customerNote || "", totalAmount,
    paymentMethod: paymentMethod || "offline",
    paymentStatus: "pending", orderStatus: "new", createdAt: now(),
  }).run();

  for (const oi of orderItemRecords) {
    db.insert(schema.orderItems).values(oi).run();
  }

  saveDb();
  return NextResponse.json({ id, orderNum, totalAmount }, { status: 201 });
}
