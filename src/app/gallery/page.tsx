"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Card from "@/components/Card";
import DeleteModal from "@/components/DeleteModal";
import toast from "react-hot-toast";
import { Role } from "@prisma/client";

type Artwork = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;

  category?: string;   
  artist?: string;     
  year?: number;       
};

type DecodedToken = {
  userId: string;
  role: "USER" | "ADMIN" | "CURATOR";
};

export default function GalleryPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<Role>("USER");

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedArtworkId, setSelectedArtworkId] =
    useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

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

       fetchFavorites();
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
    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    const artRes = await fetch(`/api/artworks?page=${pageNumber}`);
    const artData = await artRes.json();

    if (artData.length < 15) {
      setHasMore(false);
    }

    setArtworks((prev) => {
  const map = new Map<string, Artwork>();

  prev.forEach((item) => map.set(item.id, item));
  artData.forEach((item: Artwork) => map.set(item.id, item));

  return Array.from(map.values());
});
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};

  useEffect(() => {
    if (!authorized) return;

    fetchArtworks(page);
  }, [authorized, page, role]);

  const deleteArtwork = async (artworkId: string) => {
    const token = localStorage.getItem("token");

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

        toast.success("Artwork deleted!");
      } else {
        toast.error("Delete failed!");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const toggleFavorite = async (artworkId: string) => {
    const token = localStorage.getItem("token");

    const isLiked = likedIds.includes(artworkId);

    await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artworkId }),
    });

    setLikedIds((prev) =>
      isLiked
        ? prev.filter((id) => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const fetchFavorites = async () => {
  const token = localStorage.getItem("token")

  const res = await fetch("/api/favorites", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const data = await res.json()

  const ids = data.map((f: any) => f.artworkId)
  setLikedIds(ids)
}

  if (!authorized) return null;

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <div className="animate-pulse text-gray-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <p className="text-center text-red-500 mt-10">
        {error}
      </p>
    );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">
        Gallery
      </h1>

      {/* ROLE INDICATOR */}
      <p className="text-sm text-gray-500 mb-4">
        Logged in as:{" "}
        <span className="font-semibold text-indigo-600">
          {role}
        </span>
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
              role={role}
            />

            {/* ADMIN DELETE */}
            {role === "ADMIN" && (
              <button
                onClick={() => {
                  setSelectedArtworkId(art.id);
                  setIsModalOpen(true);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                🗑 Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* EMPTY SEARCH */}
{filteredArtworks.length === 0 && search && (
  <div className="mt-8 text-center text-gray-400">
    <p className="text-lg font-medium">
      Nema rezultata
    </p>

    <p className="text-sm mt-1">
      Pokušajte sa drugačijim pojmom.
    </p>
  </div>
)}

      {/* LOAD MORE */}
      {hasMore && (
  <div className="flex justify-center mt-6">
    <button
      onClick={() => setPage((prev) => prev + 1)}
      disabled={loadingMore}
      className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
    >
      {loadingMore ? "Loading..." : "Load More"}
    </button>
  </div>
)}

      <div id="scroll-end" className="h-10" />

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async () => {
          if (!selectedArtworkId) return;

          await deleteArtwork(selectedArtworkId);

          setIsModalOpen(false);
          setSelectedArtworkId(null);
        }}
      />
    </div>
  );
}