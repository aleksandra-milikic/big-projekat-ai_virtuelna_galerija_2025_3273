"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";

type DecodedToken = {
  userId: string;
  role: "USER" | "ADMIN" | "CURATOR";
};

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setRole(decoded.role);
    } catch (error) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>

      <p className="text-gray-600 mb-8">
        Ulogovan kao:{" "}
        <span className="font-semibold text-indigo-600">
          {role}
        </span>
      </p>

      
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/gallery"
          className="p-5 border rounded-xl hover:shadow"
        >
          🎨 Gallery
        </Link>

        {role === "USER" && (
  <Link
    href="/favorites"
    className="p-5 border rounded-xl hover:shadow"
  >
    ❤️ Favorites
  </Link>
)}

</div>

      
      {role === "CURATOR" && (
        <div className="p-6 border rounded-xl bg-blue-50">
          <h2 className="font-bold text-lg">CURATOR PANEL</h2>

          <p className="text-gray-600 mb-4">
            Dodavanje i upravljanje umjetničkim djelima.
          </p>

          <Link
            href="/dashboard/create-artwork"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded"
          >
             Add Artwork
          </Link>
        </div>
      )}
    </div>
  );
}