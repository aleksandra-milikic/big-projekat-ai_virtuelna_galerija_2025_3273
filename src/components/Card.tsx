"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type CardProps = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  liked: boolean;
  role: "USER" | "ADMIN" | "CURATOR";
  onToggle: (id: string) => void;
};

export default function Card({
  id,
  title,
  description,
  imageUrl,
  liked,
  role,
  onToggle,
}: CardProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setZoom(1);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* CARD */}
      <div className="border rounded-lg p-4 shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative">
        {imageUrl && (
          <div
            onClick={() => setOpen(true)}
            className="relative w-full h-48 bg-gray-100 rounded overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
          >
            <Image
             src={imageUrl}
             alt={title}
             width={400}
             height={300}
             unoptimized
             loading="lazy"
             className="object-contain w-full h-48"
           />
          </div>
        )}

        <h2 className="font-bold mt-2">{title}</h2>

        {description && (
          <p className="text-sm text-gray-600">
            {description}
          </p>
        )}

        {/* ❤️ SAMO ZA USERA */}
        {role === "USER" && (
          <button
            onClick={() => onToggle(id)}
            className={`absolute top-2 right-2 text-2xl 
             transition-transform duration-200 hover:scale-125 active:scale-90 ${
             liked ? "text-red-500 scale-110" : "text-gray-400"
            }`}
          >
            {liked ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      {/* MODAL */}
      {open && imageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-200"
          onClick={() => {
            setOpen(false);
            setZoom(1);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90vw] h-[90vh]"
          >
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-contain rounded"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
        </div>
      )}
    </>
  );
}