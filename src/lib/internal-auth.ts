import { headers } from "next/headers";

function getExpectedCredentials() {
  const username = process.env.INTERNAL_BASIC_AUTH_USERNAME?.trim();
  const password = process.env.INTERNAL_BASIC_AUTH_PASSWORD?.trim();
  return username && password ? { username, password } : null;
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
    return false;
  }
}

