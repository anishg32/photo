import "server-only";
import crypto from "node:crypto";
import sharp from "sharp";
import { getAdminStorage } from "./firebase-admin";
import { sanitizeStorageFileName, type StorageFolder } from "./firebase-storage";
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

  const storage = getAdminStorage();
  if (!storage) {
    throw new Error(
      "Firebase Storage Admin SDK is not configured on the server."
    );
  }

  const bucket = storage.bucket();
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

  const originalToken = crypto.randomUUID();
  const thumbToken = crypto.randomUUID();

  // Save original untouched master photography file
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

  // Save separate optimized thumbnail
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
    imageUrl: buildFirebaseDownloadUrl(bucket.name, originalPath, originalToken),
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

export async function deleteStorageObjectsByUrls(urls: string[]): Promise<void> {
  const storage = getAdminStorage();
  if (!storage) return;
  const bucket = storage.bucket();

  for (const url of urls) {
    if (!url || !url.includes("/o/")) continue;
    try {
      const parsed = new URL(url);
      const afterO = parsed.pathname.split("/o/")[1];
      if (!afterO) continue;
      const objectPath = decodeURIComponent(afterO);
      await bucket.file(objectPath).delete({ ignoreNotFound: true });
    } catch {
      // Ignore malformed or external static paths
    }
  }
}

