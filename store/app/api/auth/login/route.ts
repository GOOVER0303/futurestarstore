import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb, saveDb } from "@/lib/db";
import { createToken, setAuthCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "请输入用户名和密码" }, { status: 400 });
  }

  const { db, schema } = await getDb();
  const user = db.select().from(schema.users).where(eq(schema.users.username, username)).get();

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  const token = await createToken(username);
  await setAuthCookie(token);
  return NextResponse.json({ success: true, username: user.username });
}
