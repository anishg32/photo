import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getClientStorage } from "./firebase";
import { validateImageFileMeta } from "./validation";

export type StorageFolder = "gallery" | "thumbnails" | "categories" | "stories";

export interface UploadProgressInfo {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export function sanitizeStorageFileName(originalName: string): string {
  const lastDot = originalName.lastIndexOf(".");
  const base =
    lastDot > 0 ? originalName.slice(0, lastDot) : originalName;
  const ext = lastDot > 0 ? originalName.slice(lastDot).toLowerCase() : ".jpg";

  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  const safeExt = /\.(jpe?g|png|webp|avif|tiff?)$/.test(ext) ? ext : ".jpg";
  return `${Date.now()}-${cleanBase || "frame"}${safeExt}`;
}

export async function uploadImageDirectToStorage(
  file: File,
  folder: StorageFolder,
  onProgress?: (info: UploadProgressInfo) => void
): Promise<{ url: string; path: string }> {
  const check = validateImageFileMeta(file.type, file.size);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const storage = getClientStorage();
  if (!storage) {
    throw new Error("Firebase Storage is not configured.");
  }

  const fileName = sanitizeStorageFileName(file.name);
  const fullPath = `${folder}/${fileName}`;
  const storageRef = ref(storage, fullPath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      cacheControl: "public,max-age=31536000,immutable",
    });

    task.on(
      "state_changed",
      (snapshot) => {
        if (onProgress) {
          const progress = snapshot.totalBytes
            ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            : 0;
          onProgress({
            progress,
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
          });
        }
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path: fullPath });
      }
    );
  });
}

export async function deleteImageFromStorageByUrl(url: string): Promise<void> {
  const storage = getClientStorage();
  if (!storage || !url.startsWith("http")) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // Ignore if already deleted or referencing local static asset
  }
}

