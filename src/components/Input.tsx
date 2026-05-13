import React from "react";

type InputProps = {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export default function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className}`}
    />
  );
}