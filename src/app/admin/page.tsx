import type { Metadata } from "next";
import { AdminPortalLoader } from "@/components/admin/AdminPortalLoader";

export const metadata: Metadata = {
  title: "Studio Admin Dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <AdminPortalLoader
      routePath="/admin"
      initialTab="overview"
      searchParamsPromise={props.searchParams}
    />
  );
}
