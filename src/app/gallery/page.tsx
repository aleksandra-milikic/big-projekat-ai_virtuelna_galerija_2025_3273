"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import DeleteModal from "@/components/DeleteModal";
import toast from "react-hot-toast";

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
  const [role, setRole] = useState<DecodedToken["role"]>("USER");

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [likedIds, setLikedIds] = useState<string[]>([]);

  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        setRole(data.user.role);
        setAuthorized(true);

        fetchFavorites();
      } catch {
        router.push("/login");
      }
    };

    checkAuth();
  }, []);


  const fetchArtworks = async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/artworks?page=${pageNumber}`);
      const data = await res.json();

      if (data.length < 15) setHasMore(false);

      setArtworks((prev) => {
        const map = new Map<string, Artwork>();

        prev.forEach((item) => map.set(item.id, item));
        data.forEach((item: Artwork) => map.set(item.id, item));

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
  }, [authorized, page]);


  useEffect(() => {
    if (search.trim().length < 2) return;

    const timeout = setTimeout(() => {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "SEARCH",
          metadata: search.trim(),
        }),
      });
    }, 600);

    return () => clearTimeout(timeout);
  }, [search]);


  const trackView = async (artworkId: string) => {
    try {
      await fetch(`/api/artworks/${artworkId}`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const openArtwork = async (id: string) => {
    await trackView(id);
    router.push(`/artwork/${id}`);
  };


  const toggleFavorite = async (artworkId: string) => {
    const isLiked = likedIds.includes(artworkId);

    await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ artworkId }),
    });

    setLikedIds((prev) =>
      isLiked
        ? prev.filter((id) => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const fetchFavorites = async () => {
    const res = await fetch("/api/favorites", {
      credentials: "include",
    });

    const data = await res.json();
    setLikedIds(data.map((f: any) => f.artworkId));
  };


  const deleteArtwork = async (artworkId: string) => {
    try {
      const res = await fetch(`/api/artworks/${artworkId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setArtworks((prev) =>
          prev.filter((a) => a.id !== artworkId)
        );
        toast.success("Artwork deleted!");
      } else {
        toast.error("Delete failed!");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };


  const filteredArtworks = artworks.filter((art) => {
    const q = search.toLowerCase();

    return (
      art.title.toLowerCase().includes(q) ||
      art.description?.toLowerCase().includes(q)
    );
  });


  if (!authorized) return null;

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Gallery</h1>

      <p className="text-sm text-gray-500 mb-4">
        Logged in as:{" "}
        <span className="font-semibold text-indigo-600">
          {role}
        </span>
      </p>

      {role === "CURATOR" && (
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
        >
          ➕ Add Artwork
        </button>
      )}

      <input
        type="text"
        placeholder="Search artworks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md border px-3 py-2 rounded"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredArtworks.map((art) => (
          <div key={art.id} className="relative">
            <div onClick={() => openArtwork(art.id)}>
              <Card
                id={art.id}
                title={art.title}
                description={art.description}
                imageUrl={art.imageUrl}
                liked={likedIds.includes(art.id)}
                role={role}
                onToggle={toggleFavorite}
              />
            </div>

            {role === "ADMIN" && (
              <button
                onClick={() => {
                  setSelectedArtworkId(art.id);
                  setIsModalOpen(true);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Delete
              </button>
            )}

            {role === "CURATOR" && (
              <button
                onClick={() =>
                  router.push(`/dashboard/edit-artwork/${art.id}`)
                }
                className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs"
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredArtworks.length === 0 && search && (
        <p className="text-center mt-8 text-gray-400">
          Nema rezultata
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loadingMore}
            className="px-4 py-2 bg-black text-white rounded"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

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