import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY_IMAGES,
  INITIAL_STORIES,
} from "@/lib/studio-catalog";

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  let createdCount = 0;

  for (const cat of INITIAL_CATEGORIES) {
    const ref = db.collection("categories").doc(cat.id);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ ...cat, createdAt: FieldValue.serverTimestamp() });
      createdCount++;
    }
  }

  for (const img of INITIAL_GALLERY_IMAGES) {
    const ref = db.collection("gallery_images").doc(img.id);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ ...img, createdAt: FieldValue.serverTimestamp() });
      createdCount++;
    }
  }

  for (const story of INITIAL_STORIES) {
    const ref = db.collection("stories").doc(story.id);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ ...story, createdAt: FieldValue.serverTimestamp() });
      createdCount++;
    }
  }

  const settingsRef = db.collection("site_settings").doc("main");
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set({
      ...DEFAULT_SITE_SETTINGS,
      updatedAt: FieldValue.serverTimestamp(),
    });
    createdCount++;
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/categories");
  revalidatePath("/stories");
  revalidatePath("/services");

  return NextResponse.json({
    ok: true,
    createdCount,
    message: `Initialized ${createdCount} studio records in Cloud Firestore without overwriting existing items.`,
  });
}

