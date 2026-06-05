import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(null, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);

    const userId = (payload as any).userId;
    const role = (payload as any).role;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}