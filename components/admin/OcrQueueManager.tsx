"use client";

import React from "react";
import { Button } from "@/components/Button";
import { OcrFileItem } from "@/hooks/useOcrQueue";

interface OcrQueueManagerProps {
  ocrFiles: OcrFileItem[];
  isProcessingOcr: boolean;
  ocrProgress: string;
  ocrError: string;
  onFilesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMoveFile: (index: number, direction: "up" | "down") => void;
  onRemoveFile: (index: number) => void;
  onClearQueue: () => void;
  onProcessOcr: () => void;
}

export function OcrQueueManager({
  ocrFiles,
  isProcessingOcr,
  ocrProgress,
  ocrError,
  onFilesChange,
  onMoveFile,
  onRemoveFile,
  onClearQueue,
  onProcessOcr,
}: OcrQueueManagerProps) {
  return (
    <div className="space-y-6 bg-neutral-900/40 p-6 rounded-2xl border border-neutral-800">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-neutral-200">
          Dodaj zdjęcia ręcznych notatek
        </h3>
        <p className="text-xs text-neutral-400">
          Wybierz jedno lub więcej zdjęć kartek (zostaną przeanalizowane po kolei). Możesz zmieniać ich kolejność strzałkami.
        </p>
      </div>

      {ocrError && (
        <div className="rounded-lg bg-red-950/50 border border-red-900 p-4 text-xs text-red-200">
          {ocrError}
        </div>
      )}

      {/* Dropzone Input */}
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-neutral-800 hover:border-emerald-500/50 rounded-xl cursor-pointer bg-neutral-950/50 hover:bg-neutral-950 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-neutral-400 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            <p className="text-sm font-medium text-neutral-300">
              Kliknij, aby dodać zdjęcia kartek
            </p>
            <p className="text-xs text-neutral-500 mt-1">PNG, JPG, JPEG (obsługa wielu plików na raz)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFilesChange}
            disabled={isProcessingOcr}
          />
        </label>
      </div>

      {/* Selected Queue Files List */}
      {ocrFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400">
            <span>Kolejność kartek ({ocrFiles.length}):</span>
            <button
              type="button"
              onClick={onClearQueue}
              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              disabled={isProcessingOcr}
            >
              Wyczyść kolejkowane zdjęcia
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ocrFiles.map((item, index) => (
              <div
                key={item.id}
                className="relative flex items-center space-x-3 p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 group"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-800 shrink-0 bg-neutral-900">
                  <img
                    src={item.previewUrl}
                    alt={`Podgląd ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-black/75 text-neutral-200 text-[10px] font-bold px-1.5 py-0.5 rounded-br">
                    #{index + 1}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-200 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                {!isProcessingOcr && (
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onMoveFile(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                      title="Przesuń w górę"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveFile(index, "down")}
                      disabled={index === ocrFiles.length - 1}
                      className="p-1 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                      title="Przesuń w dół"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFile(index)}
                      className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                      title="Usuń zdjęcie z kolejki"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress & Submit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-emerald-400 font-medium">
          {isProcessingOcr && (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{ocrProgress}</span>
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={onProcessOcr}
          disabled={ocrFiles.length === 0 || isProcessingOcr}
          className="w-full sm:w-auto"
        >
          {isProcessingOcr ? "Przetwarzanie OCR..." : "Odczytaj tekst i wklej do edytora"}
        </Button>
      </div>
    </div>
  );
}
