import path from "node:path";

export const MEDIA_ALLOWED_FOLDERS = new Set([
  "gallery",
  "categories",
  "stories",
  "thumbnails",
]);

const SAFE_FILENAME_RE = /^[a-z0-9][a-z0-9._-]{0,140}$/i;

export function getLocalUploadsRoot(): string {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
}

export function resolveSafeMediaSegments(
  segments: string[]
): { folder: string; filename: string; docId: string; localPath: string } | null {
  if (segments.length !== 2) return null;
  const [folder, filename] = segments;
  if (!MEDIA_ALLOWED_FOLDERS.has(folder)) return null;
  if (!SAFE_FILENAME_RE.test(filename) || filename.includes("..")) return null;

  const localPath = path.join(
    /*turbopackIgnore: true*/ getLocalUploadsRoot(),
    folder,
    filename
  );
  return {
    folder,
    filename,
    docId: `${folder}__${filename}`,
    localPath,
  };
}

export function inferImageMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".avif")) return "image/avif";
  if (lower.endsWith(".tif") || lower.endsWith(".tiff")) return "image/tiff";
  return "image/jpeg";
}
