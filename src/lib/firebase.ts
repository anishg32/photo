import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  getToken,
  type AppCheck,
} from "firebase/app-check";
import {
  getPublicEnv,
  isFirebaseClientConfigured,
  isFirebaseEmulatorsEnabled,
} from "./env";

let appCheckInstance: AppCheck | null = null;
let emulatorsConnected = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseClientConfigured()) {
    return null;
  }

  if (getApps().length > 0) {
    return getApp();
  }

  const env = getPublicEnv();
  return initializeApp({
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

function connectEmulatorsIfEnabled(
  auth: Auth,
  db: Firestore,
  storage: FirebaseStorage
) {
  if (emulatorsConnected || !isFirebaseEmulatorsEnabled()) return;
  if (typeof window === "undefined") return;

  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    emulatorsConnected = true;
  } catch {
    // Emulators may already be attached across fast-refresh updates
    emulatorsConnected = true;
  }
}

export function getClientAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  connectEmulatorsIfEnabled(auth, db, storage);
  return auth;
}

export function getClientDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  connectEmulatorsIfEnabled(auth, db, storage);
  return db;
}

export function getClientStorage(): FirebaseStorage | null {
  const app = getFirebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  connectEmulatorsIfEnabled(auth, db, storage);
  return storage;
}

export function initClientAppCheck(): AppCheck | null {
  if (typeof window === "undefined") return null;
  if (appCheckInstance) return appCheckInstance;

  const app = getFirebaseApp();
  const env = getPublicEnv();
  if (!app || !env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY) {
    return null;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN
  ) {
    (
      window as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean }
    ).FIREBASE_APPCHECK_DEBUG_TOKEN =
      process.env.NEXT_PUBLIC_FIREBASE_APP_CHECK_DEBUG_TOKEN;
  }

  try {
    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        env.NEXT_PUBLIC_FIREBASE_APP_CHECK_SITE_KEY
      ),
      isTokenAutoRefreshEnabled: true,
    });
    return appCheckInstance;
  } catch {
    return null;
  }
}

export async function getAppCheckHeaders(): Promise<Record<string, string>> {
  const appCheck = initClientAppCheck();
  if (!appCheck) return {};
  try {
    const { token } = await getToken(appCheck, false);
    return token ? { "X-Firebase-AppCheck": token } : {};
  } catch {
    return {};
  }
}

