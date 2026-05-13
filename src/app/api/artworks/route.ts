import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const artworks = await prisma.artwork.findMany({
    include: {
      user: true,
      gallery: true,
    },
  });

  return NextResponse.json(artworks);
}