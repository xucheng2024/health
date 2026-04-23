import { NextResponse } from "next/server";
import {
  INTERNAL_AUTH_COOKIE,
  getInternalSessionToken,
  isInternalAuthConfigured,
  verifyInternalCredentials,
} from "@/lib/internal-auth";

export const dynamic = "force-dynamic";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  if (!isInternalAuthConfigured()) {
    return NextResponse.json({ error: "Internal auth is not configured." }, { status: 500 });
  }

  const body = (await request.json()) as LoginBody;
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!verifyInternalCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = getInternalSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Unable to create session." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: INTERNAL_AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
