import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as jose from "jose";
import { getSql } from "./db";

const COOKIE_NAME = "admin_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("[auth] AUTH_SECRET environment variable is missing.");
  }
  return new TextEncoder().encode(secret);
}

export interface AdminUser {
  id: number;
  username: string;
  must_change: boolean;
}

export interface AdminJWTPayload {
  userId: number;
  username: string;
}

/**
 * Signs a JWT with 7-day expiry using jose and HS256 algorithm.
 */
export async function signAdminToken(payload: AdminJWTPayload): Promise<string> {
  const secret = getSecretKey();
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * Verifies a JWT token. Returns payload or null if invalid/expired.
 */
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof payload.userId === "number" && typeof payload.username === "string") {
      return {
        userId: payload.userId,
        username: payload.username,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Reads the admin_session cookie and checks user in DB.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(COOKIE_NAME)?.value;
    if (!sessionToken) return null;

    const payload = await verifyAdminToken(sessionToken);
    if (!payload) return null;

    const sql = getSql();
    const rows = (await sql`
      SELECT id, username, must_change
      FROM admin_users
      WHERE id = ${payload.userId}
      LIMIT 1
    `) as Record<string, any>[];

    if (!rows || rows.length === 0) return null;
    return {
      id: rows[0].id,
      username: rows[0].username,
      must_change: Boolean(rows[0].must_change),
    };
  } catch {
    return null;
  }
}

/**
 * Enforces admin authorization. Redirects to /admin/login if not authenticated.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  return admin;
}

/**
 * Sets the admin session cookie on response.
 */
export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears the admin session cookie.
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
