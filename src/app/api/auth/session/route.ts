import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminAuth,
  verifyAdminFromSessionCookie,
  verifyDecodedTokenIsAdmin,
} from "@/lib/firebase-admin";

const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

export async function GET() {
  const admin = await verifyAdminFromSessionCookie();
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, admin });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      idToken?: string;
    } | null;
    const idToken = body?.idToken;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing Firebase ID token." },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    if (!auth) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin SDK is not configured. Check server environment variables.",
        },
        { status: 503 }
      );
    }

    const decoded = await auth.verifyIdToken(idToken, true);
    const isAdmin = await verifyDecodedTokenIsAdmin(decoded);
    if (!isAdmin) {
      return NextResponse.json(
        {
          error:
            "Access denied: this account does not hold MJ PHOTOGRAPHY administrator privileges.",
        },
        { status: 403 }
      );
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const response = NextResponse.json({
      authenticated: true,
      admin: {
        uid: decoded.uid,
        email: decoded.email ?? "",
        name: decoded.name,
      },
    });

    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired authentication credentials." },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

