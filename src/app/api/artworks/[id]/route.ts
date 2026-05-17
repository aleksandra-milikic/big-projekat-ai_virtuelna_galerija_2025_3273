import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const user = getUserFromToken(req);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "CURATOR" && user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.title || !body.imageUrl) {
      return NextResponse.json(
        { message: "Title and imageUrl are required" },
        { status: 400 }
      );
    }

  const updatedArtwork = await prisma.artwork.update({
    where: { id },
    data: {
    title: body.title,
    description: body.description,
    imageUrl: body.imageUrl,
    artist: body.artist,
    year: body.year,
    category: body.category,
    tags: body.tags,
    galleryId: body.galleryId || null,
    },
  });

  return NextResponse.json(updatedArtwork);
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const artwork = await prisma.artwork.findUnique({
    where: { id },
  });

  if (!artwork) {
    return NextResponse.json(
      { message: "Artwork not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(artwork);
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const user = getUserFromToken(req);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.artwork.delete({
    where: { id },
  });

  return NextResponse.json({
    message: "Artwork deleted successfully",
  });
}