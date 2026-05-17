import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json([], { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)


    const favorites = await prisma.favorite.findMany({
      where: { userId: decoded.userId },
      include: { artwork: true }
    })

    const likedArtworks = favorites.map(f => f.artwork)
    console.log("LIKED:", likedArtworks)

   const tagCount: Record<string, number> = {}

for (const art of likedArtworks) {
  for (const tag of art.tags || []) {
    tagCount[tag] = (tagCount[tag] || 0) + 1
  }
}
console.log("TAG COUNT:", tagCount)

    const all = await prisma.artwork.findMany()

    const scored = all.map(art => {
  let score = 0

  for (const tag of art.tags || []) {
    score += tagCount[tag] || 0
  }

  return { ...art, score }
})

    const likedIds = new Set(likedArtworks.map(a => a.id))

    console.log("SCORED:", scored)

    const filtered = scored
      .filter(a => !likedIds.has(a.id))
      .sort((a, b) => b.score - a.score)

    return NextResponse.json(filtered.slice(0, 10))

  } catch (err) {
    return NextResponse.json([])
  }
}