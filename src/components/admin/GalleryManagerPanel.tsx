"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  Trash2,
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Edit3,
  Images,
  Plus,
  Database,
} from "lucide-react";
import type { Category, GalleryImage } from "@/types";
import { adminJsonRequest } from "@/lib/admin-client";
import { ImageUploadField } from "./ImageUploadField";
import { ReplacePictureButton } from "./ReplacePictureButton";

interface GalleryManagerPanelProps {
  items: GalleryImage[];
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export function GalleryManagerPanel({
  items,
  categories,
  onRefresh,
}: GalleryManagerPanelProps) {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [location, setLocation] = useState("");
  const [captureDate, setCaptureDate] = useState("");
  const [cameraSpec, setCameraSpec] = useState("");
  const [displayOrder, setDisplayOrder] = useState(items.length + 1);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [width, setWidth] = useState(1600);
  const [height, setHeight] = useState(1200);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Batch upload state
  const [batchCategoryId, setBatchCategoryId] = useState(
    categories[0]?.id || ""
  );
  const [batchLocation, setBatchLocation] = useState("Studio Archive");
  const [batchDate, setBatchDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [batchFeatured, setBatchFeatured] = useState(false);
  const [batchPublished, setBatchPublished] = useState(true);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [batchBusy, setBatchBusy] = useState(false);

  useEffect(() => {
    if (!categoryId && categories[0]?.id) setCategoryId(categories[0].id);
    if (!batchCategoryId && categories[0]?.id)
      setBatchCategoryId(categories[0].id);
  }, [categories, categoryId, batchCategoryId]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setThumbnailUrl("");
    setCategoryId(categories[0]?.id || "");
    setLocation("");
    setCaptureDate("");
    setCameraSpec("");
    setDisplayOrder(items.length + 1);
    setFeatured(false);
    setPublished(true);
  };

  const startEdit = (img: GalleryImage) => {
    setMode("single");
    setEditingId(img.id);
    setTitle(img.title);
    setDescription(img.description);
    setImageUrl(img.imageUrl);
    setThumbnailUrl(img.thumbnailUrl);
    setCategoryId(img.categoryId);
    setLocation(img.location);
    setCaptureDate(img.captureDate);
    setCameraSpec(img.cameraSpec || "");
    setDisplayOrder(img.displayOrder);
    setFeatured(img.featured);
    setPublished(img.published);
    setWidth(img.width || 1600);
    setHeight(img.height || 1200);
    setFeedback(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const cat = categories.find((c) => c.id === categoryId);
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch("/api/admin/gallery", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          title,
          description,
          imageUrl,
          thumbnailUrl: thumbnailUrl || imageUrl,
          categoryId,
          categoryName: cat?.name,
          categorySlug: cat?.slug,
          location,
          captureDate,
          cameraSpec,
          displayOrder: Number(displayOrder),
          featured,
          published,
          width,
          height,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFeedback(data.error || "Unable to save photograph.");
      } else {
        setFeedback(
          editingId ? "Photograph updated." : "Photograph added to gallery."
        );
        resetForm();
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBatchFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!batchCategoryId) {
      setBatchStatus("Please select a category before uploading pictures.");
      return;
    }

    setBatchBusy(true);
    const total = files.length;
    let added = 0;
    const cat = categories.find((c) => c.id === batchCategoryId);

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setBatchStatus(`Uploading picture ${i + 1} of ${total}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "gallery");

        const upRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const upJson = (await upRes.json().catch(() => ({}))) as {
          error?: string;
          imageUrl?: string;
          thumbnailUrl?: string;
          width?: number;
          height?: number;
        };

        if (!upRes.ok || !upJson.imageUrl) {
          throw new Error(
            `Stopped on ${file.name}: ${upJson.error || "Upload failed."}`
          );
        }

        const niceTitle = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        await adminJsonRequest("/api/admin/gallery", "POST", {
          title: niceTitle || `Frame ${items.length + i + 1}`,
          description: `${cat?.name || "Studio"} archival frame uploaded to MJ PHOTOGRAPHY.`,
          imageUrl: upJson.imageUrl,
          thumbnailUrl: upJson.thumbnailUrl || upJson.imageUrl,
          categoryId: batchCategoryId,
          categoryName: cat?.name,
          categorySlug: cat?.slug,
          location: batchLocation || "Studio Archive",
          captureDate: batchDate || new Date().toISOString().slice(0, 10),
          featured: batchFeatured,
          published: batchPublished,
          displayOrder: items.length + i + 1,
          width: upJson.width ?? 1600,
          height: upJson.height ?? 1200,
        });
        added++;
      }

      setBatchStatus(
        `Successfully added ${added} of ${total} pictures to Firestore & Storage.`
      );
      await onRefresh();
    } catch (err) {
      setBatchStatus(
        err instanceof Error ? err.message : "Batch upload failed."
      );
      if (added > 0) await onRefresh();
    } finally {
      setBatchBusy(false);
    }
  };

  const replaceImage = async (
    img: GalleryImage,
    replacement: {
      imageUrl: string;
      thumbnailUrl: string;
      width: number;
      height: number;
    }
  ) => {
    try {
      await adminJsonRequest("/api/admin/gallery", "PATCH", {
        id: img.id,
        imageUrl: replacement.imageUrl,
        thumbnailUrl: replacement.thumbnailUrl,
        width: replacement.width,
        height: replacement.height,
        replacePreviousImage: true,
      });
      setFeedback(`Replaced picture for "${img.title}".`);
      await onRefresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to replace picture.";
      setFeedback(msg);
      throw new Error(msg);
    }
  };

  const toggleField = async (
    img: GalleryImage,
    patch: Partial<Pick<GalleryImage, "featured" | "published" | "displayOrder">>
  ) => {
    try {
      await adminJsonRequest("/api/admin/gallery", "PATCH", { id: img.id, ...patch });
      await onRefresh();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "Unable to update photograph."
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await adminJsonRequest(
        `/api/admin/gallery?id=${encodeURIComponent(id)}`,
        "DELETE"
      );
      await onRefresh();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "Unable to delete photograph."
      );
    }
  };

  const handleLoadSamples = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      setFeedback(data.message || data.error || "Loaded sample catalog.");
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Mode Switcher: Add Single Picture vs Add Multiple Pictures */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.16em] border min-h-[44px] ${
              mode === "single"
                ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-semibold"
                : "border-white/15 text-[#A0A0A0] hover:text-white"
            }`}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            <span>{editingId ? "Edit Picture" : "Add Single Picture"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setMode("batch");
            }}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.16em] border min-h-[44px] ${
              mode === "batch"
                ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-semibold"
                : "border-white/15 text-[#A0A0A0] hover:text-white"
            }`}
          >
            <Images aria-hidden="true" className="h-4 w-4" />
            <span>Add Multiple Pictures</span>
          </button>
        </div>

        {items.length === 0 && (
          <button
            type="button"
            onClick={handleLoadSamples}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full border border-[#C6A46A]/60 bg-[#C6A46A]/10 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[44px]"
          >
            <Database aria-hidden="true" className="h-4 w-4" />
            <span>Load Sample Pictures to Firestore</span>
          </button>
        )}
      </div>

      {mode === "batch" ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-5">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-editorial text-2xl text-white">
              Add Multiple Pictures (Admin Batch Upload)
            </h2>
            <p className="text-xs text-[#A0A0A0] mt-1">
              Select multiple original photos at once. Originals are stored
              untouched in Firebase Storage while WebP thumbnails are generated
              automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Category *
              </label>
              <select
                value={batchCategoryId}
                onChange={(e) => setBatchCategoryId(e.target.value)}
                className="studio-select w-full rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Default Location
              </label>
              <input
                type="text"
                value={batchLocation}
                onChange={(e) => setBatchLocation(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Capture Date
              </label>
              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={batchFeatured}
                onChange={(e) => setBatchFeatured(e.target.checked)}
                className="h-4 w-4 accent-[#C6A46A]"
              />
              <span>Feature in Homepage &amp; 3D Gallery</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={batchPublished}
                onChange={(e) => setBatchPublished(e.target.checked)}
                className="h-4 w-4 accent-[#C6A46A]"
              />
              <span>Publish Immediately</span>
            </label>
          </div>

          <label
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#C6A46A]/55 bg-[#0a0a0a] px-6 py-8 text-center cursor-pointer hover:border-[#C6A46A] transition-colors ${
              batchBusy ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <Images aria-hidden="true" className="h-7 w-7 text-[#C6A46A]" />
            <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#C6A46A]">
              {batchBusy
                ? "Uploading & Creating Records..."
                : "Choose Multiple Photographs to Add"}
            </span>
            <input
              type="file"
              multiple
              disabled={batchBusy}
              accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
              onChange={(e) => {
                const list = e.target.files;
                handleBatchFiles(list);
              }}
              className="visually-hidden"
            />
          </label>

          {batchStatus && (
            <p className="text-xs font-mono text-[#C6A46A]">{batchStatus}</p>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h2 className="font-editorial text-2xl text-white">
              {editingId ? "Edit Photograph" : "Add New Picture"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs uppercase tracking-[0.14em] text-[#C6A46A] hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <ImageUploadField
            folder="gallery"
            label={
              editingId
                ? "Upload Replacement High-Resolution Picture"
                : "Upload High-Resolution Picture"
            }
            onUploaded={(res) => {
              setImageUrl(res.imageUrl);
              setThumbnailUrl(res.thumbnailUrl);
              setWidth(res.width);
              setHeight(res.height);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="studio-select w-full rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Original Image URL *
              </label>
              <input
                type="text"
                required
                placeholder="Populated automatically on upload"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Thumbnail URL *
              </label>
              <input
                type="text"
                required
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Capture Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                  Capture Date *
                </label>
                <input
                  type="date"
                  required
                  value={captureDate}
                  onChange={(e) => setCaptureDate(e.target.value)}
                  className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="studio-textarea w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Camera &amp; Lens Metadata
              </label>
              <input
                type="text"
                placeholder="e.g. Hasselblad X2D · 80mm f/1.9"
                value={cameraSpec}
                onChange={(e) => setCameraSpec(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <label className="flex items-center gap-2.5 text-sm text-white pt-4">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-[#C6A46A]"
              />
              <span>Feature in Homepage &amp; 3D Museum</span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-white pt-4">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 accent-[#C6A46A]"
              />
              <span>Published Publicly</span>
            </label>
          </div>

          {feedback && (
            <p className="text-xs font-mono text-[#C6A46A]">{feedback}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-7 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[#d8b87d] disabled:opacity-60 min-h-[44px]"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Photograph"
                : "Add Picture to Gallery"}
          </button>
        </form>
      )}

      {/* Existing Photographs Inventory with Instant Admin "Replace Picture" */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl text-white">
          Archive Inventory ({items.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((img) => (
            <div
              key={img.id}
              className="flex gap-4 rounded-xl border border-white/10 bg-[#111111] p-4 items-center"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#080808]">
                <Image
                  src={img.thumbnailUrl || img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="font-editorial text-xl text-white truncate">
                  {img.title}
                </p>
                <p className="text-xs text-[#A0A0A0] truncate">
                  {img.categoryName || img.categoryId} · {img.location}
                </p>
                <p className="font-mono text-[11px] text-[#C6A46A]">
                  Order #{img.displayOrder} ·{" "}
                  {img.published ? "Published" : "Draft"}
                </p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <ReplacePictureButton
                    folder="gallery"
                    label="Replace Picture"
                    onReplaced={(res) => replaceImage(img, res)}
                  />

                  <button
                    type="button"
                    onClick={() => toggleField(img, { featured: !img.featured })}
                    aria-label={img.featured ? "Unfeature image" : "Feature image"}
                    className={`rounded-full px-2.5 py-1 text-[11px] border inline-flex items-center gap-1 ${
                      img.featured
                        ? "border-[#C6A46A] text-[#C6A46A] bg-[#C6A46A]/10"
                        : "border-white/15 text-[#A0A0A0]"
                    }`}
                  >
                    <Star aria-hidden="true" className="h-3 w-3" />
                    <span>{img.featured ? "Featured" : "Feature"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleField(img, { published: !img.published })
                    }
                    aria-label={img.published ? "Unpublish image" : "Publish image"}
                    className="rounded-full px-2.5 py-1 text-[11px] border border-white/15 text-white/80 hover:border-[#C6A46A] inline-flex items-center gap-1"
                  >
                    {img.published ? (
                      <Eye aria-hidden="true" className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <EyeOff aria-hidden="true" className="h-3 w-3 text-[#A0A0A0]" />
                    )}
                    <span>{img.published ? "Live" : "Hidden"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleField(img, {
                        displayOrder: Math.max(0, img.displayOrder - 1),
                      })
                    }
                    aria-label="Move earlier in order"
                    className="rounded-full p-1.5 border border-white/15 text-white/70 hover:text-white"
                  >
                    <ArrowUp aria-hidden="true" className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toggleField(img, { displayOrder: img.displayOrder + 1 })
                    }
                    aria-label="Move later in order"
                    className="rounded-full p-1.5 border border-white/15 text-white/70 hover:text-white"
                  >
                    <ArrowDown aria-hidden="true" className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(img)}
                    aria-label="Edit photograph"
                    className="rounded-full p-1.5 border border-white/15 text-white/70 hover:text-[#C6A46A]"
                  >
                    <Edit3 aria-hidden="true" className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    aria-label="Delete photograph"
                    className="rounded-full p-1.5 border border-red-500/30 text-red-300 hover:bg-red-950/50"
                  >
                    <Trash2 aria-hidden="true" className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
