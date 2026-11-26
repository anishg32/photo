"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Camera,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { GalleryImage } from "@/types";

interface LightboxDialogProps {
  images: GalleryImage[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (nextIndex: number) => void;
}

export function LightboxDialog({
  images,
  activeIndex,
  onClose,
  onChangeIndex,
}: LightboxDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);

  const isOpen =
    activeIndex !== null && activeIndex >= 0 && activeIndex < images.length;
  const currentImage = isOpen ? images[activeIndex] : null;

  const goPrev = useCallback(() => {
    if (!isOpen || images.length <= 1) return;
    setZoomed(false);
    onChangeIndex((activeIndex! - 1 + images.length) % images.length);
  }, [activeIndex, images.length, isOpen, onChangeIndex]);

  const goNext = useCallback(() => {
    if (!isOpen || images.length <= 1) return;
    setZoomed(false);
    onChangeIndex((activeIndex! + 1) % images.length);
  }, [activeIndex, images.length, isOpen, onChangeIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      setZoomed(false);
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Keyboard navigation + native close synchronization
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      setZoomed(false);
      onClose();
    };
    dialog.addEventListener("close", handleClose);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    dialog.addEventListener("keydown", handleKeyDown);

    // Light-dismiss pointer fallback for browsers without <dialog closedby="any">
    let cleanupBackdrop: (() => void) | undefined;
    if (!("closedBy" in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const inner = dialog.querySelector("[data-lightbox-inner]");
        if (!inner) return false;
        const r = inner.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      const onDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e)) {
          dialog.close();
        }
      };
      dialog.addEventListener("pointerdown", onDown);
      dialog.addEventListener("pointerup", onUp);
      cleanupBackdrop = () => {
        dialog.removeEventListener("pointerdown", onDown);
        dialog.removeEventListener("pointerup", onUp);
      };
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("keydown", handleKeyDown);
      cleanupBackdrop?.();
    };
  }, [goNext, goPrev, onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="lightbox-title"
      {...({ closedby: "any" } as Record<string, string>)}
      className="lightbox-dialog m-auto w-[96vw] max-w-7xl max-h-[94dvh] bg-transparent p-0 border-0 overflow-visible"
    >
      {currentImage && (
        <div
          data-lightbox-inner
          className="liquid-glass rounded-xl overflow-hidden flex flex-col lg:flex-row max-h-[92dvh] text-white"
        >
          {/* Image Canvas */}
          <div className="relative flex-1 bg-[#050505] min-h-[45dvh] lg:min-h-[75dvh] flex items-center justify-center overflow-auto">
            <div
              className={`relative transition-transform duration-500 ease-out ${
                zoomed
                  ? "w-[140%] h-[140%] cursor-zoom-out"
                  : "w-full h-full min-h-[45dvh] lg:min-h-[75dvh] cursor-zoom-in"
              }`}
              onClick={() => setZoomed((z) => !z)}
            >
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.title}
                fill
                sizes="(max-width: 1024px) 96vw, 70vw"
                className="object-contain p-2 sm:p-6"
                priority
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous photograph"
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/70 border border-white/20 text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[48px] min-w-[48px]"
                >
                  <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next photograph"
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-black/70 border border-white/20 text-white hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[48px] min-w-[48px]"
                >
                  <ChevronRight aria-hidden="true" className="h-5 w-5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              aria-label={zoomed ? "Reset image zoom" : "Zoom photograph"}
              className="absolute bottom-4 right-4 inline-flex items-center justify-center rounded-full bg-black/70 border border-white/15 text-white/80 hover:text-[#C6A46A] min-h-[44px] min-w-[44px]"
            >
              {zoomed ? (
                <Minimize2 aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Maximize2 aria-hidden="true" className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Metadata Side Panel */}
          <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0d0d0d]/95 p-6 sm:p-8 flex flex-col justify-between gap-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#C6A46A]">
                  Frame {String((activeIndex ?? 0) + 1).padStart(2, "0")} /{" "}
                  {String(images.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  autoFocus
                  aria-label="Close lightbox"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-[#C6A46A] hover:text-white transition-colors min-h-[44px] min-w-[44px]"
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {currentImage.categoryName && (
                  <p className="text-xs tracking-[0.22em] uppercase text-[#C6A46A]">
                    {currentImage.categoryName}
                  </p>
                )}
                <h1
                  id="lightbox-title"
                  className="font-editorial text-3xl sm:text-4xl font-normal text-white leading-tight"
                >
                  {currentImage.title}
                </h1>
                <p className="text-sm text-[#A0A0A0] leading-relaxed">
                  {currentImage.description}
                </p>
              </div>

              <dl className="space-y-3 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-center gap-3 text-white/80">
                  <dt className="sr-only">Capture Location</dt>
                  <MapPin
                    aria-hidden="true"
                    className="h-4 w-4 text-[#C6A46A] shrink-0"
                  />
                  <dd>{currentImage.location}</dd>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <dt className="sr-only">Capture Date</dt>
                  <Calendar
                    aria-hidden="true"
                    className="h-4 w-4 text-[#C6A46A] shrink-0"
                  />
                  <dd className="font-mono">{currentImage.captureDate}</dd>
                </div>
                {currentImage.cameraSpec && (
                  <div className="flex items-center gap-3 text-white/80">
                    <dt className="sr-only">Camera Specification</dt>
                    <Camera
                      aria-hidden="true"
                      className="h-4 w-4 text-[#C6A46A] shrink-0"
                    />
                    <dd className="font-mono text-[11px] text-[#A0A0A0]">
                      {currentImage.cameraSpec}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#A0A0A0]">
              <span>Use &larr; / &rarr; keys to step</span>
              <span>ESC to close</span>
            </div>
          </aside>
        </div>
      )}
    </dialog>
  );
}

