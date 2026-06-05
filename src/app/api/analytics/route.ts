import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const scoreMap: Record<string, number> = {
  VIEW: 1,
  LIKE: 3,
  UNLIKE: -2,
  SEARCH: 2,
};

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload as any;
  } catch {
    return null;
  }
}

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const events = await prisma.userEvent.findMany({
    select: {
      userId: true,
      action: true,
      artworkId: true,
    },
  });

  const views = events.filter((e: { action: string }) => e.action === "VIEW");
  const likes = events.filter((e: { action: string }) => e.action === "LIKE");
  const unlikes = events.filter((e: { action: string }) => e.action === "UNLIKE");

  const searchEvents = await prisma.userEvent.findMany({
    where: { action: "SEARCH" },
    select: {
      metadata: true,
    },
  });

  const userMap: Record<
    string,
    { userId: string; activity: number; name: string }
  > = {};

  for (const e of events) {
    if (!userMap[e.userId]) {
      const user = await prisma.user.findUnique({
        where: { id: e.userId },
        select: { name: true, email: true },
      });

      userMap[e.userId] = {
        userId: e.userId,
        name: user?.name || user?.email || "Unknown",
        activity: 0,
      };
    }

    userMap[e.userId].activity += scoreMap[e.action] || 1;
  }

  const activeUsers = Object.values(userMap);

  const viewsGrouped = await prisma.userEvent.groupBy({
    by: ["artworkId"],
    where: { action: "VIEW" },
    _count: { _all: true },
  });

  const likesGrouped = await prisma.userEvent.groupBy({
    by: ["artworkId"],
    where: { action: "LIKE" },
    _count: { _all: true },
  });

  const unlikesGrouped = await prisma.userEvent.groupBy({
    by: ["artworkId"],
    where: { action: "UNLIKE" },
    _count: { _all: true },
  });

  const viewsWithData = await Promise.all(
    viewsGrouped.map(async (v: any) => {
      const art = await prisma.artwork.findUnique({
        where: { id: v.artworkId! },
      });

      return {
        artworkId: v.artworkId,
        title: art?.title || "Unknown",
        imageUrl: art?.imageUrl || "",
        views: v._count._all,
      };
    })
  );

  const likesWithData = await Promise.all(
    likesGrouped.map(async (l: any) => {
      const art = await prisma.artwork.findUnique({
        where: { id: l.artworkId! },
      });

      return {
        artworkId: l.artworkId,
        title: art?.title || "Unknown",
        imageUrl: art?.imageUrl || "",
        likes: l._count._all,
      };
    })
  );

  const unlikesWithData = await Promise.all(
    unlikesGrouped.map(async (u: any) => {
      const art = await prisma.artwork.findUnique({
        where: { id: u.artworkId! },
      });

      return {
        artworkId: u.artworkId,
        title: art?.title || "Unknown",
        imageUrl: art?.imageUrl || "",
        unlikes: u._count._all,
      };
    })
  );


  const searchMap: Record<string, number> = {};

  for (const s of searchEvents) {
    const term = s.metadata || "unknown";
    searchMap[term] = (searchMap[term] || 0) + 1;
  }

  const searchStats = Object.entries(searchMap)
    .map(([term, count]) => ({
      term,
      count,
    }))
    .sort((a, b) => b.count - a.count);


  const artworks = await prisma.artwork.findMany({
    select: {
      category: true,
    },
  });

  const categoryMap: Record<string, number> = {};

  for (const a of artworks) {
    const cat = a.category || "Unknown";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  }

  const categoryStats = Object.entries(categoryMap)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);


  const totalEvents = events.length;
  const totalSearches = searchEvents.length;

  return NextResponse.json({
    views: viewsWithData,
    likes: likesWithData,
    unlikes: unlikesWithData,
    activeUsers,

    searches: searchStats,

    totalEvents,
    totalSearches,
    categories: categoryStats,
  });
}