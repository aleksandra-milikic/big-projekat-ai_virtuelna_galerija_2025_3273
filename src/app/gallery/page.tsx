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
  const [search, setSearch] = useState("");

  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  
  const filteredArtworks = artworks.filter((art) => {
    const q = search.toLowerCase();

    return (
      art.title.toLowerCase().includes(q) ||
      art.description?.toLowerCase().includes(q)
    );
  });

  
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, []);

  
  const fetchArtworks = async (pageNumber = 1) => {
    try {
      const token = localStorage.getItem("token");

      const [artRes, favRes] = await Promise.all([
        fetch(`/api/artworks?page=${pageNumber}`),

        fetch("/api/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const artData = await artRes.json();
      const favData = await favRes.json();

      
      if (artData.length === 0) {
        setHasMore(false);
        return;
      }

      
      setArtworks((prev) => [...prev, ...artData]);

      
      setLikedIds(
        favData.map((f: any) => f.artworkId)
      );
    } catch {
      setError("Greška pri učitavanju galerije");
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (authorized) {
      fetchArtworks(page);
    }
  }, [authorized, page]);

  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prev) => prev + 1);
      }
    });

    const target = document.getElementById("scroll-end");

    if (target) {
      observer.observe(target);
    }

    return () => observer.disconnect();
  }, [hasMore]);

  
  const toggleFavorite = async (artworkId: string) => {
    const token = localStorage.getItem("token");

    const isLiked = likedIds.includes(artworkId);

    
    setLikedIds((prev) =>
      isLiked
        ? prev.filter((id) => id !== artworkId)
        : [...prev, artworkId]
    );

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ artworkId }),
      });

      const data = await res.json();

     
      if (data.liked !== !isLiked) {
        setLikedIds((prev) =>
          data.liked
            ? [...prev, artworkId]
            : prev.filter((id) => id !== artworkId)
        );
      }
    } catch (err) {
      console.log(err);

     
      setLikedIds((prev) =>
        isLiked
          ? [...prev, artworkId]
          : prev.filter((id) => id !== artworkId)
      );
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

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search artworks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* NO RESULTS */}
      {filteredArtworks.length === 0 ? (
        <p className="text-gray-500">
          No results found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredArtworks.map((art) => (
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

      {/* INFINITE SCROLL TARGET */}
      <div id="scroll-end" className="h-10" />
    </div>
  );
}