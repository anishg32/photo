"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  BookOpen,
  Database,
  ImagePlus,
  Images,
  ShieldCheck,
} from "lucide-react";
import type { Category, Story } from "@/types";
import { adminJsonRequest } from "@/lib/admin-client";
import { ImageUploadField } from "./ImageUploadField";

interface AddPicturesPanelProps {
  categories: Category[];
  stories: Story[];
  galleryCount: number;
  onRefresh: () => Promise<void>;
  onSeedCatalog: () => Promise<void>;
  seeding: boolean;
}

type AddMode = "single" | "batch" | "story";

/**
 * Dedicated Admin-only picture addition workspace for single gallery uploads,
 * multi-file batch uploads, and appending archival frames to visual stories.
 */
export function AddPicturesPanel({
  categories,
  stories,
  galleryCount,
  onRefresh,
  onSeedCatalog,
  seeding,
}: AddPicturesPanelProps) {
  const [mode, setMode] = useState<AddMode>("single");

  // Single picture state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [location, setLocation] = useState("");
  const [captureDate, setCaptureDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [cameraSpec, setCameraSpec] = useState("");
  const [displayOrder, setDisplayOrder] = useState(galleryCount + 1);
  const [featured, setFeatured] = useState(true);
  const [published, setPublished] = useState(true);
  const [width, setWidth] = useState(1600);
  const [height, setHeight] = useState(1200);
  const [saving, setSaving] = useState(false);
  const [singleMessage, setSingleMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Batch gallery upload state
  const [batchCategoryId, setBatchCategoryId] = useState(
    categories[0]?.id || ""
  );
  const [batchLocation, setBatchLocation] = useState("Studio Archive");
  const [batchDate, setBatchDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [batchFeatured, setBatchFeatured] = useState(false);
  const [batchPublished, setBatchPublished] = useState(true);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchMessage, setBatchMessage] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);

  // Story gallery add state
  const [storyId, setStoryId] = useState(stories[0]?.id || "");
  const [storyCaption, setStoryCaption] = useState("");
  const [storyAspect, setStoryAspect] = useState<
    "landscape" | "portrait" | "square"
  >("landscape");
  const [storyBusy, setStoryBusy] = useState(false);
  const [storyMessage, setStoryMessage] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!categoryId && categories[0]?.id) setCategoryId(categories[0].id);
    if (!batchCategoryId && categories[0]?.id)
      setBatchCategoryId(categories[0].id);
  }, [categories, categoryId, batchCategoryId]);

  useEffect(() => {
    if (!storyId && stories[0]?.id) setStoryId(stories[0].id);
  }, [stories, storyId]);

  useEffect(() => {
    setDisplayOrder(galleryCount + 1);
  }, [galleryCount]);

  const handleSingleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSingleMessage(null);
    try {
      const cat = categories.find((c) => c.id === categoryId);
      await adminJsonRequest("/api/admin/gallery", "POST", {
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
      });
      setSingleMessage({
        type: "success",
        text: `Added "${title}" to Cloud Firestore & Gallery.`,
      });
      setTitle("");
      setDescription("");
      setImageUrl("");
      setThumbnailUrl("");
      setLocation("");
      setCameraSpec("");
      await onRefresh();
    } catch (err) {
      setSingleMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to add picture.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBatchUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!batchCategoryId) {
      setBatchMessage({
        type: "error",
        text: "Select a category before uploading batch pictures.",
      });
      return;
    }

    setBatchBusy(true);
    const total = files.length;
    let added = 0;
    const cat = categories.find((c) => c.id === batchCategoryId);

    try {
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setBatchMessage({
          type: "info",
          text: `Uploading picture ${i + 1} of ${total}: ${file.name}...`,
        });

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
            `Stopped at ${file.name}: ${upJson.error || `HTTP ${upRes.status}`}`
          );
        }

        const niceTitle = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        await adminJsonRequest("/api/admin/gallery", "POST", {
          title: niceTitle || `Frame ${galleryCount + i + 1}`,
          description: `${cat?.name || "Studio"} fine-art frame added via Admin Studio.`,
          imageUrl: upJson.imageUrl,
          thumbnailUrl: upJson.thumbnailUrl || upJson.imageUrl,
          categoryId: batchCategoryId,
          categoryName: cat?.name,
          categorySlug: cat?.slug,
          location: batchLocation || "Studio Archive",
          captureDate: batchDate || new Date().toISOString().slice(0, 10),
          featured: batchFeatured,
          published: batchPublished,
          displayOrder: galleryCount + i + 1,
          width: upJson.width ?? 1600,
          height: upJson.height ?? 1200,
        });
        added++;
      }

      setBatchMessage({
        type: "success",
        text: `Successfully uploaded & added ${added} of ${total} pictures to Gallery.`,
      });
      await onRefresh();
    } catch (err) {
      setBatchMessage({
        type: "error",
        text:
          err instanceof Error
            ? `${err.message} (${added} saved before error.)`
            : "Batch upload failed.",
      });
      if (added > 0) await onRefresh();
    } finally {
      setBatchBusy(false);
    }
  };

  const handleAddStoryImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const targetStory = stories.find((s) => s.id === storyId);
    if (!targetStory) {
      setStoryMessage({
        type: "error",
        text: "Please select an editorial story first.",
      });
      return;
    }

    setStoryBusy(true);
    const nextImages = [...(targetStory.galleryImages ?? [])];
    let added = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStoryMessage({
          type: "info",
          text: `Uploading story plate ${i + 1} of ${files.length}: ${file.name}...`,
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "stories");

        const upRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const upJson = (await upRes.json().catch(() => ({}))) as {
          error?: string;
          imageUrl?: string;
        };

        if (!upRes.ok || !upJson.imageUrl) {
          throw new Error(
            `Stopped at ${file.name}: ${upJson.error || `HTTP ${upRes.status}`}`
          );
        }

        nextImages.push({
          url: upJson.imageUrl,
          caption:
            storyCaption.trim() ||
            file.name
              .replace(/\.[^.]+$/, "")
              .replace(/[-_]+/g, " "),
          aspect: storyAspect,
        });
        added++;
      }

      await adminJsonRequest("/api/admin/stories", "PATCH", {
        id: targetStory.id,
        galleryImages: nextImages,
      });

      setStoryMessage({
        type: "success",
        text: `Appended ${added} picture(s) to "${targetStory.title}".`,
      });
      setStoryCaption("");
      await onRefresh();
    } catch (err) {
      setStoryMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to add story pictures.",
      });
    } finally {
      setStoryBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-[#C6A46A]">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Admin-Only Picture Ingestion</span>
          </p>
          <h1 className="font-editorial text-4xl text-white">
            Add New Pictures
          </h1>
          <p className="text-sm text-[#A0A0A0] max-w-2xl">
            Upload untouched high-resolution photographs (JPEG, PNG, WebP, AVIF,
            or TIFF up to 50 MB). Separate display thumbnails are generated
            server-side automatically.
          </p>
        </div>

        {categories.length === 0 && (
          <button
            type="button"
            onClick={onSeedCatalog}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-full border border-[#C6A46A]/60 bg-[#C6A46A]/10 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[44px]"
          >
            <Database aria-hidden="true" className="h-4 w-4" />
            <span>
              {seeding
                ? "Initializing..."
                : "Load Sample Categories & Catalog"}
            </span>
          </button>
        )}
      </div>

      {/* Sub-mode selector */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.16em] border min-h-[44px] transition-colors ${
            mode === "single"
              ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-semibold"
              : "border-white/15 text-[#A0A0A0] hover:text-white"
          }`}
        >
          <ImagePlus aria-hidden="true" className="h-4 w-4" />
          <span>Add Single Picture</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("batch")}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.16em] border min-h-[44px] transition-colors ${
            mode === "batch"
              ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-semibold"
              : "border-white/15 text-[#A0A0A0] hover:text-white"
          }`}
        >
          <Images aria-hidden="true" className="h-4 w-4" />
          <span>Add Multiple Pictures</span>
        </button>

        <button
          type="button"
          onClick={() => setMode("story")}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.16em] border min-h-[44px] transition-colors ${
            mode === "story"
              ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-semibold"
              : "border-white/15 text-[#A0A0A0] hover:text-white"
          }`}
        >
          <BookOpen aria-hidden="true" className="h-4 w-4" />
          <span>Add Story Pictures</span>
        </button>
      </div>

      {mode === "single" && (
        <form
          onSubmit={handleSingleSubmit}
          className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-5"
        >
          <ImageUploadField
            folder="gallery"
            label="Step 1 — Upload High-Resolution Picture"
            onUploaded={(res) => {
              setImageUrl(res.imageUrl);
              setThumbnailUrl(res.thumbnailUrl);
              setWidth(res.width);
              setHeight(res.height);
            }}
          />

          {imageUrl && (
            <div className="relative aspect-[16/9] max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#080808]">
              <Image
                src={thumbnailUrl || imageUrl}
                alt="Uploaded picture preview"
                fill
                sizes="448px"
                className="object-cover"
              />
            </div>
          )}

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

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Original Image URL *
              </label>
              <input
                type="text"
                required
                placeholder="Auto-filled on upload or enter URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-xs font-mono"
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
                className="studio-input w-full rounded-lg px-4 py-2.5 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Editorial Description *
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
                placeholder="e.g. Leica SL3 · 50mm f/1.4"
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
              <span>Feature on Homepage &amp; 3D Museum</span>
            </label>

            <label className="flex items-center gap-2.5 text-sm text-white pt-4">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 accent-[#C6A46A]"
              />
              <span>Publish Immediately</span>
            </label>
          </div>

          {singleMessage && (
            <p
              className={`text-xs font-mono ${
                singleMessage.type === "error"
                  ? "text-red-300"
                  : "text-emerald-300"
              }`}
            >
              {singleMessage.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-7 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[#d8b87d] disabled:opacity-60 min-h-[44px]"
          >
            {saving ? "Adding Picture..." : "Add Picture to Gallery"}
          </button>
        </form>
      )}

      {mode === "batch" && (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-5">
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
              <span>Feature on Homepage &amp; 3D Museum</span>
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
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#C6A46A]/55 bg-[#0a0a0a] px-6 py-10 text-center cursor-pointer hover:border-[#C6A46A] transition-colors ${
              batchBusy ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <Images aria-hidden="true" className="h-8 w-8 text-[#C6A46A]" />
            <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#C6A46A]">
              {batchBusy
                ? "Uploading & Creating Records..."
                : "Select Multiple Pictures to Upload & Add"}
            </span>
            <input
              type="file"
              multiple
              disabled={batchBusy}
              accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
              onChange={(e) => {
                const list = e.target.files;
                handleBatchUpload(list);
              }}
              className="visually-hidden"
            />
          </label>

          {batchMessage && (
            <p
              className={`text-xs font-mono ${
                batchMessage.type === "error"
                  ? "text-red-300"
                  : batchMessage.type === "success"
                    ? "text-emerald-300"
                    : "text-[#C6A46A]"
              }`}
            >
              {batchMessage.text}
            </p>
          )}
        </div>
      )}

      {mode === "story" && (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Target Visual Story *
              </label>
              <select
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
                className="studio-select w-full rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="">Select story...</option>
                {stories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Optional Frame Caption
              </label>
              <input
                type="text"
                placeholder="Defaults to cleaned filename"
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
                Display Aspect Ratio
              </label>
              <select
                value={storyAspect}
                onChange={(e) =>
                  setStoryAspect(
                    e.target.value as "landscape" | "portrait" | "square"
                  )
                }
                className="studio-select w-full rounded-lg px-4 py-2.5 text-sm"
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>

          <label
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#C6A46A]/55 bg-[#0a0a0a] px-6 py-10 text-center cursor-pointer hover:border-[#C6A46A] transition-colors ${
              storyBusy ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <BookOpen aria-hidden="true" className="h-8 w-8 text-[#C6A46A]" />
            <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#C6A46A]">
              {storyBusy
                ? "Appending Pictures to Story..."
                : "Select One or More Pictures to Add to Story"}
            </span>
            <input
              type="file"
              multiple
              disabled={storyBusy}
              accept="image/jpeg,image/png,image/webp,image/avif,image/tiff"
              onChange={(e) => handleAddStoryImages(e.target.files)}
              className="visually-hidden"
            />
          </label>

          {storyMessage && (
            <p
              className={`text-xs font-mono ${
                storyMessage.type === "error"
                  ? "text-red-300"
                  : storyMessage.type === "success"
                    ? "text-emerald-300"
                    : "text-[#C6A46A]"
              }`}
            >
              {storyMessage.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
