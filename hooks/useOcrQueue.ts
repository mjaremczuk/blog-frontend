import { useState, useEffect } from "react";

export interface OcrFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

export function useOcrQueue() {
  const [ocrFiles, setOcrFiles] = useState<OcrFileItem[]>([]);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");
  const [ocrError, setOcrError] = useState("");

  // Revoke object URLs on component unmount or queue update to prevent memory leaks
  useEffect(() => {
    return () => {
      ocrFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [ocrFiles]);

  const addFiles = (selectedFiles: File[]) => {
    const newItems: OcrFileItem[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setOcrFiles((prev) => [...prev, ...newItems]);
    setOcrError("");
  };

  const moveFile = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === ocrFiles.length - 1) return;

    setOcrFiles((prev) => {
      const copy = [...prev];
      const swapWith = direction === "up" ? index - 1 : index + 1;
      const temp = copy[index];
      copy[index] = copy[swapWith];
      copy[swapWith] = temp;
      return copy;
    });
  };

  const removeFile = (index: number) => {
    setOcrFiles((prev) => {
      const fileToRemove = prev[index];
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearQueue = () => {
    ocrFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setOcrFiles([]);
    setOcrError("");
  };

  const processQueue = async (
    onSuccess: (blocks: { id: string; type: string; data: { text: string } }[]) => Promise<void>
  ) => {
    if (ocrFiles.length === 0) return;

    setIsProcessingOcr(true);
    setOcrError("");
    setOcrProgress("Przygotowywanie plików...");

    const transcribedParts: string[] = [];
    const ocrAgentUrl = process.env.NEXT_PUBLIC_OCR_AGENT_URL || "http://localhost:8002";

    try {
      for (let i = 0; i < ocrFiles.length; i++) {
        const fileObj = ocrFiles[i];
        setOcrProgress(
          ocrFiles.length > 1
            ? `Przetwarzanie zdjęcia ${i + 1} z ${ocrFiles.length} (${fileObj.file.name})...`
            : `Przetwarzanie zdjęcia (${fileObj.file.name})...`
        );

        const formData = new FormData();
        formData.append("file", fileObj.file);

        const res = await fetch(`${ocrAgentUrl}/api/ocr`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ detail: res.statusText }));
          throw new Error(
            errorData.detail || `Błąd podczas przetwarzania zdjęcia #${i + 1} (${fileObj.file.name}).`
          );
        }

        const data = await res.json();
        if (data.text) {
          transcribedParts.push(data.text);
        }
      }

      setOcrProgress("Generowanie struktury wpisu...");

      const transcribedText = transcribedParts.join("\n\n");
      const lines = transcribedText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const editorBlocks = lines.map((line: string) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let blockId = "";
        for (let j = 0; j < 10; j++) {
          blockId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return {
          id: blockId,
          type: "paragraph",
          data: { text: line },
        };
      });

      await onSuccess(editorBlocks);
      clearQueue();
    } catch (err) {
      console.error("OCR process error:", err);
      setOcrError(err instanceof Error ? err.message : "Przetwarzanie OCR nie powiodło się.");
    } finally {
      setIsProcessingOcr(false);
      setOcrProgress("");
    }
  };

  return {
    ocrFiles,
    isProcessingOcr,
    ocrProgress,
    ocrError,
    addFiles,
    moveFile,
    removeFile,
    clearQueue,
    processQueue,
  };
}
