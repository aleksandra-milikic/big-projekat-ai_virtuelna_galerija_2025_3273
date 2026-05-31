"use client";

import { useEffect, useState } from "react";
import Card from "@/components/Card";

type Artwork = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  score?: number;
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
          setItems([]);
          return;
        }

        const data = await res.json();

        const filtered = (data || []).filter(
          (item: Artwork) => item.score && item.score > 0
        );

        setItems(filtered);
      } catch (err) {
        console.log(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Loading recommendations...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Nemate još dovoljno aktivnosti.
        <br />
        ❤️ Označite umjetnička djela u galeriji kao omiljena kako biste dobili preporuke.
      </div>
    );
  }

  const strong = items.filter((i) => (i.score ?? 0) > 2);
  const weak = items.filter((i) => (i.score ?? 0) <= 2);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        Preporučeno za vas
      </h1>

      <p className="text-gray-500 mb-4">
        Na osnovu vaših omiljenih umjetničkih djela
      </p>

      {strong.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">
            Preporučeno za vas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strong.map((art) => (
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
        </>
      )}

      {weak.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-2">
            Još prijedloga
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weak.map((art) => (
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
        </>
      )}
    </div>
  );
}