import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const favorites = await prisma.favorite.findMany({
      where: { userId: decoded.userId },
      include: { artwork: true },
    });

    return NextResponse.json(favorites);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const { artworkId } = await req.json();

    const existing = await prisma.favorite.findFirst({
      where: {
        userId: decoded.userId,
        artworkId,
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ liked: false });
    }

    await prisma.favorite.create({
      data: {
        userId: decoded.userId,
        artworkId,
      },
    });

    return NextResponse.json({ liked: true });
  } catch {
    return NextResponse.json(
      { message: "Error toggling favorite" },
      { status: 500 }
    );
  }
}