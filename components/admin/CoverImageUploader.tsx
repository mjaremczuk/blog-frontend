"use client";

import React from "react";

interface CoverImageUploaderProps {
  coverImageUrl: string;
  isUploadingCover: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function CoverImageUploader({
  coverImageUrl,
  isUploadingCover,
  onUpload,
  onRemove,
  disabled = false,
}: CoverImageUploaderProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-neutral-300">Zdjęcie okładkowe</label>
      
      {coverImageUrl ? (
        <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden border border-border bg-card group">
          <img src={coverImageUrl} alt="Okładka" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-neutral-950/80 border border-neutral-800 text-red-400 hover:text-red-300 rounded-full transition-all cursor-pointer"
            title="Usuń zdjęcie okładkowe"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.755.033-1.51.077-2.258.132a.75 0 0 0-.671.748v.063c0 .351.256.647.606.689.707.085 1.412.152 2.119.201v7.92c0 1.628 1.322 2.95 2.95 2.95h5.04c1.628 0 2.95-1.322 2.95-2.95v-7.92c.707-.05 1.412-.116 2.119-.201a.715.715 0 0 0 .606-.689v-.063a.75.75 0 0 0-.671-.748c-.748-.055-1.503-.099-2.258-.132V3.75A2.75 2.75 0 0 0 14.25 1h-5.5ZM7.5 3.75A1.25 1.25 0 0 1 8.75 2.5h5.5A1.25 1.25 0 0 1 15.5 3.75v.404c-.846.027-1.693.063-2.537.108V4.25a.75.75 0 0 1-1.5 0v.085c-.477.014-.954.032-1.428.056V4.25a.75.75 0 0 1-1.5 0v.135c-.844.045-1.691.081-2.537.108V3.75Z" clipRule="evenodd" />
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
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-xs text-muted-foreground">Wysyłanie okładki...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-neutral-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-neutral-300">Dodaj zdjęcie okładkowe</div>
                <div className="text-xs text-muted-foreground">Przeciągnij i upuść plik lub kliknij, aby wybrać z urządzenia</div>
              </div>
            )}
            <input
              id="cover-upload-input"
              type="file"
              accept="image/*"
              onChange={onUpload}
              disabled={isUploadingCover || disabled}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
