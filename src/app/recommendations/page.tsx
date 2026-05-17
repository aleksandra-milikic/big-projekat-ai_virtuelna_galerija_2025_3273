"use client"

import { useEffect, useState } from "react"
import Card from "@/components/Card"

export default function RecommendationsPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token")

      const res = await fetch("/api/recommendations", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      const filtered = (data || []).filter(
  (item: any) => item.score > 0
)

setItems(filtered)
    }

    fetchData()
  }, [])

  if (!items) return null

if (items.length === 0) {
  return (
    <div className="text-center mt-10 text-gray-500">
      You don’t have enough activity yet.
      <br />
      ❤️ Like artworks in Gallery to get recommendations
    </div>
  )
}

  const strong = items.filter((i: any) => i.score > 2)
  const weak = items.filter((i: any) => i.score <= 2)

  return (
    <div className="p-4">

      <h1 className="text-2xl font-bold">
        Recommended for you
      </h1>

      <p className="text-gray-500">
        Based on your liked artworks
      </p>

      {/* STRONG */}
      <h2 className="text-xl font-bold mt-6 mb-2">
        🔥 Top picks for you
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strong.map((art: any) => (
          <div key={art.id} className="relative">

            <p className="text-xs text-indigo-500 mb-1">
              Recommended match
            </p>

            <Card
              id={art.id}
              title={art.title}
              description={art.description}
              imageUrl={art.imageUrl}
              liked={false}
              onToggle={() => {}}
              role="USER"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {weak.map((art: any) => (
          <Card
            key={art.id}
            id={art.id}
            title={art.title}
            description={art.description}
            imageUrl={art.imageUrl}
            liked={false}
            onToggle={() => {}}
            role="USER"
          />
        ))}
      </div>

    </div>
  )
}