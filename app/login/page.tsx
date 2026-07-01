"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !password) {
      setError("Wszystkie pola są wymagane.");
      return;
    }

    setIsLoading(true);

    try {
      // API call saves token to cookies automatically via setTokenCookie
      await login({ email, password });
      setSuccess(true);
      
      // Briefly show success before redirecting to admin panel
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof Error) {
        // Map common errors like 401 Unauthorized
        const msg = err.message.toLowerCase();
        if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("credentials") || msg.includes("dane logowania")) {
          setError("Nieprawidłowy adres e-mail lub hasło.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Wystąpił nieoczekiwany błąd podczas logowania.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Panel Logowania</h1>
          <p className="text-sm text-muted-foreground">
            Zaloguj się do swojego konta, aby zarządzać wpisami.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-950/50 border border-red-900 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-950/50 border border-emerald-900 p-3 text-sm text-emerald-200">
            Zalogowano pomyślnie! Przekierowywanie do panelu...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-semibold text-neutral-300 uppercase tracking-wider"
            >
              Adres E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="twoj@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || success}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block"
            >
              Hasło
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || success}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-colors disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={isLoading || success}
          >
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>
      </div>

      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
            clipRule="evenodd"
          />
        </svg>
        Wróć do strony głównej
      </Link>
    </div>
  );
}
