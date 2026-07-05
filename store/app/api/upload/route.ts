import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

export async function POST(req: NextRequest) {
  if (!(await requireAuth())) return NextResponse.json({ error: "未登录" }, { status: 401 });
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "未收到文件" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 JPG/PNG/WebP 格式" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "products");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/products/${filename}`, filename });
  } catch (e) {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
