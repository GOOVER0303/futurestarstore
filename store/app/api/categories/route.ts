import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { genId } from "@/lib/utils";
import { requireAuth } from "@/lib/api-auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const { db, schema } = await getDb();
  const cats = db.select().from(schema.categories).orderBy(schema.categories.sortOrder).all();
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { name, slug } = await req.json();
  if (!name) return NextResponse.json({ error: "分类名必填" }, { status: 400 });
  const { db, schema } = await getDb();
  const id = genId();
  db.insert(schema.categories).values({ id, name, slug: slug || name, sortOrder: 0 }).run();
  saveDb();
  return NextResponse.json({ id, name, slug: slug || name });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少分类ID" }, { status: 400 });
  const { db, schema } = await getDb();
  db.delete(schema.categories).where(eq(schema.categories.id, id)).run();
  saveDb();
  return NextResponse.json({ success: true });
}
