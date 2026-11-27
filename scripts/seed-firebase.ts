import "./load-env";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { resolveServiceAccount } from "../src/lib/service-account";
import {
  DEFAULT_SITE_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_GALLERY_IMAGES,
  INITIAL_STORIES,
} from "../src/lib/studio-catalog";

async function main() {
  if (!getApps().length) {
    const serviceAccount = resolveServiceAccount();
    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });
    } else {
      initializeApp({
        projectId:
          process.env.FIREBASE_PROJECT_ID ||
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
          "mj-photography-local",
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

