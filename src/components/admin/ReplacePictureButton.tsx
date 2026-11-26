"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface ReplacePictureButtonProps {
  folder: "gallery" | "categories" | "stories";
  label?: string;
  onReplaced: (result: {
    imageUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
  }) => Promise<void> | void;
  className?: string;
}

export function ReplacePictureButton({
  folder,
  label = "Replace Picture",
  onReplaced,
  className = "",
}: ReplacePictureButtonProps) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };

    xhr.onload = async () => {
      setProgress(null);
      try {
        const res = JSON.parse(xhr.responseText) as {
          error?: string;
          imageUrl?: string;
          thumbnailUrl?: string;
          width?: number;
          height?: number;
        };
        if (xhr.status >= 200 && xhr.status < 300 && res.imageUrl) {
          await onReplaced({
            imageUrl: res.imageUrl,
            thumbnailUrl: res.thumbnailUrl || res.imageUrl,
            width: res.width ?? 1600,
            height: res.height ?? 1200,
          });
        } else {
          setError(res.error || "Failed to replace picture.");
        }
      } catch {
        setError("Invalid upload response.");
      } finally {
        setBusy(false);
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      setBusy(false);
      setError("Network error while replacing picture.");
    };

    xhr.send(formData);
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <label
        className={`inline-flex items-center gap-1.5 rounded-full border border-[#C6A46A]/55 bg-[#C6A46A]/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] cursor-pointer transition-colors ${
          busy ? "opacity-60 pointer-events-none" : ""
        } ${className}`}
      >
        <RefreshCw
          aria-hidden="true"
          className={`h-3 w-3 ${busy ? "animate-spin" : ""}`}
        />
        <span>
          {progress !== null
            ? `Replacing ${progress}%`
            : busy
              ? "Updating..."
              : label}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            handleFile(f);
          }}
          className="visually-hidden"
        />
      </label>
      {error && <span className="text-[11px] text-red-300">{error}</span>}
    </div>
  );
}
