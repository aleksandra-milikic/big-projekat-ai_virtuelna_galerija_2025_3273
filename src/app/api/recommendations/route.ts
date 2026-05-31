import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type FavoriteWithArtwork = {
  artwork: {
    id: string;
    tags: string[];
  };
};

type ArtworkWithScore = {
  id: string;
  tags: string[];
  score: number;
};

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json([], { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const favorites: FavoriteWithArtwork[] = await prisma.favorite.findMany({
      where: { userId: decoded.userId },
      include: { artwork: true },
    });

    const likedArtworks = favorites.map((f: FavoriteWithArtwork) => f.artwork);

    const tagCount: Record<string, number> = {};

    for (const art of likedArtworks) {
      for (const tag of art.tags || []) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    }

    const all = await prisma.artwork.findMany();

    const scored: ArtworkWithScore[] = all.map((art: any) => {
      let score = 0;

      for (const tag of art.tags || []) {
        score += tagCount[tag] || 0;
      }

      return { ...art, score };
    });

    const likedIds = new Set(likedArtworks.map((a) => a.id));

    const filtered = scored
      .filter((a: ArtworkWithScore) => !likedIds.has(a.id))
      .sort((a: ArtworkWithScore, b: ArtworkWithScore) => b.score - a.score);

    return NextResponse.json(filtered.slice(0, 10));
  } catch {
    return NextResponse.json([]);
  }
}