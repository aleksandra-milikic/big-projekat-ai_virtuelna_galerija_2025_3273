import React from "react";

type CardProps = {
  title: string;
  description?: string;
  imageUrl?: string;
};

export default function Card({
  title,
  description,
  imageUrl,
}: CardProps) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded"
        />
      )}

      <h2 className="text-lg font-bold mt-2">{title}</h2>

      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
  );
}