"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type Artwork = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  score?: number;
  isAiFeatured?: boolean;
  aiNotes?: string | null;
};

export default function RecommendationsPage() {
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/recommendations", {
          credentials: "include",
        });

        if (!res.ok) {
          setError("Failed to load recommendations");
          return;
        }

        const data = await res.json();

        setItems(data || []);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading recommendations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Not enough interactions yet to generate recommendations.
      </div>
    );
  }

  const sorted = [...items].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );

  const strong = sorted.slice(0, 4);
  const weak = sorted.slice(4);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2">
        Recommended Artworks
      </h1>

      <p className="text-gray-500 mb-6">
        Recommendations are personalized based on your previous interactions
      </p>

      {strong.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3">
            🔥 Top Recommendations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strong.map((art) => (
              <div key={art.id} className="bg-white p-3 rounded-xl shadow flex flex-col justify-between">
                <div>
                  <div className="text-xs text-green-600 mb-1">
                    High confidence
                  </div>

                  <div className="text-xs text-gray-400 mb-2">
                    Recommended based on your interests
                  </div>

                  <Card {...art} liked={false} onToggle={() => {}} role="USER" />
                </div>

                {/* --- AI CURATOR NOTE BOX --- */}
                {art.isAiFeatured && art.aiNotes && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs italic shadow-inner">
                    <span className="font-semibold not-italic block text-amber-950 mb-1">
                      ✨ AI Curator's Note:
                    </span>
                    "{art.aiNotes}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {weak.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">
            💡 Explore Something New
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weak.map((art) => (
              <div key={art.id} className="bg-white p-3 rounded-xl shadow-sm">
                <div className="text-xs text-blue-500 mb-1">
                  Low confidence / discovery
                </div>

                <div className="text-xs text-gray-400 mb-2">
                  Suggested for exploring new art styles
                </div>

                <Card {...art} liked={false} onToggle={() => {}} role="USER" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
