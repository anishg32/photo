"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Aperture,
  Camera,
  FolderKanban,
  CalendarCheck,
  BookOpen,
  MessageSquareQuote,
  Settings,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Database,
} from "lucide-react";
import type {
  Booking,
  Category,
  DashboardOverview,
  GalleryImage,
  SiteSettings,
  Story,
  Testimonial,
} from "@/types";
import { signOutAdmin } from "@/lib/firebase-auth";
import { GalleryManagerPanel } from "./GalleryManagerPanel";
import { CategoryManagerPanel } from "./CategoryManagerPanel";
import { BookingsManagerPanel } from "./BookingsManagerPanel";
import { StoriesManagerPanel } from "./StoriesManagerPanel";
import { TestimonialsManagerPanel } from "./TestimonialsManagerPanel";
import { SettingsManagerPanel } from "./SettingsManagerPanel";

type AdminTab =
  | "overview"
  | "gallery"
  | "categories"
  | "bookings"
  | "stories"
  | "testimonials"
  | "settings";

interface AdminDashboardClientProps {
  admin: { uid: string; email: string; name?: string };
  initialOverview: DashboardOverview;
  initialGallery: GalleryImage[];
  initialCategories: Category[];
  initialBookings: Booking[];
  initialStories: Story[];
  initialTestimonials: Testimonial[];
  initialSettings: SiteSettings;
}

