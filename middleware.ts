import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoutes = [
    "/login",
    "/register",
    "/",
    "/favicon.ico",
  ];

  const isPublic =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/debug");

  if (isPublic) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const role = payload.role as string | undefined;

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }


    if (pathname.startsWith("/analytics") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}