import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
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
import { AdminDashboardClient, type AdminTab } from "./AdminDashboardClient";

async function AuthenticatedPortal({
  routePath,
  initialTab,
  searchParamsPromise,
}: {
  routePath: string;
  initialTab: AdminTab;
  searchParamsPromise?: Promise<{ tab?: string }>;
}) {
  await connection();
  const resolvedSearch = searchParamsPromise ? await searchParamsPromise : {};
  const tabParam = resolvedSearch.tab;
  const effectiveTab: AdminTab =
    tabParam &&
    [
      "overview",
      "add-pictures",
      "replace-pictures",
      "gallery",
      "categories",
      "bookings",
      "stories",
      "testimonials",
      "settings",
    ].includes(tabParam)
      ? (tabParam as AdminTab)
      : initialTab;

  const admin = await verifyAdminFromSessionCookie();
  if (!admin) {
    redirect(`/admin/login?next=${encodeURIComponent(routePath)}`);
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
      initialTab={effectiveTab}
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

/** Shared authenticated server portal wrapper for /admin and dedicated sub-routes. */
export function AdminPortalLoader({
  routePath = "/admin",
  initialTab = "overview",
  searchParamsPromise,
}: {
  routePath?: string;
  initialTab?: AdminTab;
  searchParamsPromise?: Promise<{ tab?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center font-mono text-xs uppercase tracking-[0.22em] text-[#C6A46A]">
          Verifying Studio Session...
        </div>
      }
    >
      <AuthenticatedPortal
        routePath={routePath}
        initialTab={initialTab}
        searchParamsPromise={searchParamsPromise}
      />
    </Suspense>
  );
}
