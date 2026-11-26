"use client";

import { Check, X, Trash2, Star } from "lucide-react";
import type { Testimonial } from "@/types";

export function TestimonialsManagerPanel({
  testimonials,
  onRefresh,
}: {
  testimonials: Testimonial[];
  onRefresh: () => Promise<void>;
}) {
  const moderate = async (id: string, approved: boolean) => {
    await fetch("/api/admin/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    await onRefresh();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/testimonials?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-editorial text-2xl text-white">
          Testimonial Moderation ({testimonials.length})
        </h2>
      </div>

      {testimonials.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 text-center text-sm text-[#A0A0A0]">
          No client testimonials have been submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-editorial text-2xl text-white">
                      {t.customerName}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] border ${
                        t.approved
                          ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/30"
                          : "border-amber-500/40 text-amber-300 bg-amber-950/30"
                      }`}
                    >
                      {t.approved ? "Approved" : "Pending Review"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        aria-hidden="true"
                        className="h-3.5 w-3.5 fill-[#C6A46A] text-[#C6A46A]"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!t.approved ? (
                    <button
                      type="button"
                      onClick={() => moderate(t.id, true)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-4 py-2 text-xs uppercase tracking-[0.14em] text-emerald-200 hover:bg-emerald-500/30"
                    >
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => moderate(t.id, false)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#CCCCCC] hover:border-amber-400"
                    >
                      <X aria-hidden="true" className="h-3.5 w-3.5" />
                      <span>Unpublish</span>
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={`Delete testimonial by ${t.customerName}`}
                    onClick={() => remove(t.id)}
                    className="rounded-full p-2 border border-red-500/30 text-red-300 hover:bg-red-950/50"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-[#CCCCCC] leading-relaxed">
                &ldquo;{t.message}&rdquo;
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

