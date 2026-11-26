"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  MessageSquarePlus,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Testimonial } from "@/types";
import { getAppCheckHeaders } from "@/lib/firebase";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const scrollToSlide = (idx: number) => {
    const track = trackRef.current;
    if (!track || testimonials.length === 0) return;
    const bounded =
      ((idx % testimonials.length) + testimonials.length) % testimonials.length;
    const slideEl = track.children[bounded] as HTMLElement | undefined;
    if (slideEl) {
      track.scrollTo({
        left: slideEl.offsetLeft,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
    setCurrentSlide(bounded);
    setStatusMessage(
      `Showing testimonial ${bounded + 1} of ${testimonials.length}`
    );
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track || testimonials.length === 0) return;

    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const slides = Array.from(track.children) as HTMLElement[];
        let nearestIdx = 0;
        let minDiff = Infinity;
        for (let i = 0; i < slides.length; i++) {
          const diff = Math.abs(slides[i].offsetLeft - track.scrollLeft);
          if (diff < minDiff) {
            minDiff = diff;
            nearestIdx = i;
          }
        }
        setCurrentSlide(nearestIdx);
      });
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("scroll", onScroll);
    };
  }, [testimonials.length]);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitState(null);
    try {
      const appCheckHeaders = await getAppCheckHeaders();
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...appCheckHeaders,
        },
        body: JSON.stringify({
          customerName,
          serviceType,
          rating,
          message,
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setSubmitState({
          type: "error",
          text: data.error || "Unable to submit your testimonial right now.",
        });
      } else {
        setSubmitState({
          type: "success",
          text:
            data.message ||
            "Thank you. Your reflection has been received for studio verification.",
        });
        setCustomerName("");
        setServiceType("");
        setRating(5);
        setMessage("");
      }
    } catch {
      setSubmitState({
        type: "error",
        text: "Network error while sending your reflection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="testimonials"
      className="py-24 sm:py-32 bg-[#080808] border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs font-mono tracking-[0.28em] uppercase text-[#C6A46A]">
              07 · Client Perspectives
            </p>
            <h2 className="mt-3 font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal text-white">
              Words from Our Clients.
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitState(null);
              dialogRef.current?.showModal();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-xs tracking-[0.16em] uppercase text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[44px] self-start md:self-auto"
          >
            <MessageSquarePlus aria-hidden="true" className="h-4 w-4 text-[#C6A46A]" />
            <span>Share Your Experience</span>
          </button>
        </ScrollReveal>

        {testimonials.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111111] p-10 sm:p-14 text-center space-y-4">
            <Quote
              aria-hidden="true"
              className="mx-auto h-8 w-8 text-[#C6A46A]/60"
            />
            <p className="font-editorial text-2xl sm:text-3xl text-white">
              Authentic Client Reflections Archive
            </p>
            <p className="text-sm text-[#A0A0A0] max-w-lg mx-auto">
              MJ PHOTOGRAPHY publishes only genuine, administrator-verified client
              testimonials from completed commissions. Approved reflections will
              appear here automatically.
            </p>
          </div>
        ) : (
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Client Testimonials"
            className="space-y-6"
          >
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => scrollToSlide(currentSlide - 1)}
                aria-label="Previous testimonial"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-[#111111] text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[44px] min-w-[44px]"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSlide(currentSlide + 1)}
                aria-label="Next testimonial"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-[#111111] text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[44px] min-w-[44px]"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div
              ref={trackRef}
              tabIndex={0}
              role="group"
              aria-label="Testimonial slides"
              className="testimonial-track"
            >
              {testimonials.map((t, idx) => (
                <div
                  key={t.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${idx + 1} of ${testimonials.length}`}
                  className="shrink-0 w-full md:w-[calc(50%-0.75rem)] snap-center rounded-2xl border border-white/10 bg-[#111111] p-8 sm:p-10 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Rated ${t.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          aria-hidden="true"
                          className={`h-4 w-4 ${
                            starIdx < t.rating
                              ? "fill-[#C6A46A] text-[#C6A46A]"
                              : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="font-editorial text-2xl sm:text-[1.7rem] text-white leading-snug">
                      &ldquo;{t.message}&rdquo;
                    </blockquote>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                    {t.customerPhotoUrl && (
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#C6A46A]/40">
                        <Image
                          src={t.customerPhotoUrl}
                          alt={t.customerName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {t.customerName}
                      </p>
                      {t.serviceType && (
                        <p className="text-xs font-mono uppercase tracking-[0.14em] text-[#C6A46A]">
                          {t.serviceType}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="visually-hidden" role="status" aria-live="polite">
              {statusMessage}
            </p>

            {testimonials.length > 1 && (
              <nav
                aria-label="Choose a testimonial"
                className="flex items-center justify-center gap-2 pt-2"
              >
                {testimonials.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => scrollToSlide(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    aria-current={idx === currentSlide ? "true" : undefined}
                    className={`h-6 px-1.5 flex items-center justify-center transition-all`}
                  >
                    <span
                      className={`block h-2 rounded-full transition-all ${
                        idx === currentSlide
                          ? "w-8 bg-[#C6A46A]"
                          : "w-2 bg-white/25 hover:bg-white/50"
                      }`}
                    />
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}
      </div>

      {/* Native <dialog> to submit a genuine client review for admin verification */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        {...({ closedby: "any" } as Record<string, string>)}
        className="m-auto w-[92vw] max-w-lg rounded-2xl border border-white/15 bg-[#111111] p-6 sm:p-8 text-white"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#C6A46A]">
              Client Reflection
            </p>
            <h1 id={titleId} className="font-editorial text-3xl text-white mt-1">
              Share Your Experience
            </h1>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close review modal"
            className="inline-flex items-center justify-center rounded-full border border-white/15 min-h-[44px] min-w-[44px] text-white/80 hover:text-white"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4">
          <div className="hidden" aria-hidden="true">
            <label htmlFor="review-website">Website</label>
            <input
              id="review-website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="review-name"
              className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
            >
              Your Name <span aria-hidden="true">*</span>
            </label>
            <input
              id="review-name"
              name="customerName"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="review-service"
                className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
              >
                Session Type
              </label>
              <input
                id="review-service"
                name="serviceType"
                type="text"
                placeholder="e.g., Wedding Photography"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="studio-input w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="review-rating"
                className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
              >
                Rating (1–5) <span aria-hidden="true">*</span>
              </label>
              <select
                id="review-rating"
                name="rating"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="studio-select w-full rounded-lg px-4 py-2.5 text-sm"
              >
                <option value={5}>5 Stars — Exceptional</option>
                <option value={4}>4 Stars — Very Satisfied</option>
                <option value={3}>3 Stars — Good</option>
                <option value={2}>2 Stars — Fair</option>
                <option value={1}>1 Star — Needs Improvement</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="review-message"
              className="block text-xs tracking-[0.14em] uppercase text-[#CCCCCC] mb-1.5"
            >
              Your Reflection <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="review-message"
              name="message"
              required
              minLength={12}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="studio-textarea w-full rounded-lg px-4 py-2.5 text-sm resize-y"
            />
          </div>

          {submitState && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-lg border p-3.5 text-sm flex items-start gap-2.5 ${
                submitState.type === "success"
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                  : "border-red-500/40 bg-red-950/40 text-red-200"
              }`}
            >
              {submitState.type === "success" ? (
                <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
              )}
              <span>{submitState.text}</span>
            </div>
          )}

          <p className="text-[11px] text-[#A0A0A0]">
            Submitted reflections enter studio moderation and appear publicly only
            after verification.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#C6A46A] text-[#080808] font-semibold py-3.5 px-6 text-xs tracking-[0.18em] uppercase hover:bg-[#d8b87d] disabled:opacity-60 transition-colors min-h-[48px]"
          >
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      </dialog>
    </section>
  );
}

