"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/Button";
import { createPost } from "@/lib/api";

const BlockEditor = dynamic(() => import("@/components/BlockEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-card rounded-lg border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
      Ładowanie edytora blokowego...
    </div>
  ),
});

interface AdminFormProps {
  token: string;
}

export default function AdminForm({ token }: AdminFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to generate URL-safe slugs with support for Polish characters
  const generateSlug = (text: string) => {
    const polishChars: { [key: string]: string } = {
      ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
      Ą: "a", Ć: "c", Ę: "e", Ł: "l", Ń: "n", Ó: "o", Ś: "s", Ź: "z", Ż: "z",
    };

    let normalized = text;
    for (const char in polishChars) {
      normalized = normalized.replaceAll(char, polishChars[char]);
    }

    return normalized
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric chars (except spaces and hyphens)
      .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/-+/g, "-"); // Deduplicate hyphens
  };

  // Automatically update slug on title change, unless user manually edited the slug field
  useEffect(() => {
    if (!isSlugManual) {
      setSlug(generateSlug(title));
    }
  }, [title, isSlugManual]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsSlugManual(true);
    setSlug(value);
    
    // If user clears the slug, let it auto-generate again on next title change
    if (value === "") {
      setIsSlugManual(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title || !slug || !content) {
      setError("Tytuł, slug oraz treść posta są wymagane.");
      return;
    }

    setIsLoading(true);

    try {
      await createPost(
        {
          title,
          slug,
          content,
          coverImageUrl: coverImageUrl || "",
          isPrivate,
        },
        token
      );

      setSuccess(true);
      
      // Clear form values
      setTitle("");
      setSlug("");
      setIsSlugManual(false);
      setCoverImageUrl("");
      setContent("");
      setIsPrivate(false);

      // Refresh page in Next.js router to clear cache and show new post on home page
      router.refresh();
    } catch (err) {
      console.error("Create post error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Wystąpił nieoczekiwany błąd podczas publikacji artykułu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Delete the token cookie client-side
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-900 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-950/50 border border-emerald-900 p-4 text-sm text-emerald-200">
          Artykuł został pomyślnie opublikowany!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-semibold text-neutral-300">
              Tytuł posta
            </label>
            <input
              id="title"
              type="text"
              placeholder="Wpisz tytuł artykułu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className="text-sm font-semibold text-neutral-300">
              Slug (URL artykułu)
            </label>
            <input
              id="slug"
              type="text"
              placeholder="auto-generowany-slug"
              value={slug}
              onChange={handleSlugChange}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-colors disabled:opacity-50 font-mono"
            />
          </div>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-1.5">
          <label htmlFor="coverImageUrl" className="text-sm font-semibold text-neutral-300">
            Adres URL zdjęcia okładki (Opcjonalny)
          </label>
          <input
            id="coverImageUrl"
            type="url"
            placeholder="https://images.unsplash.com/... (pozostaw puste dla domyślnego)"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-colors disabled:opacity-50"
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-neutral-300">
            Treść posta (Edytor blokowy)
          </label>
          <BlockEditor
            value={content}
            onChange={(val) => setContent(val)}
            disabled={isLoading}
          />
        </div>

        {/* Checkbox: Private */}
        <div className="flex items-center space-x-3">
          <input
            id="isPrivate"
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-border bg-card text-accent focus:ring-accent focus:ring-offset-neutral-900 focus:ring-offset-2 transition-colors cursor-pointer"
          />
          <label htmlFor="isPrivate" className="text-sm text-neutral-300 select-none cursor-pointer">
            Oznacz jako post prywatny (widoczny tylko dla Ciebie jako administratora)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            disabled={isLoading}
            className="text-red-400 hover:text-red-300 border-red-950 hover:bg-red-950/30"
          >
            Wyloguj się
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={isLoading}
            >
              Anuluj
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Publikowanie..." : "Opublikuj post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
