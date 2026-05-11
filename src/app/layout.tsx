import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">

        {/* NAVBAR */}
        <header className="w-full border-b px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-indigo-600 text-xl">
            IVG Galerija
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link href="/">Home</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </nav>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-6 py-10">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} IVG - Virtuelna galerija
        </footer>

      </body>
    </html>
  );
}