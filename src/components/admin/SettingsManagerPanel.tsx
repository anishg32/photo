"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import type { SiteSettings, StudioService } from "@/types";
import { adminJsonRequest } from "@/lib/admin-client";
import { ImageUploadField } from "./ImageUploadField";
import { ReplacePictureButton } from "./ReplacePictureButton";

export function SettingsManagerPanel({
  settings,
  onRefresh,
}: {
  settings: SiteSettings;
  onRefresh: () => Promise<void>;
}) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const updateService = (
    idx: number,
    patch: Partial<StudioService>
  ) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFeedback(data.error || "Unable to update website settings.");
      } else {
        setFeedback("Website settings saved to Firestore.");
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-[#111111] p-6 sm:p-8 space-y-8"
    >
      <div className="space-y-4">
        <h2 className="font-editorial text-2xl text-white border-b border-white/10 pb-3">
          Brand &amp; Studio Contact Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Brand Name *
            </label>
            <input
              type="text"
              required
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Tagline *
            </label>
            <input
              type="text"
              required
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Contact Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Phone *
            </label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) =>
                setForm({ ...form, instagramUrl: e.target.value })
              }
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              value={form.facebookUrl}
              onChange={(e) =>
                setForm({ ...form, facebookUrl: e.target.value })
              }
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
            Studio Address *
          </label>
          <input
            type="text"
            required
            value={form.studioAddress}
            onChange={(e) =>
              setForm({ ...form, studioAddress: e.target.value })
            }
            className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
            About Section Headline *
          </label>
          <input
            type="text"
            required
            value={form.aboutHeadline}
            onChange={(e) =>
              setForm({ ...form, aboutHeadline: e.target.value })
            }
            className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-[#CCCCCC]">
                Homepage Hero Picture
              </p>
              <ReplacePictureButton
                folder="gallery"
                label="Replace Hero Picture"
                onReplaced={async (res) => {
                  try {
                    await adminJsonRequest("/api/admin/settings", "PATCH", {
                      heroImageUrl: res.imageUrl,
                      replacePreviousImage: true,
                    });
                    setForm((prev) => ({ ...prev, heroImageUrl: res.imageUrl }));
                    setFeedback("Hero cover picture replaced.");
                    await onRefresh();
                  } catch (err) {
                    const msg =
                      err instanceof Error
                        ? err.message
                        : "Failed to replace hero picture.";
                    setFeedback(msg);
                    throw new Error(msg);
                  }
                }}
              />
            </div>
            {form.heroImageUrl && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={form.heroImageUrl}
                  alt="Current Homepage Hero"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            )}
            <ImageUploadField
              folder="gallery"
              label="Or Upload New Hero File"
              onUploaded={(res) =>
                setForm((prev) => ({ ...prev, heroImageUrl: res.imageUrl }))
              }
            />
            <input
              type="text"
              placeholder="Hero image URL"
              value={form.heroImageUrl || ""}
              onChange={(e) =>
                setForm({ ...form, heroImageUrl: e.target.value })
              }
              className="studio-input w-full rounded-lg px-4 py-2 text-xs font-mono"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.14em] text-[#CCCCCC]">
                Studio Portrait (About Section)
              </p>
              <ReplacePictureButton
                folder="gallery"
                label="Replace Portrait"
                onReplaced={async (res) => {
                  try {
                    await adminJsonRequest("/api/admin/settings", "PATCH", {
                      aboutImageUrl: res.imageUrl,
                      replacePreviousImage: true,
                    });
                    setForm((prev) => ({
                      ...prev,
                      aboutImageUrl: res.imageUrl,
                    }));
                    setFeedback("Studio portrait picture replaced.");
                    await onRefresh();
                  } catch (err) {
                    const msg =
                      err instanceof Error
                        ? err.message
                        : "Failed to replace studio portrait.";
                    setFeedback(msg);
                    throw new Error(msg);
                  }
                }}
              />
            </div>
            {form.aboutImageUrl && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={form.aboutImageUrl}
                  alt="Current Studio Portrait"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            )}
            <ImageUploadField
              folder="gallery"
              label="Or Upload New Portrait File"
              onUploaded={(res) =>
                setForm((prev) => ({ ...prev, aboutImageUrl: res.imageUrl }))
              }
            />
            <input
              type="text"
              placeholder="About portrait URL"
              value={form.aboutImageUrl || ""}
              onChange={(e) =>
                setForm({ ...form, aboutImageUrl: e.target.value })
              }
              className="studio-input w-full rounded-lg px-4 py-2 text-xs font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.14em] text-[#CCCCCC] mb-1">
            Photographer Biography &amp; Philosophy *
          </label>
          <textarea
            required
            rows={4}
            value={form.aboutBio}
            onChange={(e) => setForm({ ...form, aboutBio: e.target.value })}
            className="studio-textarea w-full rounded-lg px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-editorial text-2xl text-white border-b border-white/10 pb-3">
          Services &amp; Optional Commission Pricing
        </h3>
        <div className="space-y-4">
          {form.services.map((service, idx) => (
            <div
              key={service.id}
              className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#A0A0A0] mb-1">
                    Service Title
                  </label>
                  <input
                    type="text"
                    required
                    value={service.title}
                    onChange={(e) =>
                      updateService(idx, { title: e.target.value })
                    }
                    className="studio-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-[#A0A0A0] mb-1">
                    Optional Starting Rate (Leave blank for quote-only)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Commissions starting at ..."
                    value={service.startingPrice || ""}
                    onChange={(e) =>
                      updateService(idx, { startingPrice: e.target.value })
                    }
                    className="studio-input w-full rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#A0A0A0] mb-1">
                  Service Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={service.description}
                  onChange={(e) =>
                    updateService(idx, { description: e.target.value })
                  }
                  className="studio-textarea w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {feedback && <p className="text-xs font-mono text-[#C6A46A]">{feedback}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-[#C6A46A] text-[#080808] font-semibold px-7 py-3 text-xs uppercase tracking-[0.18em] hover:bg-[#d8b87d] disabled:opacity-60 min-h-[44px]"
      >
        {saving ? "Saving Settings..." : "Save Website Settings"}
      </button>
    </form>
  );
}

