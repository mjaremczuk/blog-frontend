"use client";

import React from "react";

interface ToastBannerProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function ToastBanner({ show, message, onClose }: ToastBannerProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-emerald-950 border border-emerald-800 text-emerald-100 px-5 py-4 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-1.5 rounded-full bg-emerald-900 text-emerald-300">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold">Sukces!</div>
        <div className="text-xs text-emerald-200/90">{message}</div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="ml-4 text-emerald-400 hover:text-emerald-200 transition-colors cursor-pointer"
        aria-label="Zamknij powiadomienie"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
