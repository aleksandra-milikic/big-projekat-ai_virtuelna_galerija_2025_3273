"use client";

import { useEffect, useState } from "react";

type CardProps = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  liked: boolean;
  onToggle: (id: string) => void;
};

export default function Card({
  id,
  title,
  description,
  imageUrl,
  liked,
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
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <>
      {/* CARD */}
      <div className="border rounded-lg p-4 shadow relative">
        {imageUrl && (
          <img
            src={imageUrl}
            onClick={() => setOpen(true)}
            className="w-full h-48 object-contain bg-gray-100 rounded cursor-pointer hover:scale-[1.02] transition"
          />
        )}

        <h2 className="font-bold mt-2">{title}</h2>

        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}

        <button
          onClick={() => onToggle(id)}
          className={`absolute top-2 right-2 text-2xl transition ${
            liked ? "text-red-500 scale-110" : "text-gray-400"
          }`}
        >
          {liked ? "❤️" : "🤍"}
        </button>
      </div>

      {/* MODAL */}
      {open && imageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => {
            setOpen(false);
            setZoom(1);
          }}
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* zoom controls */}
            <div className="absolute top-2 right-2 flex gap-2 z-50">
              <button
                className="bg-white px-2 py-1 rounded"
                onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              >
                +
              </button>
              <button
                className="bg-white px-2 py-1 rounded"
                onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}
              >
                -
              </button>
            </div>

            <img
              src={imageUrl}
              alt={title}
              style={{
                transform: `scale(${zoom})`,
              }}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded transition-transform duration-200"
            />
          </div>
        </div>
      )}
    </>
  );
}