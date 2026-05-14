"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Card from "@/components/Card";

type Artwork = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
};

type DecodedToken = {
  userId: string;
  role: "USER" | "ADMIN" | "CURATOR";
};

export default function GalleryPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string>("");

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setRole(decoded.role);
      setAuthorized(true);
    } catch {
      router.push("/login");
    }
  }, []);

  const filteredArtworks = artworks.filter((art) => {
    const q = search.toLowerCase();

    return (
      art.title.toLowerCase().includes(q) ||
      art.description?.toLowerCase().includes(q)
    );
  });

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

      setLikedIds(favData.map((f: any) => f.artworkId));
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

  const deleteArtwork = async (artworkId: string) => {
  const token = localStorage.getItem("token");

  const confirmed = confirm(
    "Da li ste sigurni da želite da obrišete artwork?"
  );

  if (!confirmed) return;

  try {
    const res = await fetch(`/api/artworks/${artworkId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setArtworks((prev) =>
        prev.filter((art) => art.id !== artworkId)
      );
    }
  } catch (error) {
    console.log(error);
  }
};


  const toggleFavorite = async (artworkId: string) => {
    
    const token = localStorage.getItem("token");

    const isLiked = likedIds.includes(artworkId);

    setLikedIds((prev) =>
      isLiked
        ? prev.filter((id) => id !== artworkId)
        : [...prev, artworkId]
    );

    await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artworkId }),
    });
  };

  if (!authorized) return null;

  if (loading) return <p className="text-center mt-10">Loading gallery...</p>;

  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Gallery</h1>

      {/* ROLE INDICATOR) */}
      <p className="text-sm text-gray-500 mb-4">
        Logged in as:{" "}
        <span className="font-semibold text-indigo-600">{role}</span>
      </p>

      {/* CURATOR ACTION */}
{role === "CURATOR" && (
  <button
    onClick={() => router.push("/dashboard")}
    className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
  >
    ➕ Add Artwork
  </button>
)}

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search artworks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border px-3 py-2 rounded"
      />

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {filteredArtworks.map((art) => (
    <div key={art.id} className="relative">

      <Card
        id={art.id}
        title={art.title}
        description={art.description}
        imageUrl={art.imageUrl}
        liked={likedIds.includes(art.id)}
        onToggle={toggleFavorite}
      />

      {/* ADMIN DELETE */}
      {role === "ADMIN" && (
        <button
          onClick={() => deleteArtwork(art.id)}
          className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          🗑 Delete
        </button>
      )}

    </div>
  ))}
</div>

      <div id="scroll-end" className="h-10" />
    </div>
  );
}