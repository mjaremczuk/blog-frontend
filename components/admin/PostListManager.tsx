"use client";

import React, { useState } from "react";
import { PostDto } from "@/lib/api";

interface PostListManagerProps {
  posts: PostDto[];
  isLoading: boolean;
  editingPostId: string | null;
  onEditPost: (post: PostDto) => void;
  onDeletePost: (post: PostDto) => Promise<void>;
}

export function PostListManager({
  posts,
  isLoading,
  editingPostId,
  onEditPost,
  onDeletePost,
}: PostListManagerProps) {
  const [deletingPost, setDeletingPost] = useState<PostDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      await onDeletePost(deletingPost);
      setDeletingPost(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-200">
            Zarządzaj opublikowanymi artykułami
          </h3>
          <p className="text-xs text-neutral-400">
            Lista wszystkich postów z opcją edycji oraz usuwania.
          </p>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
          Wszystkie wpisy: {posts.length}
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl bg-card text-xs text-neutral-500">
          Brak opublikowanych wpisów. Twój pierwszy post pojawi się tutaj.
        </div>
      ) : (
        <div className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-card overflow-hidden">
          {posts.map((post) => {
            const isBeingEdited = editingPostId === post.id;
            return (
              <div
                key={post.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 transition-colors ${
                  isBeingEdited ? "bg-emerald-950/20 border-l-4 border-l-emerald-500" : "hover:bg-neutral-900/40"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {post.coverImageUrl ? (
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-800 shrink-0 bg-neutral-950"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-neutral-800 bg-neutral-900 shrink-0 flex items-center justify-center text-neutral-500 text-xs font-bold">
                      Brak
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-neutral-200 truncate">
                        {post.title}
                      </h4>
                      {post.isPrivate && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-amber-300">
                          Prywatny
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 truncate">
                      /{post.slug} • {new Date(post.createdAt).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => onEditPost(post)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                      isBeingEdited
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800"
                    }`}
                  >
                    {isBeingEdited ? "Edytowanie" : "Edytuj"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingPost(post)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-950 bg-red-950/40 hover:bg-red-950/80 text-red-300 transition-all cursor-pointer"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal Dialog for Post Deletion */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 space-y-4 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2 rounded-full bg-red-950 border border-red-900">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-neutral-100">
                Potwierdzenie usunięcia artykułu
              </h3>
            </div>

            <p className="text-xs text-neutral-300">
              Czy na pewno chcesz usunąć artykuł <strong className="text-white">"{deletingPost.title}"</strong>? 
              Tej operacji nie można cofnąć.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Usuwanie...</span>
                  </>
                ) : (
                  <span>Tak, usuń artykuł</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
