"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function EditArtworkPage() {
  const router = useRouter();
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(`/api/artworks/${id}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        setTitle(data.title || "");
        setDescription(data.description || "");
        setImageUrl(data.imageUrl || "");
        setArtist(data.artist || "");
        setYear(data.year ? String(data.year) : "");
        setCategory(data.category || "");
      } catch {
        router.push("/gallery");
      }
    };

    fetchArtwork();
  }, [id]);

  const handleUpdate = async () => {
    await fetch(`/api/artworks/${id}`, {
      method: "PUT",
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

    router.push("/gallery");
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Edit Artwork</h1>

      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      <Input value={artist} onChange={(e) => setArtist(e.target.value)} />
      <Input value={year} onChange={(e) => setYear(e.target.value)} />
      <Input value={category} onChange={(e) => setCategory(e.target.value)} />

      <Button label="Update Artwork" onClick={handleUpdate} />
    </div>
  );
}