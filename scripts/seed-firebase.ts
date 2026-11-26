import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY_IMAGES,
  INITIAL_STORIES,
} from "../src/lib/studio-catalog";

async function main() {
  if (!getApps().length) {
    const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (jsonKey) {
      initializeApp({ credential: cert(JSON.parse(jsonKey)) });
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      initializeApp({
        projectId:
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mj-photography-local",
      });
    }
  }

  const db = getFirestore();
  let written = 0;

  for (const cat of INITIAL_CATEGORIES) {
    const ref = db.collection("categories").doc(cat.id);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ ...cat, createdAt: FieldValue.serverTimestamp() });
      written++;
    }
  }

  for (const img of INITIAL_GALLERY_IMAGES) {
    const ref = db.collection("gallery_images").doc(img.id);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ ...img, createdAt: FieldValue.serverTimestamp() });
      written++;
    }
  }

  for (const story of INITIAL_STORIES) {
    const ref = db.collection("stories").doc(story.id);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({ ...story, createdAt: FieldValue.serverTimestamp() });
      written++;
    }
  }

  const settingsRef = db.collection("site_settings").doc("main");
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set({
      ...DEFAULT_SITE_SETTINGS,
      updatedAt: FieldValue.serverTimestamp(),
    });
    written++;
  }

  console.log(`Seeded ${written} new Firestore documents for MJ PHOTOGRAPHY.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

