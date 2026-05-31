import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 px-6 py-10">{children}</main>

        <footer className="border-t px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} IVG
        </footer>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}