"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Edit3, Eye, EyeOff, Trash2 } from "lucide-react";
import type { Story } from "@/types";
import { slugify } from "@/lib/validation";
import { ImageUploadField } from "./ImageUploadField";
import { ReplacePictureButton } from "./ReplacePictureButton";

export function StoriesManagerPanel({
  stories,
  onRefresh,
}: {
  stories: Story[];
  onRefresh: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [location, setLocation] = useState("");
  const [captureDate, setCaptureDate] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reset = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setLocation("");
    setCaptureDate("");
    setContent("");
    setPublished(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/stories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          title,
          slug: slug || slugify(title),
          description,
          coverImage,
          location,
          captureDate,
          content,
          published,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFeedback(data.error || "Unable to save story.");
      } else {
        setFeedback(editingId ? "Story updated." : "Story created.");
        reset();
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (story: Story) => {
    await fetch("/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: story.id, published: !story.published }),
    });
    await onRefresh();
  };

  const deleteStory = async (id: string) => {
    await fetch(`/api/admin/stories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await onRefresh();
  };

  const replaceStoryCover = async (id: string, imageUrl: string) => {
    await fetch("/api/admin/stories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, coverImage: imageUrl }),
    });
    setFeedback("Updated story cover picture.");
    await onRefresh();
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-editorial text-2xl text-white">
            {editingId ? "Edit Visual Story" : "Compose Visual Story"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="text-xs uppercase tracking-[0.14em] text-[#C6A46A]"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <ImageUploadField
          folder="stories"
          label="Upload Story Cover Photograph"
          onUploaded={(res) => setCoverImage(res.imageUrl)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Story Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editingId) setSlug(slugify(e.target.value));
              }}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Capture Period
            </label>
            <input
              type="text"
              placeholder="e.g., September 2026"
              value={captureDate}
              onChange={(e) => setCaptureDate(e.target.value)}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
            Cover Image URL *
          </label>
          <input
            type="text"
            required
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="studio-input w-full rounded-lg px-4 py-2.5 text-sm font-mono text-xs"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
            Introduction Excerpt *
          </label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="studio-textarea w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
            Full Editorial Narrative *
          </label>
          <textarea
            required
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="studio-textarea w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-white">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 accent-[#C6A46A]"
          />
          <span>Publish Story Publicly</span>
        </label>

        {feedback && <p className="text-xs font-mono text-[#C6A46A]">{feedback}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-7 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[#d8b87d] disabled:opacity-60 min-h-[44px]"
        >
          {saving ? "Saving..." : editingId ? "Update Story" : "Save Story"}
        </button>
      </form>

      <div className="space-y-4">
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-white/10 bg-[#111111] p-4"
          >
            <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-[#080808]">
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-editorial text-xl text-white truncate">
                {story.title}
              </p>
              <p className="font-mono text-[11px] text-[#C6A46A]">
                /stories/{story.slug} · {story.published ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-[#A0A0A0] line-clamp-2">
                {story.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ReplacePictureButton
                folder="stories"
                label="Replace Cover"
                onReplaced={(res) => replaceStoryCover(story.id, res.imageUrl)}
              />
              <button
                type="button"
                onClick={() => togglePublish(story)}
                className="rounded-full px-3 py-1.5 border border-white/15 text-xs text-white inline-flex items-center gap-1.5"
              >
                {story.published ? (
                  <Eye aria-hidden="true" className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <EyeOff aria-hidden="true" className="h-3.5 w-3.5 text-[#A0A0A0]" />
                )}
                <span>{story.published ? "Published" : "Draft"}</span>
              </button>
              <button
                type="button"
                aria-label={`Edit ${story.title}`}
                onClick={() => {
                  setEditingId(story.id);
                  setTitle(story.title);
                  setSlug(story.slug);
                  setDescription(story.description);
                  setCoverImage(story.coverImage);
                  setLocation(story.location || "");
                  setCaptureDate(story.captureDate || "");
                  setContent(story.content);
                  setPublished(story.published);
                }}
                className="rounded-full p-2 border border-white/15 text-white/80 hover:text-[#C6A46A]"
              >
                <Edit3 aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${story.title}`}
                onClick={() => deleteStory(story.id)}
                className="rounded-full p-2 border border-red-500/30 text-red-300 hover:bg-red-950/50"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

