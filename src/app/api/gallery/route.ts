import { NextResponse } from "next/server";
import { getGalleryImages } from "@/lib/firestore";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categorySlug = url.searchParams.get("category") ?? undefined;
  const searchQuery = url.searchParams.get("search") ?? undefined;
  const featuredOnly = url.searchParams.get("featured") === "true";
  const limitParam = Number(url.searchParams.get("limit") ?? "24");
  const offsetParam = Number(url.searchParams.get("offset") ?? "0");

  const limitCount =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(limitParam, 60)
      : 24;
  const offset =
    Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  const result = await getGalleryImages({
    categorySlug,
    searchQuery,
    featuredOnly,
    limitCount,
    offset,
  });

  return NextResponse.json(result);
}

