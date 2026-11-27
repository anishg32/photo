import type { Metadata } from "next";
import { AdminPortalLoader } from "@/components/admin/AdminPortalLoader";

export const metadata: Metadata = {
  title: "Add Pictures | Studio Admin",
  robots: { index: false, follow: false },
};

export default function AdminAddPicturesPage() {
  return (
    <AdminPortalLoader
      routePath="/admin/add-pictures"
      initialTab="add-pictures"
    />
  );
}
