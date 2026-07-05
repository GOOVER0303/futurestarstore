import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { now } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { db, schema } = await getDb();
  const order = db.select().from(schema.orders).where(eq(schema.orders.id, id)).get();
  if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  const items = db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id)).all();
  return NextResponse.json({ ...order, items });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { orderStatus, paymentStatus } = await req.json();
  const { db, schema } = await getDb();
  const existing = db.select().from(schema.orders).where(eq(schema.orders.id, id)).get();
  if (!existing) return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  db.update(schema.orders).set({
    orderStatus: orderStatus ?? existing.orderStatus,
    paymentStatus: paymentStatus ?? existing.paymentStatus,
  }).where(eq(schema.orders.id, id)).run();
  saveDb();
  return NextResponse.json({ success: true });
}
