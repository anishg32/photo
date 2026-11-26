"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";

interface ImageUploadFieldProps {
  folder: "gallery" | "categories" | "stories";
  label: string;
  onUploaded: (result: {
    imageUrl: string;
    thumbnailUrl: string;
    width: number;
    height: number;
  }) => void;
}

export function ImageUploadField({
  folder,
  label,
  onUploaded,
}: ImageUploadFieldProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setStatus(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(null);
      try {
        const res = JSON.parse(xhr.responseText) as {
          ok?: boolean;
          error?: string;
          imageUrl?: string;
          thumbnailUrl?: string;
          width?: number;
          height?: number;
        };
        if (xhr.status >= 200 && xhr.status < 300 && res.imageUrl) {
          onUploaded({
            imageUrl: res.imageUrl,
            thumbnailUrl: res.thumbnailUrl || res.imageUrl,
            width: res.width ?? 1600,
            height: res.height ?? 1200,
          });
          setStatus({
            type: "success",
            text: `Uploaded original (${file.name}) + generated WebP thumbnail.`,
          });
        } else {
          setStatus({
            type: "error",
            text: res.error || "Upload failed. Check Firebase Storage config.",
          });
        }
      } catch {
        setStatus({ type: "error", text: "Invalid server upload response." });
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      setStatus({ type: "error", text: "Network error during image upload." });
    };

    xhr.send(formData);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC]">
        {label}
      </label>
      <label className="flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#C6A46A]/45 bg-[#0a0a0a] px-4 py-4 text-xs tracking-[0.14em] uppercase text-[#C6A46A] hover:border-[#C6A46A] cursor-pointer transition-colors">
        <Upload aria-hidden="true" className="h-4 w-4" />
        <span>Select High-Res Image (Preserves Original)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          className="visually-hidden"
        />
      </label>

      {progress !== null && (
        <div className="space-y-1">
          <progress
            value={progress}
            max={100}
            className="w-full h-2 accent-[#C6A46A]"
          />
          <p className="font-mono text-[11px] text-[#A0A0A0]">
            Uploading to Firebase Storage... {progress}%
          </p>
        </div>
      )}

      {status && (
        <p
          className={`flex items-center gap-1.5 text-xs ${
            status.type === "success" ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{status.text}</span>
        </p>
      )}
    </div>
  );
}

