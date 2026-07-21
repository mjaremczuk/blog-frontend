"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/Button";
import { createPost, updatePost, deletePost, getAllPosts, PostDto, API_BASE_URL } from "@/lib/api";
import { generateSlug } from "@/lib/utils/slug";
import { useOcrQueue } from "@/hooks/useOcrQueue";
import { CreationModeToggle } from "@/components/admin/CreationModeToggle";
import { OcrQueueManager } from "@/components/admin/OcrQueueManager";
import { CoverImageUploader } from "@/components/admin/CoverImageUploader";
import { ToastBanner } from "@/components/admin/ToastBanner";
import { PostListManager } from "@/components/admin/PostListManager";

const BlockEditor = dynamic(() => import("@/components/BlockEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full bg-card rounded-lg border border-border animate-pulse flex items-center justify-center text-xs text-muted-foreground">
      Loading block editor...
    </div>
  ),
});

interface AdminFormProps {
  token: string;
}

export default function AdminForm({ token }: AdminFormProps) {
  const router = useRouter();

  // Posts List State
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creationMode, setCreationMode] = useState<"manual" | "ocr">("manual");

  // UI Status State
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // References & Custom Hooks
  const blockEditorRef = useRef<any>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
  const {
    ocrFiles,
    isProcessingOcr,
    ocrProgress,
    ocrError,
    addFiles,
    moveFile,
    removeFile,
    clearQueue,
    processQueue,
  } = useOcrQueue();

  // Load existing posts on mount
  const loadPosts = async () => {
    try {
      const fetchedPosts = await getAllPosts(token);
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Failed to load posts:", err);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [token]);

  // Auto-generate URL slug on title change unless manually edited
  useEffect(() => {
    if (!isSlugManual) {
      setSlug(generateSlug(title));
    }
  }, [title, isSlugManual]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsSlugManual(true);
    setSlug(value);
    if (value === "") {
      setIsSlugManual(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload cover image.");
      }

      const data = await res.json();
      setCoverImageUrl(data.file.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleOcrProcessClick = () => {
    processQueue(async (newParagraphBlocks) => {
      let existingBlocks: any[] = [];
      try {
        if (content) {
          const parsed = JSON.parse(content);
          if (parsed.blocks && Array.isArray(parsed.blocks)) {
            existingBlocks = parsed.blocks;
          }
        }
      } catch (e) {
        // Ignore parse error on empty content
      }

      const combinedBlocks = [...existingBlocks, ...newParagraphBlocks];
      const finalEditorData = {
        time: Date.now(),
        blocks: combinedBlocks,
        version: "2.31.6",
      };

      if (blockEditorRef.current) {
        await blockEditorRef.current.renderBlocks(finalEditorData);
      } else {
        setContent(JSON.stringify(finalEditorData));
      }
    });
  };

  const handleStartEditPost = async (post: PostDto) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setIsSlugManual(true);
    setCoverImageUrl(post.coverImageUrl || "");
    setIsPrivate(post.isPrivate);
    setContent(post.content);
    setCreationMode("manual");
    setError("");

    try {
      if (post.content && blockEditorRef.current) {
        const parsed = JSON.parse(post.content);
        await blockEditorRef.current.renderBlocks(parsed);
      }
    } catch (e) {
      console.warn("Could not parse post content for EditorJS", e);
    }

    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = async () => {
    setEditingPostId(null);
    setTitle("");
    setSlug("");
    setIsSlugManual(false);
    setCoverImageUrl("");
    setContent("");
    setIsPrivate(false);
    setError("");

    if (blockEditorRef.current) {
      await blockEditorRef.current.clear();
    }
  };

  const handleDeletePost = async (post: PostDto) => {
    try {
      await deletePost(post.id, token);

      if (editingPostId === post.id) {
        await handleCancelEdit();
      }

      setSuccessMessage(`Post "${post.title}" has been deleted.`);
      await loadPosts();
      router.refresh();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while deleting the post.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!title || !slug || !content) {
      setError("Title, slug, and post content are required.");
      return;
    }

    setIsLoading(true);

    try {
      const postPayload = {
        title,
        slug,
        content,
        coverImageUrl: coverImageUrl || "",
        isPrivate,
      };

      if (editingPostId) {
        await updatePost(editingPostId, postPayload, token);
        setSuccessMessage("Post successfully updated!");
      } else {
        await createPost(postPayload, token);
        setSuccessMessage("Post successfully published!");
      }

      await handleCancelEdit();
      await loadPosts();
      router.refresh();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Save post error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving the post."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-8" ref={formTopRef}>
      {/* Toast Notification Banner (Bottom Right) */}
      <ToastBanner
        show={!!successMessage}
        message={successMessage}
        onClose={() => setSuccessMessage("")}
      />

      {error && (
        <div className="rounded-lg bg-red-950/50 border border-red-900 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Editing Mode Indicator Banner */}
      {editingPostId && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            <span className="text-sm font-semibold">Tryb edycji: Aktualizacja wpisu</span>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-xs text-neutral-400 hover:text-neutral-100 underline cursor-pointer"
          >
            Anuluj edycję i stwórz nowy wpis
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Slug Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-semibold text-neutral-300">
              Tytuł wpisu
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Wprowadzenie do programowania w Kotlin"
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-neutral-700 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className="text-sm font-semibold text-neutral-300">
              Slug URL
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="np. wprowadzenie-do-programowania-w-kotlin"
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:border-neutral-700 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Rich Drag & Drop Cover Image Upload Section */}
        <CoverImageUploader
          coverImageUrl={coverImageUrl}
          isUploadingCover={isUploadingCover}
          onUpload={handleCoverUpload}
          onRemove={() => setCoverImageUrl("")}
          disabled={isLoading || isProcessingOcr}
        />

        {/* Private Post Access Checkbox */}
        <div className="flex items-center space-x-2">
          <input
            id="isPrivate"
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-border text-emerald-500 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="isPrivate" className="text-sm font-medium text-neutral-300 cursor-pointer">
            Wpis prywatny (dostępny tylko po zalogowaniu)
          </label>
        </div>

        {/* Creation Mode Tabs */}
        <CreationModeToggle mode={creationMode} onModeChange={setCreationMode} />

        {/* OCR Photo Queue Manager Section (Visible in OCR Mode) */}
        {creationMode === "ocr" && (
          <OcrQueueManager
            ocrFiles={ocrFiles}
            isProcessingOcr={isProcessingOcr}
            ocrProgress={ocrProgress}
            ocrError={ocrError}
            onFilesChange={(e) => addFiles(Array.from(e.target.files || []))}
            onMoveFile={moveFile}
            onRemoveFile={removeFile}
            onClearQueue={clearQueue}
            onProcessOcr={handleOcrProcessClick}
          />
        )}

        {/* Block Editor Section (ALWAYS VISIBLE in both modes) */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-neutral-300">
            Treść wpisu (Edytor blokowy)
          </label>
          <BlockEditor
            ref={blockEditorRef}
            value={content}
            onChange={(val) => setContent(val)}
            disabled={isLoading || isProcessingOcr}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={handleLogout}>
            Wyloguj
          </Button>

          <div className="flex items-center space-x-3">
            {editingPostId && (
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Anuluj edycję
              </Button>
            )}
            <Button type="submit" disabled={isLoading || isProcessingOcr}>
              {isLoading
                ? "Zapisywanie..."
                : editingPostId
                ? "Aktualizuj artykuł"
                : "Zapisz i opublikuj artykuł"}
            </Button>
          </div>
        </div>
      </form>

      <PostListManager
        posts={posts}
        isLoading={isLoading}
        editingPostId={editingPostId}
        onEditPost={handleStartEditPost}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
}
