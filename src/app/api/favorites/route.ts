import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const favorites = await prisma.favorite.findMany({
  where: { userId: decoded.userId },
  include: {
    artwork: true
  }
});

    return NextResponse.json(favorites);
  } catch (err) {
    return NextResponse.json(
      { message: "Error fetching favorites" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "No token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

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
  } catch (err) {
    return NextResponse.json(
      { message: "Error toggling favorite" },
      { status: 500 }
    );
  }
}