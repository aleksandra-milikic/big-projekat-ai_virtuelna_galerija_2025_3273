"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "CURATOR" | "ADMIN";
};

export default function Navbar() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string>("");
  const [authKey, setAuthKey] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setLoggedIn(false);
          setRole("");
          return;
        }

        const data = await res.json();
        const user: User = data.user;

        setLoggedIn(true);
        setRole(user.role);
      } catch {
        setLoggedIn(false);
        setRole("");
      }
    };

    checkAuth();

    const handler = () => checkAuth();

    window.addEventListener("auth-change", handler);

    return () => {
      window.removeEventListener("auth-change", handler);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setLoggedIn(false);
    setRole("");

    router.push("/login");
    router.refresh();
  };

  return (
    <header className="w-full border-b px-6 py-4 flex justify-between items-center">
      <Link href="/" className="font-bold text-indigo-600 text-xl">
        IVG Galerija
      </Link>

      <nav className="flex gap-4 text-sm items-center">
        <Link href="/">Home</Link>

        {loggedIn ? (
          <>
            <Link href="/gallery">Gallery</Link>

            {role === "USER" && (
              <>
                <Link href="/favorites">Favorites</Link>
                <Link href="/recommendations">Recommendations</Link>
              </>
            )}

            {role === "ADMIN" && (
              <>
                <Link href="/analytics" className="text-yellow-500 font-bold">
                  Analytics
                </Link>
              </>
            )}

            <button onClick={handleLogout} className="text-red-500">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}