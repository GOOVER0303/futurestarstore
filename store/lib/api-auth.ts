import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "future-star-store-secret-change-in-production"
);

export async function requireAuth() {
  try {
    const c = await cookies();
    const token = c.get("admin_token")?.value;
    if (!token) return false;
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}
