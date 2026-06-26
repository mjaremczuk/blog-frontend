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
  const [isUploadingCover, setIsUploadingCover] = useState(false);

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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:8080/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      
      let url = "";
      if (data && data.success === 1 && data.file && data.file.url) {
        url = data.file.url;
      } else if (data && data.url) {
        url = data.url;
      } else if (typeof data === "string") {
        url = data;
      }

      if (url) {
        setCoverImageUrl(url);
      } else {
        throw new Error("Nie znaleziono adresu URL obrazka w odpowiedzi serwera.");
      }
    } catch (err) {
      console.error("Cover image upload failed:", err);
      setError("Nie udało się przesłać zdjęcia okładki. Spróbuj ponownie.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleRemoveCover = () => {
    setCoverImageUrl("");
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

        {/* Cover Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-neutral-300 block">
            Zdjęcie okładki (Opcjonalne)
          </label>
          
          {coverImageUrl ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border bg-neutral-900 group">
              <img
                src={coverImageUrl}
                alt="Podgląd okładki"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveCover}
                className="absolute top-2 right-2 p-2 rounded-full bg-neutral-950/80 border border-neutral-800 text-red-400 hover:text-red-300 hover:bg-neutral-900 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Usuń zdjęcie okładki"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.755.033-1.51.077-2.258.132a.75.75 0 0 0-.671.748v.063c0 .351.256.647.606.689.707.085 1.412.152 2.119.201v7.92c0 1.628 1.322 2.95 2.95 2.95h5.04c1.628 0 2.95-1.322 2.95-2.95v-7.92c.707-.05 1.412-.116 2.119-.201a.715.715 0 0 0 .606-.689v-.063a.75.75 0 0 0-.671-.748c-.748-.055-1.503-.099-2.258-.132V3.75A2.75 2.75 0 0 0 14.25 1h-5.5ZM7.5 3.75A1.25 1.25 0 0 1 8.75 2.5h5.5A1.25 1.25 0 0 1 15.5 3.75v.404c-.846.027-1.693.063-2.537.108V4.25a.75.75 0 0 1-1.5 0v.085c-.477.014-.954.032-1.428.056V4.25a.75.75 0 0 1-1.5 0v.135c-.844.045-1.691.081-2.537.108V3.75Z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="max-w-md">
              <label
                htmlFor="cover-upload-input"
                className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-border bg-card hover:bg-neutral-900/30 hover:border-neutral-700 transition-all cursor-pointer p-6 text-center group"
              >
                {isUploadingCover ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span className="text-xs text-muted-foreground">Przesyłanie zdjęcia okładki...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-neutral-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    </div>
                    <div className="text-sm font-medium text-neutral-300">Wgraj zdjęcie okładki</div>
                    <div className="text-xs text-muted-foreground">Przeciągnij i upuść lub kliknij, aby wybrać z dysku</div>
                  </div>
                )}
                <input
                  id="cover-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover || isLoading}
                  className="hidden"
                />
              </label>
            </div>
          )}
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
