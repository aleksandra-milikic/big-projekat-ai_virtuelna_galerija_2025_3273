"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";

type Artwork = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
};

export default function FavoritesPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  const [favorites, setFavorites] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");

      const favRes = await fetch("/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const favData = await favRes.json();

      const artRes = await fetch("/api/artworks");

      const artData = await artRes.json();

      const favoriteIds = favData.map(
        (f: any) => f.artworkId
      );

      const filtered = artData.filter((art: Artwork) =>
        favoriteIds.includes(art.id)
      );

      setFavorites(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchFavorites();
    }
  }, [authorized]);

  if (!authorized) {
    return null;
  }

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading favorites...
      </p>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        ❤️ My Favorites
      </h1>

      {favorites.length === 0 ? (
        <p className="text-gray-500">
          Nemate omiljenih umjetničkih djela
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {favorites.map((art) => (
            <Card
              key={art.id}
              id={art.id}
              title={art.title}
              description={art.description}
              imageUrl={art.imageUrl}
              liked={true}
              onToggle={() => {}}
              role="USER"
            />
          ))}
        </div>
      )}
    </div>
  );
}