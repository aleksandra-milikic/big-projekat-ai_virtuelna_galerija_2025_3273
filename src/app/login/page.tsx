"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/Input";
import Button from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", 
      });

      window.dispatchEvent(new Event("auth-change"));

setTimeout(() => {
  router.push("/gallery");
}, 50);

    } catch {
      setError("Server error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>

      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

      {error && <p className="text-red-500">{error}</p>}

      <Button label="Login" onClick={handleLogin} />
    </div>
  );
}