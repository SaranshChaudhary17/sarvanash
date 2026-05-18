import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@sarvanash.com";
const SESSION_TOKEN = process.env.SESSION_SECRET || "sarvanash-archive-token-2026";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ success: false, error: "Missing identity token." }, { status: 400 });
    }

    if (!FIREBASE_API_KEY) {
      return NextResponse.json({ success: false, error: "Firebase credentials missing on server." }, { status: 500 });
    }

    // Verify the Firebase ID Token using Google's secure Identity Toolkit API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ success: false, error: "Identity token verification failed." }, { status: 401 });
    }

    const data = await response.json();
    const verifiedEmail = data.users?.[0]?.email;

    if (verifiedEmail === ADMIN_EMAIL) {
      const res = NextResponse.json({ success: true });
      res.cookies.set("admin_session", SESSION_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
      return res;
    }

    return NextResponse.json({ success: false, error: "Unauthorized archive operator." }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Cryptographic decryption error." }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
