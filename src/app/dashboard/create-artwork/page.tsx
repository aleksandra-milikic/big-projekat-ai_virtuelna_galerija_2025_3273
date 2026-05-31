"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";

export default function CreateArtworkPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");

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

      const role = data.user.role; // 🔥 FIX

      setRole(role);

      if (role !== "CURATOR") {
        router.push("/dashboard");
        return;
      }

      setAuthorized(true);
    } catch {
      router.push("/login");
    }
  };

  checkAuth();
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/artworks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title,
        description,
        imageUrl,
        artist,
        year: year ? Number(year) : null,
        category,
      }),
    });

    if (res.ok) {
      router.push("/gallery");
    }
  };

  if (!authorized) return null;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Add Artwork (Curator)
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="text"
          placeholder="Image URL"
          className="w-full border p-2 rounded"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <Input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
        <Input placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Create Artwork
        </button>
      </form>
    </div>
  );
}