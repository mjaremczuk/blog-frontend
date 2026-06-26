"use client";

import React, { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import ImageTool from "@editorjs/image";
import { GalleryBlockTool } from "@/components/GalleryBlockTool";
import { API_BASE_URL } from "@/lib/api";

interface BlockEditorProps {
  value: string; // JSON string representing Editor.js output
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function BlockEditor({ value, onChange, disabled = false }: BlockEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const containerId = "editorjs-container";

  useEffect(() => {
    // Avoid double initialization
    if (editorRef.current) return;

    let initialData: OutputData | undefined;
    try {
      if (value) {
        initialData = JSON.parse(value);
      }
    } catch (e) {
      console.warn("Failed to parse initial Editor.js data", e);
    }

    const editor = new EditorJS({
      holder: containerId,
      readOnly: disabled,
      placeholder: "Zacznij pisać tutaj... Naciśnij Tab lub kliknij '+', by dodać bloki (Nagłówek, Lista, Galeria, Obraz).",
      data: initialData,
      tools: {
        header: {
          class: Header as any,
          inlineToolbar: true,
          config: {
            placeholder: "Nagłówek",
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          class: List as any,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered"
          }
        },
        image: {
          class: ImageTool as any,
          config: {
            endpoints: {
              byFile: `${API_BASE_URL}/api/upload`, // Ktor backend upload endpoint
            },
            field: "image", // Name of the multipart field (Ktor receives this under 'image')
          }
        },
        gallery: {
          class: GalleryBlockTool as any,
        },
      },
      onChange: async () => {
        try {
          const savedData = await editor.save();
          onChange(JSON.stringify(savedData));
        } catch (e) {
          console.error("Error saving EditorJS data:", e);
        }
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current) {
        // Destroy instance safely
        if (typeof editorRef.current.destroy === "function") {
          editorRef.current.destroy();
        }
        editorRef.current = null;
      }
    };
  }, [disabled]);

  // Handle external value changes (e.g. form reset)
  useEffect(() => {
    if (!editorRef.current) return;

    const updateEditor = async () => {
      try {
        await editorRef.current?.isReady;
        if (!value && typeof editorRef.current?.blocks?.clear === "function") {
          await editorRef.current.blocks.clear();
        }
      } catch (e) {
        // Suppress or log warning instead of throwing unhandled exception
        console.warn("Editor.js was not fully ready or blocks.clear is unavailable:", e);
      }
    };
    
    updateEditor();
  }, [value]);

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4 text-foreground focus-within:border-neutral-700 transition-colors">
      <div id={containerId} className="editorjs-w-full min-h-[350px]" />
    </div>
  );
}
