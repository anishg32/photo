"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Aperture, ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/categories", label: "Categories" },
  { href: "/gallery", label: "Gallery" },
  { href: "/exhibition", label: "3D Museum" },
  { href: "/stories", label: "Stories" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ brandName = "MJ PHOTOGRAPHY" }: { brandName?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer smoothly on route navigation
  useEffect(() => {
    const dialog = drawerRef.current;
    if (dialog?.open) {
      dialog.close();
      setDrawerOpen(false);
    }
  }, [pathname]);

  // Safari fallback for light-dismiss outside click on native <dialog>
  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;

    const handleClose = () => setDrawerOpen(false);
    dialog.addEventListener("close", handleClose);

    if (!("closedBy" in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const panel = dialog.querySelector("[data-drawer-panel]");
        if (!panel) return false;
        const r = panel.getBoundingClientRect();
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
        if (pressedOutside && isOutside(e) && dialog.open) {
          dialog.close();
        }
      };
      dialog.addEventListener("pointerdown", onDown);
      dialog.addEventListener("pointerup", onUp);
      return () => {
        dialog.removeEventListener("close", handleClose);
        dialog.removeEventListener("pointerdown", onDown);
        dialog.removeEventListener("pointerup", onUp);
      };
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
    };
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const openDrawer = () => {
    const dialog = drawerRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    const dialog = drawerRef.current;
    if (dialog?.open) {
      dialog.close();
    }
    setDrawerOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3 px-4 sm:px-6 lg:px-10" : "py-5 px-4 sm:px-8 lg:px-12"
        }`}
      >
        <div
          className={`mx-auto max-w-[88rem] flex items-center justify-between gap-6 xl:gap-8 rounded-full transition-all duration-500 ${
            scrolled
              ? "liquid-glass px-5 sm:px-7 py-2.5 shadow-2xl"
              : "bg-black/35 backdrop-blur-md border border-white/10 px-5 sm:px-7 py-2.5"
          }`}
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-white shrink-0 min-h-[44px] pr-2"
          >
            <Aperture
              aria-hidden="true"
              className="h-5 w-5 text-[#C6A46A] transition-transform duration-700 group-hover:rotate-90"
            />
            <span className="font-editorial text-lg sm:text-xl tracking-[0.2em] uppercase whitespace-nowrap">
              {brandName}
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden xl:flex flex-1 items-center justify-center"
          >
            <ul className="flex items-center justify-center gap-1.5 list-none m-0 p-0">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative px-3 py-2 text-[11px] tracking-[0.16em] uppercase transition-colors whitespace-nowrap rounded-full inline-flex items-center min-h-[40px] ${
                        active
                          ? "text-[#C6A46A] bg-white/[0.06] font-medium after:content-[''] after:absolute after:inset-x-3 after:bottom-1.5 after:h-[2px] after:rounded-full after:bg-[#C6A46A]"
                          : "text-white/80 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3 shrink-0 pl-2">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#C6A46A] px-5 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#080808] hover:bg-[#d8b87d] transition-colors min-h-[40px] whitespace-nowrap"
            >
              <span>Book Session</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              className="xl:hidden inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:border-[#C6A46A]/60 hover:text-[#C6A46A] transition-colors min-h-[44px] min-w-[44px] px-3 gap-2"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
              <span className="text-xs tracking-[0.14em] uppercase hidden sm:inline">
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Native top-layer modal navigation drawer for mobile & tablet */}
      <dialog
        ref={drawerRef}
        id="mobile-nav-drawer"
        aria-label="Mobile Navigation"
        {...({ closedby: "any" } as Record<string, string>)}
        className="m-0 ml-auto h-[100dvh] max-h-none w-full max-w-sm bg-transparent p-0 backdrop:bg-black/80"
      >
        <div
          data-drawer-panel
          className="h-full w-full bg-[#0d0d0d] border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between text-white overflow-y-auto"
        >
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-2.5">
                <Aperture aria-hidden="true" className="h-5 w-5 text-[#C6A46A]" />
                <span className="font-editorial text-lg tracking-[0.2em] uppercase">
                  {brandName}
                </span>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                autoFocus
                aria-label="Close navigation menu"
                className="inline-flex items-center justify-center rounded-full border border-white/15 min-h-[44px] min-w-[44px] text-white/80 hover:text-white hover:border-[#C6A46A]"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="mt-8">
              <ul className="space-y-2 list-none p-0 m-0">
                {NAV_LINKS.map((item, idx) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeDrawer}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between py-3.5 px-4 rounded-lg border transition-colors min-h-[48px] ${
                          active
                            ? "border-[#C6A46A]/60 bg-[#C6A46A]/15 text-[#C6A46A]"
                            : "border-transparent text-white/85 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="font-editorial text-2xl tracking-wide">
                          {item.label}
                        </span>
                        <span className="font-mono text-xs text-white/40">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-4">
            <p className="text-xs tracking-[0.18em] uppercase text-[#C6A46A]">
              Every Frame Tells A Story.
            </p>
            <Link
              href="/contact"
              onClick={closeDrawer}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-[#C6A46A] text-[#080808] font-medium py-3.5 px-6 text-xs tracking-[0.18em] uppercase hover:bg-[#d5b67e] transition-colors min-h-[48px]"
            >
              <span>Inquire &amp; Reserve Date</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}

