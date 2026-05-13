import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserFromToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = getUserFromToken(req);

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "CURATOR" && user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const updatedArtwork = await prisma.artwork.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      galleryId: body.galleryId,
    },
  });

  return NextResponse.json(updatedArtwork);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = getUserFromToken(req);

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  await prisma.artwork.delete({
    where: { id: params.id },
  });

  return NextResponse.json({
    message: "Artwork deleted successfully",
  });
}