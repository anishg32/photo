"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Edit3, Trash2 } from "lucide-react";
import type { Category } from "@/types";
import { slugify } from "@/lib/validation";
import { ImageUploadField } from "./ImageUploadField";

export function CategoryManagerPanel({
  categories,
  onRefresh,
}: {
  categories: Category[];
  onRefresh: () => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [displayOrder, setDisplayOrder] = useState(categories.length + 1);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reset = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setCoverImage("");
    setDisplayOrder(categories.length + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId ?? undefined,
          name,
          slug: slug || slugify(name),
          description,
          coverImage,
          displayOrder: Number(displayOrder),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFeedback(data.error || "Unable to save category.");
      } else {
        setFeedback(editingId ? "Category updated." : "Category created.");
        reset();
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
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
            {editingId ? "Edit Category" : "Create Category"}
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
          folder="categories"
          label="Upload Category Cover Image"
          onUploaded={(res) => setCoverImage(res.imageUrl)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(slugify(e.target.value));
              }}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              URL Slug *
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
              Order
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
            Cover Image URL (Optional until uploaded)
          </label>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="studio-input w-full rounded-lg px-4 py-2.5 text-sm font-mono text-xs"
          />
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

        {feedback && <p className="text-xs font-mono text-[#C6A46A]">{feedback}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-7 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[#d8b87d] disabled:opacity-60 min-h-[44px]"
        >
          {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#111111] p-4"
          >
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[#080808] border border-white/10 flex items-center justify-center">
              {cat.coverImage ? (
                <Image
                  src={cat.coverImage}
                  alt={cat.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="font-mono text-xs text-[#C6A46A]">
                  #{cat.displayOrder}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-editorial text-xl text-white truncate">
                {cat.name}
              </p>
              <p className="font-mono text-[11px] text-[#C6A46A]">
                /{cat.slug} · Order #{cat.displayOrder}
              </p>
              <p className="text-xs text-[#A0A0A0] line-clamp-1 mt-1">
                {cat.description}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label={`Edit ${cat.name}`}
                onClick={() => {
                  setEditingId(cat.id);
                  setName(cat.name);
                  setSlug(cat.slug);
                  setDescription(cat.description);
                  setCoverImage(cat.coverImage);
                  setDisplayOrder(cat.displayOrder);
                }}
                className="rounded-full p-2 border border-white/15 text-white/80 hover:text-[#C6A46A]"
              >
                <Edit3 aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${cat.name}`}
                onClick={() => handleDelete(cat.id)}
                className="rounded-full p-2 border border-red-500/30 text-red-300 hover:bg-red-950/50"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

