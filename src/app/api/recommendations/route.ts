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
      const artworkIds = e.artworkId ? [e.artworkId] : [];

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

    const topCandidates = filtered.slice(0, 12); 

    
    let aiCuratorNotes = "Recommended based on your aesthetic preferences and interactions.";
    let featuredId = topCandidates[0]?.id || null;

        
    try {
      if (topCandidates.length > 0) {
        
        const bestArt = topCandidates[0];
        featuredId = bestArt.id;

        
        const COLOR_KEYWORDS = ["red", "blue", "dark", "night", "light", "gold", "white", "black", "shadow", "warm", "cold"];
        const STYLE_KEYWORDS = ["oil painting", "realism", "portrait", "impressionism", "abstract", "sculpture", "modernism", "classic"];
        
        
        let favoriteColors: string[] = [];
        let favoriteStyles: string[] = [];
        let favoriteMotifs: string[] = [];

        
        const userInteractedArtworkIds = new Set([
          ...favorites.map(f => f.artworkId),
          ...events.filter(e => e.action === "LIKE" || e.action === "VIEW").map(e => e.artworkId)
        ]);

        const interactedArtworks = await prisma.artwork.findMany({
         
          where: { id: { in: Array.from(userInteractedArtworkIds).filter(Boolean) as string[] } }
        });

        
        for (const art of interactedArtworks) {
          for (const tag of art.tags || []) {
            if (!tag) continue; 
            const cleanTag = tag.toLowerCase().trim();
            if (COLOR_KEYWORDS.includes(cleanTag)) {
              if (!favoriteColors.includes(cleanTag)) favoriteColors.push(cleanTag);
            } else if (STYLE_KEYWORDS.includes(cleanTag)) {
              if (!favoriteStyles.includes(cleanTag)) favoriteStyles.push(cleanTag);
            } else {
              if (!favoriteMotifs.includes(cleanTag)) favoriteMotifs.push(cleanTag);
            }
          }
        }

        
        const bestArtTags: string[] = (bestArt.tags || [])
          .filter((t): t is string => !!t)
          .map((t: string) => t.toLowerCase().trim());
          
        const currentCategory = bestArt.category ? bestArt.category.toLowerCase().trim() : "";

        const matchingColors = bestArtTags.filter((t: string) => favoriteColors.includes(t));
        const matchingStyles = bestArtTags.filter((t: string) => favoriteStyles.includes(t));
        const matchingMotifs = bestArtTags.filter((t: string) => favoriteMotifs.includes(t));

        
        let semanticExplanation = "";

        if (matchingStyles.length > 0 || currentCategory) {
          const styleName = matchingStyles.length > 0 ? matchingStyles[0] : currentCategory;
          semanticExplanation += `Following your affinity for the art style and technique of ${styleName}, the system recognized a similar artistic hand and aesthetic. `;
        }

        if (matchingColors.length > 0) {
          semanticExplanation += `The visual tonality of this piece connects directly to the atmosphere and color palette (dominant tones: ${matchingColors.join(", ")}) that you observed the longest in previous scenes. `;
        }

        if (matchingMotifs.length > 0) {
          semanticExplanation += `Regarding the theme itself, the artwork contains motifs and symbols such as the subtle element of '${matchingMotifs[0]}', aligning with your recent searches and interest within the virtual space. `;
        }

        
        if (!semanticExplanation) {
          semanticExplanation = `This artwork is recommended to you because it successfully combines the artistic styles and thematic concepts you have explored, offering a natural aesthetic continuation of your gallery visit.`;
        }

        aiCuratorNotes = semanticExplanation.trim();
      }
    } catch (localError) {
      console.error("Local semantic curator error:", localError);
    }

   
    const finalResponse = topCandidates.map(art => ({
      ...art,
      aiNotes: art.id === featuredId ? aiCuratorNotes : null,
      isAiFeatured: art.id === featuredId
    }));

    return NextResponse.json(finalResponse);

  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}

