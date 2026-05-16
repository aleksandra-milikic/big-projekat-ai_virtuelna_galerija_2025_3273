import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") || 1);
    const limit = 15;

    const skip = (page - 1) * limit;

    const artworks = await prisma.artwork.findMany({
      skip,
      take: limit,
      include: {
        user: true,
        gallery: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(artworks);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch artworks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "CURATOR" && user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const artwork = await prisma.artwork.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        userId: user.userId,
        galleryId: body.galleryId,
      },
    });

    return NextResponse.json(artwork, { status: 201 });

  } catch {
    return NextResponse.json(
      { message: "Failed to create artwork" },
      { status: 500 }
    );
  }
}