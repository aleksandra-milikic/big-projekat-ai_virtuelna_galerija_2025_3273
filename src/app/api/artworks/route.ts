import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
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
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== "CURATOR" && decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const artwork = await prisma.artwork.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        artist: body.artist,
        year: body.year,
        category: body.category,
        tags: body.tags || [],
        userId: decoded.userId,
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