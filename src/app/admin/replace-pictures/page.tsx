import type { Metadata } from "next";
import { AdminPortalLoader } from "@/components/admin/AdminPortalLoader";

export const metadata: Metadata = {
  title: "Replace Pictures | Studio Admin",
  robots: { index: false, follow: false },
};

export default function AdminReplacePicturesPage() {
  return (
    <AdminPortalLoader
      routePath="/admin/replace-pictures"
      initialTab="replace-pictures"
    />
  );
}
