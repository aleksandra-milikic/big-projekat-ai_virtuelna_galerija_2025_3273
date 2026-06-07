import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

type ScoredArtwork = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  tags: string[];
  category: string | null;
  score: number;
};

const WEIGHTS = {
  FAVORITE: 5,
  LIKE: 3,
  VIEW: 0.3,
  SEARCH: 2,
  UNLIKE: -6,
};

const DIVERSITY_PENALTY = 0.15;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json([], { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { artwork: true },
    });

    const events = await prisma.userEvent.findMany({
      where: { userId },
    });

    const likedArtworkIds = new Set(favorites.map((f: { artworkId: any; }) => f.artworkId));

    const tagScore: Record<string, number> = {};
    const categoryScore: Record<string, number> = {};


    for (const fav of favorites) {
      for (const tag of fav.artwork.tags || []) {
        tagScore[tag] = (tagScore[tag] || 0) + WEIGHTS.FAVORITE;
      }

      if (fav.artwork.category) {
        categoryScore[fav.artwork.category] =
          (categoryScore[fav.artwork.category] || 0) + WEIGHTS.FAVORITE;
      }
    }


    for (const e of events) {
      const artworkIds = [e.artworkId].filter(Boolean);

      const artworks = await prisma.artwork.findMany({
        where: { id: { in: artworkIds } }
      });

      if (!artworks || artworks.length === 0) continue;

      const artwork = artworks[0];

      const apply = (weight: number) => {
        for (const tag of artwork.tags || []) {
          tagScore[tag] = (tagScore[tag] || 0) + weight;
        }

        if (artwork.category) {
          categoryScore[artwork.category] =
            (categoryScore[artwork.category] || 0) + weight;
        }
      };

      if (e.action === "LIKE") apply(WEIGHTS.LIKE);
      if (e.action === "VIEW") apply(WEIGHTS.VIEW);
      if (e.action === "UNLIKE") apply(WEIGHTS.UNLIKE);

      if (e.action === "SEARCH") {
        const term = (e.metadata || "").toLowerCase();

        for (const tag of artwork.tags || []) {
          if (term.includes(tag.toLowerCase())) {
            tagScore[tag] = (tagScore[tag] || 0) + WEIGHTS.SEARCH;
          }
        }
      }
    }

    const all = await prisma.artwork.findMany();

    const scored: ScoredArtwork[] = all.map(
  (art: {
    tags: string[];
    category: string | null;
    id: any;
    title: any;
    description: any;
    imageUrl: any;
  }) => {
      let raw = 0;

      const tags = art.tags || [];


      const tagWeight = tags.length > 0 ? 1 / Math.sqrt(tags.length) : 1;

      for (const tag of tags) {
        raw += (tagScore[tag] || 0) * tagWeight;
      }

      if (art.category) {
        raw += categoryScore[art.category] || 0;
      }

    
      const normalized = Math.tanh(raw / 10);

      
      const exploration = (Math.random() - 0.5) * 0.8;

      const finalScore = normalized + exploration;

      return {
        id: art.id,
        title: art.title,
        description: art.description,
        imageUrl: art.imageUrl,
        tags: art.tags,
        category: art.category,
        score: finalScore,
      };
    });

    const filtered = scored
      .filter((a) => !likedArtworkIds.has(a.id))
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(filtered.slice(0, 12));
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}