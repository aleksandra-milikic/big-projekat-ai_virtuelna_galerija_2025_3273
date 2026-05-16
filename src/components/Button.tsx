import React from "react";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

export default function Button({
  label,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-200 active:scale-95 ${className}`}
    >
      {label}
    </button>
  );
}