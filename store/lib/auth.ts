import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "future-star-store-secret-change-in-production"
);

const COOKIE_NAME = "admin_token";

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(): Promise<{ username: string } | null> {
  try {
    const c = await cookies();
    const token = c.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400,
  });
}

export async function clearAuthCookie() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}
