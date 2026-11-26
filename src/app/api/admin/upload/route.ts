import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase-admin";
import { processAndUploadPhotographyServer } from "@/lib/storage-server";
import type { StorageFolder } from "@/lib/firebase-storage";

const ALLOWED_FOLDERS = new Set<Exclude<StorageFolder, "thumbnails">>([
  "gallery",
  "categories",
  "stories",
]);

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = String(formData.get("folder") || "gallery");
    const folder = ALLOWED_FOLDERS.has(
      folderRaw as Exclude<StorageFolder, "thumbnails">
    )
      ? (folderRaw as Exclude<StorageFolder, "thumbnails">)
      : "gallery";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await processAndUploadPhotographyServer({
      buffer,
      mimeType: file.type,
      originalFilename: file.name,
      folder,
    });

    return NextResponse.json({ ok: true, ...uploaded }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload photography asset.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

