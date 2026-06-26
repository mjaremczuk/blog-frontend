"use client";

import React, { useState } from "react";

interface GalleryBlockProps {
  urls: string[];
}

export default function GalleryBlock({ urls }: GalleryBlockProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  if (!urls || urls.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : urls.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex((prev) => (prev !== null && prev < urls.length - 1 ? prev + 1 : 0));
  };

  // Determine grid layout based on number of images
  const getGridLayout = () => {
    const count = urls.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
  };

  return (
    <div className="my-8 space-y-4">
      {/* Photo Grid */}
      <div className={`grid gap-4 ${getGridLayout()}`}>
        {urls.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setActiveImageIndex(idx)}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-neutral-900 cursor-pointer shadow-sm hover:border-neutral-700 transition-all duration-300"
          >
            <img
              src={url}
              alt={`Zdjęcie w galerii ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-3 rounded-full bg-neutral-900/90 border border-neutral-700 text-white shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M9 6a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5A.75.75 0 0 1 9 6Z" />
                  <path
                    fillRule="evenodd"
                    d="M2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Zm7-5.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom Overlay */}
      {activeImageIndex !== null && (
        <div
          onClick={() => setActiveImageIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in cursor-zoom-out"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Zamknij"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation - Prev */}
          {urls.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 p-3 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-450 hover:text-white hover:bg-neutral-850 transition-colors cursor-pointer"
              aria-label="Poprzednie zdjęcie"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* Active Image Container */}
          <div className="relative max-w-5xl max-h-[85vh] flex flex-col items-center select-none">
            <img
              src={urls[activeImageIndex]}
              alt={`Powiększone zdjęcie ${activeImageIndex + 1}`}
              className="object-contain max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-neutral-900 animate-scale-in"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
            {/* Status Indicator */}
            <span className="text-xs text-neutral-400 mt-4 px-3 py-1 rounded-full bg-neutral-900/50 border border-neutral-800">
              {activeImageIndex + 1} / {urls.length}
            </span>
          </div>

          {/* Navigation - Next */}
          {urls.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-450 hover:text-white hover:bg-neutral-850 transition-colors cursor-pointer"
              aria-label="Następne zdjęcie"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
