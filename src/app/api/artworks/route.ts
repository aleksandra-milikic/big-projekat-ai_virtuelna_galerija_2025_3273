import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const artworks = await prisma.artwork.findMany({
      include: {
        user: true,
        gallery: true,
      },
    });

    return NextResponse.json(artworks);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch artworks" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      imageUrl,
      userId,
      galleryId,
    } = body;

    const artwork = await prisma.artwork.create({
      data: {
        title,
        description,
        imageUrl,
        userId,
        galleryId,
      },
    });

    return NextResponse.json(artwork, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create artwork" },
      { status: 500 }
    );
  }
}