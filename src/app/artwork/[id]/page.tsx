"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function ArtworkPage() {
  const { id } = useParams();

  const [artwork, setArtwork] = useState<any>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      const res = await fetch(`/api/artworks/${id}`);
      const data = await res.json();
      setArtwork(data);
    };

    fetchArtwork();
  }, [id]);

  if (!artwork) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{artwork.title}</h1>

      <Image
        src={artwork.imageUrl}
        alt={artwork.title}
        width={600}
        height={400}
      />

      <p className="mt-4">{artwork.description}</p>
    </div>
  );
}