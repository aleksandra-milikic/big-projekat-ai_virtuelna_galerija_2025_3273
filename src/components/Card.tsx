"use client";

import { useState, useEffect } from "react";

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
  return (
    <div className="border rounded-lg p-4 shadow relative">
      {imageUrl && (
        <img
         src={imageUrl}
         className="w-full h-48 object-contain bg-gray-100 rounded"
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
  );
}