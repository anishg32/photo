import "server-only";
import {
  cert,
  getApp,
  getApps,
  initializeApp,
  applicationDefault,
  type App,
} from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAppCheck } from "firebase-admin/app-check";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE_NAME = "__mj_admin_session";

function parseServiceAccountFromEnv() {
  const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (jsonKey) {
    const parsed = JSON.parse(jsonKey) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (parsed.project_id && parsed.client_email && parsed.private_key) {
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key.replace(/\\n/g, "\n"),
      };
    }
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  if (
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"
  ) {
    return true;
  }
  return Boolean(
    parseServiceAccountFromEnv() || process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

export function getAdminApp(): App | null {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  if (getApps().length > 0) {
    return getApp();
  }

  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "mj-photography-local";

  if (
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"
  ) {
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    }
    if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
    }
    if (!process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
    }
    return initializeApp({
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
    });
  }

  const serviceAccount = parseServiceAccountFromEnv();
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
      storageBucket:
        storageBucket || `${serviceAccount.projectId}.firebasestorage.app`,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket,
  });
}

export function getAdminAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminDb() {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function getAdminStorage() {
  const app = getAdminApp();
  return app ? getStorage(app) : null;
}

export async function verifyDecodedTokenIsAdmin(
  decoded: DecodedIdToken
): Promise<boolean> {
  if (decoded.admin === true || decoded.role === "admin") {
    return true;
  }

  const db = getAdminDb();
  if (!db) return false;

  const userDoc = await db.collection("users").doc(decoded.uid).get();
  if (!userDoc.exists) return false;
  return userDoc.data()?.role === "admin";
}

export interface VerifiedAdmin {
  uid: string;
  email: string;
  name?: string;
}

export async function verifyAdminFromSessionCookie(
  sessionCookie?: string
): Promise<VerifiedAdmin | null> {
  const auth = getAdminAuth();
  if (!auth) return null;

  const token =
    sessionCookie ?? (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const decoded = await auth.verifySessionCookie(token, true);
    const isAdmin = await verifyDecodedTokenIsAdmin(decoded);
    if (!isAdmin) return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: decoded.name,
    };
  } catch {
    return null;
  }
}

export async function verifyAdminRequest(
  request: Request
): Promise<VerifiedAdmin | null> {
  const auth = getAdminAuth();
  if (!auth) return null;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const idToken = authHeader.slice(7).trim();
    try {
      const decoded = await auth.verifyIdToken(idToken, true);
      const isAdmin = await verifyDecodedTokenIsAdmin(decoded);
      if (!isAdmin) return null;
      return {
        uid: decoded.uid,
        email: decoded.email ?? "",
        name: decoded.name,
      };
    } catch {
      return null;
    }
  }

  return verifyAdminFromSessionCookie();
}

export async function verifyOptionalAppCheck(request: Request): Promise<boolean> {
  if (process.env.ENFORCE_APP_CHECK !== "true") {
    return true;
  }
  const app = getAdminApp();
  if (!app) return false;

  const token = request.headers.get("X-Firebase-AppCheck");
  if (!token) return false;

  try {
    await getAppCheck(app).verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

