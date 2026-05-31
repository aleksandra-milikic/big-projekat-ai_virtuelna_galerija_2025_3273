"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
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
  const [role, setRole] = useState<DecodedToken['role']>("USER");

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

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

  // FETCH ALL (SEARCH MODE)
  const fetchAllArtworks = async () => {
    try {
      let allData: Artwork[] = [];
      let currentPage = 1;
      let hasNext = true;

      while (hasNext) {
        const res = await fetch(`/api/artworks?page=${currentPage}`);
        const data = await res.json();

        allData = [...allData, ...data];

        if (data.length < 15) hasNext = false;
        else currentPage++;
      }

      setArtworks(allData);
      setAllLoaded(true);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!authorized) return;
    fetchArtworks(page);
  }, [authorized, page, role]);

  useEffect(() => {
    if (search && !allLoaded) {
      fetchAllArtworks();
    }
  }, [search]);

  const deleteArtwork = async (artworkId: string) => {
  try {
    const res = await fetch(`/api/artworks/${artworkId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setArtworks((prev) => prev.filter((a) => a.id !== artworkId));
      toast.success("Artwork deleted!");
    } else {
      toast.error("Delete failed!");
    }
  } catch {
    toast.error("Something went wrong");
  }
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
    const ids = data.map((f: any) => f.artworkId);

    setLikedIds(ids);
  };

  if (!authorized) return null;

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="animate-pulse text-gray-500 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-500 mt-10">{error}</p>
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
            <Card
              id={art.id}
              title={art.title}
              description={art.description}
              imageUrl={art.imageUrl}
              liked={likedIds.includes(art.id)}
              onToggle={toggleFavorite}
              role={role}
            />

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
        <div className="mt-8 text-center text-gray-400">
          <p className="text-lg font-medium">Nema rezultata</p>
          <p className="text-sm mt-1">
            Pokušajte sa drugačijim pojmom.
          </p>
        </div>
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