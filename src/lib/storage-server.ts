import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, getAdminStorage } from "./firebase-admin";
import { sanitizeStorageFileName, type StorageFolder } from "./firebase-storage";
import {
  getLocalUploadsRoot,
  resolveSafeMediaSegments,
} from "./media-paths";
import { validateImageFileMeta } from "./validation";

export interface ProcessedUploadResult {
  imageUrl: string;
  thumbnailUrl: string;
  originalPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  bytes: number;
}

function buildFirebaseDownloadUrl(
  bucketName: string,
  objectPath: string,
  downloadToken: string
): string {
  const encodedPath = encodeURIComponent(objectPath);
  const emulatorHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;
  if (emulatorHost) {
    return `http://${emulatorHost}/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;
  }
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;
}

async function hasUsableStorageBucket(): Promise<boolean> {
  const storage = getAdminStorage();
  if (!storage) return false;
  if (process.env.FIREBASE_STORAGE_EMULATOR_HOST) return true;

  try {
    const [exists] = await storage.bucket().exists();
    return exists;
  } catch {
    return false;
  }
}

async function saveToLocalUploads(params: {
  originalPath: string;
  thumbnailPath: string;
  originalBuffer: Buffer;
  thumbnailBuffer: Buffer;
}): Promise<boolean> {
  const uploadsRoot = getLocalUploadsRoot();
  const originalDest = path.join(
    /*turbopackIgnore: true*/ uploadsRoot,
    params.originalPath
  );
  const thumbDest = path.join(
    /*turbopackIgnore: true*/ uploadsRoot,
    params.thumbnailPath
  );

  try {
    await fs.mkdir(path.dirname(/*turbopackIgnore: true*/ originalDest), {
      recursive: true,
    });
    await fs.mkdir(path.dirname(/*turbopackIgnore: true*/ thumbDest), {
      recursive: true,
    });
    await fs.writeFile(/*turbopackIgnore: true*/ originalDest, params.originalBuffer);
    await fs.writeFile(/*turbopackIgnore: true*/ thumbDest, params.thumbnailBuffer);
    return true;
  } catch {
    return false;
  }
}

async function saveToFirestoreMediaAssets(params: {
  folder: string;
  safeName: string;
  baseSlug: string;
  originalBuffer: Buffer;
  thumbnailBuffer: Buffer;
  mimeType: string;
}): Promise<{ imageUrl: string; thumbnailUrl: string; originalPath: string; thumbnailPath: string }> {
  const db = getAdminDb();
  if (!db) {
    throw new Error(
      "Neither local writable disk, Firebase Storage, nor Cloud Firestore Admin SDK is available."
    );
  }

  // Fit inside Firestore's 1 MiB document ceiling while preserving clarity
  const MAX_FIRESTORE_BYTES = 700 * 1024;
  let storedOriginal = params.originalBuffer;
  let storedMime = params.mimeType;
  let finalName = params.safeName;

  if (storedOriginal.byteLength > MAX_FIRESTORE_BYTES) {
    storedOriginal = await sharp(params.originalBuffer, { failOn: "none" })
      .rotate()
      .resize({ width: 2048, withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toBuffer();
    storedMime = "image/webp";
    finalName = `${params.baseSlug}.webp`;
  }

  const originalPath = `${params.folder}/${finalName}`;
  const thumbnailPath = `thumbnails/${params.baseSlug}.webp`;

  await db
    .collection("media_assets")
    .doc(`${params.folder}__${finalName}`)
    .set({
      folder: params.folder,
      filename: finalName,
      contentType: storedMime,
      base64: storedOriginal.toString("base64"),
      createdAt: FieldValue.serverTimestamp(),
    });

  await db
    .collection("media_assets")
    .doc(`thumbnails__${params.baseSlug}.webp`)
    .set({
      folder: "thumbnails",
      filename: `${params.baseSlug}.webp`,
      contentType: "image/webp",
      base64: params.thumbnailBuffer.toString("base64"),
      createdAt: FieldValue.serverTimestamp(),
    });

  return {
    imageUrl: `/api/media/${originalPath}`,
    thumbnailUrl: `/api/media/${thumbnailPath}`,
    originalPath,
    thumbnailPath,
  };
}

export async function processAndUploadPhotographyServer(params: {
  buffer: Buffer;
  mimeType: string;
  originalFilename: string;
  folder: Exclude<StorageFolder, "thumbnails">;
}): Promise<ProcessedUploadResult> {
  const { buffer, mimeType, originalFilename, folder } = params;

  const check = validateImageFileMeta(mimeType, buffer.byteLength);
  if (!check.valid) {
    throw new Error(check.error);
  }

  const safeName = sanitizeStorageFileName(originalFilename);
  const originalPath = `${folder}/${safeName}`;
  const baseSlug = safeName.replace(/\.[^.]+$/, "");
  const thumbnailPath = `thumbnails/${baseSlug}.webp`;

  // Inspect dimensions and produce a separate display thumbnail without modifying original bytes
  const imageInstance = sharp(buffer, { failOn: "none" });
  const metadata = await imageInstance.metadata();
  const width = metadata.width ?? 1600;
  const height = metadata.height ?? 1200;

  const thumbnailBuffer = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 })
    .toBuffer();

  // 1. Use Firebase Storage when an active bucket is available
  if (await hasUsableStorageBucket()) {
    const bucket = getAdminStorage()!.bucket();
    const originalToken = crypto.randomUUID();
    const thumbToken = crypto.randomUUID();

    await bucket.file(originalPath).save(buffer, {
      resumable: false,
      contentType: mimeType,
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
          firebaseStorageDownloadTokens: originalToken,
          preservedOriginal: "true",
        },
      },
    });

    await bucket.file(thumbnailPath).save(thumbnailBuffer, {
      resumable: false,
      contentType: "image/webp",
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: {
          firebaseStorageDownloadTokens: thumbToken,
          derivedFrom: originalPath,
        },
      },
    });

    return {
      imageUrl: buildFirebaseDownloadUrl(
        bucket.name,
        originalPath,
        originalToken
      ),
      thumbnailUrl: buildFirebaseDownloadUrl(
        bucket.name,
        thumbnailPath,
        thumbToken
      ),
      originalPath,
      thumbnailPath,
      width,
      height,
      bytes: buffer.byteLength,
    };
  }

  // 2. Spark-plan / Storage-free local disk store served via /api/media/...
  const savedLocally = await saveToLocalUploads({
    originalPath,
    thumbnailPath,
    originalBuffer: buffer,
    thumbnailBuffer,
  });

  if (savedLocally) {
    return {
      imageUrl: `/api/media/${originalPath}`,
      thumbnailUrl: `/api/media/${thumbnailPath}`,
      originalPath,
      thumbnailPath,
      width,
      height,
      bytes: buffer.byteLength,
    };
  }

  // 3. Fallback for read-only serverless runtimes without Storage: Cloud Firestore media_assets
  const firestoreResult = await saveToFirestoreMediaAssets({
    folder,
    safeName,
    baseSlug,
    originalBuffer: buffer,
    thumbnailBuffer,
    mimeType,
  });

  return {
    ...firestoreResult,
    width,
    height,
    bytes: buffer.byteLength,
  };
}

export async function deleteStorageObjectsByUrls(urls: string[]): Promise<void> {
  const storage = getAdminStorage();
  const db = getAdminDb();

  for (const url of urls) {
    if (!url) continue;

    // Clean up local or Firestore-backed /api/media/<folder>/<filename> assets
    if (url.startsWith("/api/media/")) {
      const segments = url.slice("/api/media/".length).split("/");
      const resolved = resolveSafeMediaSegments(segments);
      if (resolved) {
        await fs.unlink(/*turbopackIgnore: true*/ resolved.localPath).catch(() => undefined);
        if (db) {
          await db
            .collection("media_assets")
            .doc(resolved.docId)
            .delete()
            .catch(() => undefined);
        }
      }
      continue;
    }

    if (!storage || !url.includes("/o/")) continue;
    try {
      const parsed = new URL(url);
      const afterO = parsed.pathname.split("/o/")[1];
      if (!afterO) continue;
      const objectPath = decodeURIComponent(afterO);
      await storage.bucket().file(objectPath).delete({ ignoreNotFound: true });
    } catch {
      // Ignore malformed or external static paths
    }
  }
}
