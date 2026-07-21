"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
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

export interface BlockEditorHandler {
  renderBlocks: (data: OutputData) => Promise<void>;
  clear: () => Promise<void>;
}

const BlockEditor = forwardRef<BlockEditorHandler, BlockEditorProps>(function BlockEditor(
  { value, onChange, disabled = false },
  ref
) {
  const editorInstanceRef = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose clean imperative methods for direct block rendering and clearing
  useImperativeHandle(ref, () => ({
    renderBlocks: async (data: OutputData) => {
      if (editorInstanceRef.current) {
        try {
          await editorInstanceRef.current.isReady;
          await editorInstanceRef.current.render(data);
        } catch (e) {
          console.error("Failed to render blocks in Editor.js:", e);
        }
      }
    },
    clear: async () => {
      if (editorInstanceRef.current) {
        try {
          await editorInstanceRef.current.isReady;
          await editorInstanceRef.current.blocks.clear();
        } catch (e) {
          console.error("Failed to clear Editor.js blocks:", e);
        }
      }
    },
  }));

  // Initialize Editor.js ONCE on mount (without destroy calls that wipe DOM nodes)
  useEffect(() => {
    if (editorInstanceRef.current || !containerRef.current) return;

    let initialData: OutputData | undefined;
    try {
      if (value) {
        initialData = JSON.parse(value);
      }
    } catch (e) {
      console.warn("Failed to parse initial Editor.js data", e);
    }

    const EditorJSClass = (EditorJS as any).default || EditorJS;
    const HeaderTool = (Header as any).default || Header;
    const ListTool = (List as any).default || List;
    const ImagePlugin = (ImageTool as any).default || ImageTool;

    const instance = new EditorJSClass({
      holder: containerRef.current,
      readOnly: disabled,
      placeholder: "Zacznij pisać tutaj... Naciśnij Tab lub kliknij '+', by dodać bloki (Nagłówek, Lista, Galeria, Obraz).",
      data: initialData,
      tools: {
        header: {
          class: HeaderTool as any,
          inlineToolbar: true,
          config: {
            placeholder: "Nagłówek",
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          class: ListTool as any,
          inlineToolbar: true,
          config: {
            defaultStyle: "unordered"
          }
        },
        image: {
          class: ImagePlugin as any,
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
          await instance.isReady;
          const savedData = await instance.save();
          onChange(JSON.stringify(savedData));
        } catch (e) {
          console.error("Error saving EditorJS data:", e);
        }
      },
    });

    editorInstanceRef.current = instance;
  }, []); // Run ONLY ONCE on mount

  // Safely toggle readOnly mode without destroying the editor instance
  useEffect(() => {
    if (editorInstanceRef.current && typeof editorInstanceRef.current.readOnly?.toggle === "function") {
      editorInstanceRef.current.isReady
        .then(() => {
          editorInstanceRef.current?.readOnly?.toggle(disabled);
        })
        .catch(() => {});
    }
  }, [disabled]);

  return (
    <div className="w-full rounded-lg border border-border bg-card p-4 text-foreground focus-within:border-neutral-700 transition-colors">
      <div ref={containerRef} className="editorjs-w-full min-h-[350px]" />
    </div>
  );
});

export default BlockEditor;
