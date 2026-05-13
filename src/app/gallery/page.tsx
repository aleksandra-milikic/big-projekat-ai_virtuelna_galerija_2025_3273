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

export default function GalleryPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [likedIds, setLikedIds] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, []);

  const fetchArtworks = async () => {
    try {
      const token = localStorage.getItem("token");

      const [artRes, favRes] = await Promise.all([
        fetch("/api/artworks"),

        fetch("/api/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const artData = await artRes.json();
      const favData = await favRes.json();

      setArtworks(artData);

      setLikedIds(
        favData.map((f: any) => f.artworkId)
      );
    } catch (err) {
      setError("Greška pri učitavanju galerije");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchArtworks();
    }
  }, [authorized]);

  const toggleFavorite = async (artworkId: string) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ artworkId }),
      });

      const data = await res.json();

      setLikedIds((prev) =>
        data.liked
          ? [...prev, artworkId]
          : prev.filter((id) => id !== artworkId)
      );
    } catch (err) {
      console.log(err);
    }
  };

  if (!authorized) {
    return null;
  }

  if (loading) {
    return (
      <p className="text-center mt-10">
        Loading gallery...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 mt-10">
        {error}
      </p>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">
        Gallery
      </h1>

      {artworks.length === 0 ? (
        <p className="text-gray-500">
          Nema umetničkih djela
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {artworks.map((art) => (
            <Card
              key={art.id}
              id={art.id}
              title={art.title}
              description={art.description}
              imageUrl={art.imageUrl}
              liked={likedIds.includes(art.id)}
              onToggle={toggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}