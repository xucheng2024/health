import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";

export const INTERNAL_AUTH_COOKIE = "internal_auth";

function buildSessionToken(username: string, password: string): string {
  return createHash("sha256")
    .update(`healthoptix:${username}:${password}`)
    .digest("hex");
}

function getExpectedCredentials() {
  const username = process.env.INTERNAL_BASIC_AUTH_USERNAME?.trim();
  const password = process.env.INTERNAL_BASIC_AUTH_PASSWORD?.trim();
  return username && password ? { username, password } : null;
}

export function getInternalSessionToken(): string | null {
  const expected = getExpectedCredentials();
  if (!expected) return null;
  return buildSessionToken(expected.username, expected.password);
}

export function isInternalAuthConfigured(): boolean {
  return getExpectedCredentials() !== null;
}

export async function hasInternalAccess(): Promise<boolean> {
  const expected = getExpectedCredentials();
  if (!expected) return false;

  const authHeader = (await headers()).get("authorization");
  if (!authHeader?.startsWith("Basic ")) return false;

  try {
    const decoded = Buffer.from(
      authHeader.slice("Basic ".length).trim(),
      "base64",
    ).toString("utf-8");
    const separator = decoded.indexOf(":");
    if (separator === -1) return false;

    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);

    return username === expected.username && password === expected.password;
  } catch {
    // fallthrough to cookie check
  }

  return false;
}

export async function hasInternalAccessOrCookie(): Promise<boolean> {
  if (await hasInternalAccess()) return true;
  const expectedSession = getInternalSessionToken();
  if (!expectedSession) return false;
  const cookieStore = await cookies();
  return cookieStore.get(INTERNAL_AUTH_COOKIE)?.value === expectedSession;
}

export function verifyInternalCredentials(
  username: string,
  password: string,
): boolean {
  const expected = getExpectedCredentials();
  if (!expected) return false;
  return username === expected.username && password === expected.password;
}
