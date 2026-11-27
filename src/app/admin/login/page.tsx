import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminLoginClient } from "@/components/admin/AdminLoginClient";

export const metadata: Metadata = {
  title: "Studio Admin Login",
  robots: { index: false, follow: false },
};

function sanitizeAdminNext(rawNext: string | undefined): string {
  if (rawNext && /^\/admin(?:\/[a-z0-9-]+)?$/.test(rawNext)) {
    return rawNext;
  }
  return "/admin";
}

async function LoginWithNext({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AdminLoginClient initialNext={sanitizeAdminNext(next)} />;
}

export default function AdminLoginPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<AdminLoginClient initialNext="/admin" />}>
      <LoginWithNext searchParams={props.searchParams} />
    </Suspense>
  );
}
