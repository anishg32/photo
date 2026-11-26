import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyAdminFromSessionCookie } from "@/lib/firebase-admin";
import {
  getBookings,
  getCategories,
  getDashboardOverview,
  getGalleryImages,
  getSiteSettings,
  getStories,
  getTestimonials,
} from "@/lib/firestore";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Studio Admin Dashboard",
  robots: { index: false, follow: false },
};

async function AuthenticatedAdminPortal() {
  const admin = await verifyAdminFromSessionCookie();
  if (!admin) {
    redirect("/admin/login");
  }

  const [
    overview,
    gallery,
    categories,
    bookings,
    stories,
    testimonials,
    settings,
  ] = await Promise.all([
    getDashboardOverview(),
    getGalleryImages({ includeUnpublished: true, allowFallback: false }),
    getCategories({ allowFallback: false }),
    getBookings(),
    getStories({ includeUnpublished: true, allowFallback: false }),
    getTestimonials({ includePending: true }),
    getSiteSettings(),
  ]);

  return (
    <AdminDashboardClient
      admin={admin}
      initialOverview={overview}
      initialGallery={gallery.items}
      initialCategories={categories}
      initialBookings={bookings}
      initialStories={stories}
      initialTestimonials={testimonials}
      initialSettings={settings}
    />
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center font-mono text-xs uppercase tracking-[0.22em] text-[#C6A46A]">
          Verifying Studio Session...
        </div>
      }
    >
      <AuthenticatedAdminPortal />
    </Suspense>
  );
}