export function AdminDashboardClient({
  admin,
  initialOverview,
  initialGallery,
  initialCategories,
  initialBookings,
  initialStories,
  initialTestimonials,
  initialSettings,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState(initialOverview);
  const [gallery, setGallery] = useState(initialGallery);
  const [categories, setCategories] = useState(initialCategories);
  const [bookings, setBookings] = useState(initialBookings);
  const [stories, setStories] = useState(initialStories);
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [settings, setSettings] = useState(initialSettings);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    const [ovRes, galRes, catRes, bookRes, stRes, testRes, setRes] =
      await Promise.all([
        fetch("/api/admin/overview").then((r) => r.json()),
        fetch("/api/admin/gallery").then((r) => r.json()),
        fetch("/api/admin/categories").then((r) => r.json()),
        fetch("/api/admin/bookings").then((r) => r.json()),
        fetch("/api/admin/stories").then((r) => r.json()),
        fetch("/api/admin/testimonials").then((r) => r.json()),
        fetch("/api/admin/settings").then((r) => r.json()),
      ]);

    if (ovRes.overview) setOverview(ovRes.overview);
    if (galRes.items) setGallery(galRes.items);
    if (catRes.items) setCategories(catRes.items);
    if (bookRes.items) setBookings(bookRes.items);
    if (stRes.items) setStories(stRes.items);
    if (testRes.items) setTestimonials(testRes.items);
    if (setRes.settings) setSettings(setRes.settings);
  }, []);

  const handleSeedCatalog = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      setSeedMessage(data.message || data.error || "Seed request finished.");
      await refreshAll();
    } finally {
      setSeeding(false);
    }
  };

  const handleLogout = async () => {
    await signOutAdmin();
    router.push("/admin/login");
    router.refresh();
  };

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "gallery", label: "Gallery", icon: Camera, badge: overview.totalPhotographs },
    {
      id: "categories",
      label: "Categories",
      icon: FolderKanban,
      badge: overview.totalCategories,
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: CalendarCheck,
      badge: overview.pendingBookings,
    },
    { id: "stories", label: "Stories", icon: BookOpen, badge: overview.totalStories },
    {
      id: "testimonials",
      label: "Testimonials",
      icon: MessageSquareQuote,
      badge: overview.pendingTestimonials,
    },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0d0d0d] p-6 flex flex-col justify-between gap-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between lg:block space-y-2">
            <div className="flex items-center gap-2.5">
              <Aperture aria-hidden="true" className="h-5 w-5 text-[#C6A46A]" />
              <span className="font-editorial text-xl tracking-[0.2em] uppercase">
                MJ STUDIO
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#A0A0A0] truncate">
              {admin.email}
            </p>
          </div>

          <nav aria-label="Admin sections" className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs tracking-[0.14em] uppercase transition-colors shrink-0 min-h-[44px] ${
                    active
                      ? "bg-[#C6A46A] text-[#080808] font-semibold"
                      : "text-[#A0A0A0] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                  {typeof item.badge === "number" && (
                    <span
                      className={`font-mono text-[11px] px-2 py-0.5 rounded-full ${
                        active
                          ? "bg-black/20 text-[#080808]"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 flex lg:flex-col gap-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-white/80 hover:border-[#C6A46A] hover:text-[#C6A46A] transition-colors min-h-[40px]"
          >
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            <span>View Live Site</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/30 px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-red-300 hover:bg-red-950/40 transition-colors min-h-[40px]"
          >
            <LogOut aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 max-w-6xl">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#C6A46A]">
                  Administrator Overview
                </p>
                <h1 className="font-editorial text-4xl text-white mt-1">
                  Studio Telemetry &amp; Inventory
                </h1>
              </div>

              <button
                type="button"
                onClick={handleSeedCatalog}
                disabled={seeding}
                className="inline-flex items-center gap-2 rounded-full border border-[#C6A46A]/60 bg-[#C6A46A]/10 px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-[#C6A46A] hover:bg-[#C6A46A] hover:text-[#080808] transition-colors min-h-[44px]"
              >
                <Database aria-hidden="true" className="h-4 w-4" />
                <span>
                  {seeding ? "Initializing..." : "Initialize Studio Catalog"}
                </span>
              </button>
            </div>

            {seedMessage && (
              <p className="rounded-xl border border-[#C6A46A]/40 bg-[#C6A46A]/10 p-4 text-xs font-mono text-[#C6A46A]">
                {seedMessage}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">
                  Total Photographs
                </p>
                <p className="font-editorial text-5xl text-white">
                  {overview.totalPhotographs}
                </p>
                <p className="text-xs text-[#C6A46A]">
                  {overview.publishedPhotographs} published live
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">
                  Total Categories
                </p>
                <p className="font-editorial text-5xl text-white">
                  {overview.totalCategories}
                </p>
                <p className="text-xs text-[#A0A0A0]">Active portfolio divisions</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">
                  Total Booking Enquiries
                </p>
                <p className="font-editorial text-5xl text-white">
                  {overview.totalBookings}
                </p>
                <p className="text-xs text-[#C6A46A]">
                  {overview.pendingBookings} pending studio reply
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">
                  Published Stories
                </p>
                <p className="font-editorial text-5xl text-white">
                  {overview.publishedStories}
                </p>
                <p className="text-xs text-[#A0A0A0]">
                  of {overview.totalStories} total essays
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111111] p-6 space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#A0A0A0]">
                  Testimonials
                </p>
                <p className="font-editorial text-5xl text-white">
                  {overview.approvedTestimonials}
                </p>
                <p className="text-xs text-[#C6A46A]">
                  {overview.pendingTestimonials} awaiting moderation
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <GalleryManagerPanel
            items={gallery}
            categories={categories}
            onRefresh={refreshAll}
          />
        )}

        {activeTab === "categories" && (
          <CategoryManagerPanel
            categories={categories}
            onRefresh={refreshAll}
          />
        )}

        {activeTab === "bookings" && (
          <BookingsManagerPanel bookings={bookings} onRefresh={refreshAll} />
        )}

        {activeTab === "stories" && (
          <StoriesManagerPanel stories={stories} onRefresh={refreshAll} />
        )}

        {activeTab === "testimonials" && (
          <TestimonialsManagerPanel
            testimonials={testimonials}
            onRefresh={refreshAll}
          />
        )}

        {activeTab === "settings" && (
          <SettingsManagerPanel settings={settings} onRefresh={refreshAll} />
        )}
      </div>
    </div>
  );
}

