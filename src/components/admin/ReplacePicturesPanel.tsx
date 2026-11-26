"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Database, RotateCcw, Search, ShieldCheck } from "lucide-react";
import type { Category, GalleryImage, SiteSettings, Story } from "@/types";
import { adminJsonRequest } from "@/lib/admin-client";
import { ReplacePictureButton } from "./ReplacePictureButton";

interface ReplacePicturesPanelProps {
  settings: SiteSettings;
  categories: Category[];
  gallery: GalleryImage[];
  stories: Story[];
  onRefresh: () => Promise<void>;
  onSeedCatalog: () => Promise<void>;
  seeding: boolean;
}

type SectionFilter = "all" | "site" | "categories" | "gallery" | "stories";

/**
 * Unified Admin-only Picture Replacement studio covering Hero, About Portrait,
 * all Category covers, Gallery frames, and Story covers with automatic Storage cleanup.
 */
export function ReplacePicturesPanel({
  settings,
  categories,
  gallery,
  stories,
  onRefresh,
  onSeedCatalog,
  seeding,
}: ReplacePicturesPanelProps) {
  const [section, setSection] = useState<SectionFilter>("all");
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredGallery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return gallery;
    return gallery.filter(
      (img) =>
        img.title.toLowerCase().includes(q) ||
        img.location.toLowerCase().includes(q) ||
        (img.categoryName?.toLowerCase().includes(q) ?? false)
    );
  }, [gallery, query]);

  const replaceSitePicture = async (
    field: "heroImageUrl" | "aboutImageUrl",
    nextUrl: string,
    label: string,
    replacePreviousImage = true
  ) => {
    setFeedback(null);
    try {
      await adminJsonRequest("/api/admin/settings", "PATCH", {
        [field]: nextUrl,
        replacePreviousImage,
      });
      setFeedback({ type: "success", text: `Updated ${label}.` });
      await onRefresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Failed to update ${label}.`;
      setFeedback({ type: "error", text: msg });
      throw new Error(msg);
    }
  };

  const replaceCategoryCover = async (cat: Category, nextUrl: string) => {
    setFeedback(null);
    try {
      await adminJsonRequest("/api/admin/categories", "PATCH", {
        id: cat.id,
        coverImage: nextUrl,
        replacePreviousImage: true,
      });
      setFeedback({
        type: "success",
        text: `Replaced cover picture for "${cat.name}".`,
      });
      await onRefresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to replace category cover.";
      setFeedback({ type: "error", text: msg });
      throw new Error(msg);
    }
  };

  const replaceGalleryPicture = async (
    img: GalleryImage,
    replacement: {
      imageUrl: string;
      thumbnailUrl: string;
      width: number;
      height: number;
    }
  ) => {
    setFeedback(null);
    try {
      await adminJsonRequest("/api/admin/gallery", "PATCH", {
        id: img.id,
        imageUrl: replacement.imageUrl,
        thumbnailUrl: replacement.thumbnailUrl,
        width: replacement.width,
        height: replacement.height,
        replacePreviousImage: true,
      });
      setFeedback({
        type: "success",
        text: `Replaced gallery picture for "${img.title}".`,
      });
      await onRefresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to replace gallery picture.";
      setFeedback({ type: "error", text: msg });
      throw new Error(msg);
    }
  };

  const replaceStoryCover = async (story: Story, nextUrl: string) => {
    setFeedback(null);
    try {
      await adminJsonRequest("/api/admin/stories", "PATCH", {
        id: story.id,
        coverImage: nextUrl,
        replacePreviousImage: true,
      });
      setFeedback({
        type: "success",
        text: `Replaced cover picture for "${story.title}".`,
      });
      await onRefresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to replace story cover.";
      setFeedback({ type: "error", text: msg });
      throw new Error(msg);
    }
  };

  const needsSeed =
    categories.length === 0 || gallery.length === 0 || stories.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-[#C6A46A]">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Admin-Only Picture Replacement Studio</span>
          </p>
          <h1 className="font-editorial text-4xl text-white">
            Replace Website Pictures
          </h1>
          <p className="text-sm text-[#A0A0A0] max-w-2xl">
            Swap any sample or live photograph across the Homepage Hero, Studio
            Portrait, Categories, Gallery Archive, and Editorial Stories. Replaced
            Firebase Storage files are cleaned up automatically.
          </p>
        </div>

        {needsSeed && (
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
                : "Load Sample Pictures to Firestore"}
            </span>
          </button>
        )}
      </div>

      {/* Section filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All Website Visuals"],
              ["site", "Hero & Studio Portrait"],
              ["categories", `Categories (${categories.length})`],
              ["gallery", `Gallery (${gallery.length})`],
              ["stories", `Stories (${stories.length})`],
            ] as Array<[SectionFilter, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] border transition-colors min-h-[40px] ${
                section === id
                  ? "border-[#C6A46A] bg-[#C6A46A] text-[#080808] font-semibold"
                  : "border-white/15 text-[#A0A0A0] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {(section === "all" || section === "gallery") && (
          <div className="relative w-full sm:w-64">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A0A0A0]"
            />
            <input
              type="search"
              placeholder="Filter gallery frames..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="studio-input w-full rounded-full pl-9 pr-4 py-2 text-xs"
            />
          </div>
        )}
      </div>

      {feedback && (
        <p
          role="status"
          className={`rounded-xl border p-4 text-xs font-mono ${
            feedback.type === "error"
              ? "border-red-500/40 bg-red-950/30 text-red-200"
              : "border-[#C6A46A]/40 bg-[#C6A46A]/10 text-[#C6A46A]"
          }`}
        >
          {feedback.text}
        </p>
      )}

      {/* Hero & About Section Visuals */}
      {(section === "all" || section === "site") && (
        <section className="space-y-4">
          <h2 className="font-editorial text-2xl text-white">
            Homepage Hero &amp; About Portrait
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C6A46A]">
                    Primary Stage
                  </p>
                  <h3 className="font-editorial text-xl text-white">
                    Homepage Hero Background
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    replaceSitePicture(
                      "heroImageUrl",
                      "/images/hero-main.jpg",
                      "Homepage Hero sample",
                      false
                    ).catch(() => undefined)
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#A0A0A0] hover:text-white"
                >
                  <RotateCcw aria-hidden="true" className="h-3 w-3" />
                  <span>Sample</span>
                </button>
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-[#080808]">
                {settings.heroImageUrl && (
                  <Image
                    src={settings.heroImageUrl}
                    alt="Homepage Hero"
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ReplacePictureButton
                  folder="gallery"
                  label="Replace Hero Picture"
                  onReplaced={(res) =>
                    replaceSitePicture(
                      "heroImageUrl",
                      res.imageUrl,
                      "Homepage Hero picture"
                    )
                  }
                />
                <span className="font-mono text-[10px] text-[#777777] truncate max-w-[220px]">
                  {settings.heroImageUrl || "Unset"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C6A46A]">
                    Editorial Profile
                  </p>
                  <h3 className="font-editorial text-xl text-white">
                    Studio Portrait (About Section)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    replaceSitePicture(
                      "aboutImageUrl",
                      "/images/about-studio.jpg",
                      "Studio Portrait sample",
                      false
                    ).catch(() => undefined)
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#A0A0A0] hover:text-white"
                >
                  <RotateCcw aria-hidden="true" className="h-3 w-3" />
                  <span>Sample</span>
                </button>
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-[#080808]">
                {settings.aboutImageUrl && (
                  <Image
                    src={settings.aboutImageUrl}
                    alt="Studio Portrait"
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ReplacePictureButton
                  folder="gallery"
                  label="Replace Portrait"
                  onReplaced={(res) =>
                    replaceSitePicture(
                      "aboutImageUrl",
                      res.imageUrl,
                      "Studio Portrait picture"
                    )
                  }
                />
                <span className="font-mono text-[10px] text-[#777777] truncate max-w-[220px]">
                  {settings.aboutImageUrl || "Unset"}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {(section === "all" || section === "categories") && (
        <section className="space-y-4">
          <h2 className="font-editorial text-2xl text-white">
            Category Cover Pictures ({categories.length})
          </h2>
          {categories.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-[#111111] p-6 text-sm text-[#A0A0A0]">
              No Firestore category documents found yet. Click &ldquo;Load Sample
              Pictures to Firestore&rdquo; above to populate all 10 categories.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-white/10 bg-[#111111] p-4 space-y-3"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#080808] border border-white/10">
                    {cat.coverImage && (
                      <Image
                        src={cat.coverImage}
                        alt={cat.name}
                        fill
                        sizes="360px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-editorial text-lg text-white truncate">
                        {cat.name}
                      </p>
                      <p className="font-mono text-[11px] text-[#C6A46A]">
                        /{cat.slug}
                      </p>
                    </div>
                    <ReplacePictureButton
                      folder="categories"
                      label="Replace"
                      onReplaced={(res) =>
                        replaceCategoryCover(cat, res.imageUrl)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Gallery Pictures */}
      {(section === "all" || section === "gallery") && (
        <section className="space-y-4">
          <h2 className="font-editorial text-2xl text-white">
            Gallery Pictures ({filteredGallery.length})
          </h2>
          {filteredGallery.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-[#111111] p-6 text-sm text-[#A0A0A0]">
              {gallery.length === 0
                ? 'No Firestore gallery documents found yet. Click "Load Sample Pictures to Firestore" above or use the Add Pictures tab.'
                : "No gallery frames match your search filter."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGallery.map((img) => (
                <div
                  key={img.id}
                  className="rounded-xl border border-white/10 bg-[#111111] p-4 space-y-3"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#080808] border border-white/10">
                    <Image
                      src={img.thumbnailUrl || img.imageUrl}
                      alt={img.title}
                      fill
                      sizes="360px"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="min-w-0">
                      <p className="font-editorial text-lg text-white truncate">
                        {img.title}
                      </p>
                      <p className="text-xs text-[#A0A0A0] truncate">
                        {img.categoryName || img.categoryId} · {img.location}
                      </p>
                    </div>
                    <ReplacePictureButton
                      folder="gallery"
                      label="Replace Picture"
                      onReplaced={(res) => replaceGalleryPicture(img, res)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Editorial Stories */}
      {(section === "all" || section === "stories") && (
        <section className="space-y-4">
          <h2 className="font-editorial text-2xl text-white">
            Editorial Story Covers ({stories.length})
          </h2>
          {stories.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-[#111111] p-6 text-sm text-[#A0A0A0]">
              No Firestore story documents found yet. Click &ldquo;Load Sample
              Pictures to Firestore&rdquo; above.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="rounded-xl border border-white/10 bg-[#111111] p-4 space-y-3"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#080808] border border-white/10">
                    {story.coverImage && (
                      <Image
                        src={story.coverImage}
                        alt={story.title}
                        fill
                        sizes="360px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="min-w-0">
                      <p className="font-editorial text-lg text-white truncate">
                        {story.title}
                      </p>
                      <p className="font-mono text-[11px] text-[#C6A46A] truncate">
                        /stories/{story.slug}
                      </p>
                    </div>
                    <ReplacePictureButton
                      folder="stories"
                      label="Replace Story Cover"
                      onReplaced={(res) =>
                        replaceStoryCover(story, res.imageUrl)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

