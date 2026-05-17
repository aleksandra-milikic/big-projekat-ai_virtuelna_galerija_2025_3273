"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
  const updateAuth = () => {
    const token = localStorage.getItem("token");

    setLoggedIn(!!token);

    if (token) {
      const decoded: any = jwtDecode(token);
      setRole(decoded.role);
    } else {
      setRole("");
    }
  };

  updateAuth();

  const interval = setInterval(updateAuth, 300);

  return () => clearInterval(interval);
}, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("token");

      window.dispatchEvent(new Event("authChange"));

      router.push("/login");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col relative">

        
        <header className="w-full border-b px-6 py-4 flex justify-between items-center">

          <Link href="/" className="font-bold text-indigo-600 text-xl">
            IVG Galerija
          </Link>

          <nav className="flex flex-wrap gap-4 text-sm items-center justify-end">

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

                <Link href="/register">Register</Link>
              </>
            )}

          </nav>
        </header>

        
        <main className="flex-1 px-6 py-10">
          {children}
        </main>

        
        <footer className="border-t px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} IVG
        </footer>

        <Toaster position="top-right" />

      </body>
    </html>
  );
}