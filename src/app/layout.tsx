"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
<Link href="/dashboard">Dashboard</Link>

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    setLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("token");

      setLoggedIn(false);

      router.push("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">

        {/* NAVBAR */}
        <header className="w-full border-b px-6 py-4 flex justify-between items-center">

          <Link
            href="/"
            className="font-bold text-indigo-600 text-xl"
          >
            IVG Galerija
          </Link>

          <nav className="flex gap-4 text-sm items-center">

            <Link href="/">Home</Link>

            {loggedIn ? (
              <>
                <Link href="/gallery">Gallery</Link>

                <Link href="/favorites">
                  Favorites
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>

                <Link href="/register">
                  Register
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* CONTENT */}
        <main className="flex-1 px-6 py-10">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} IVG
        </footer>

      </body>
    </html>
  );
}