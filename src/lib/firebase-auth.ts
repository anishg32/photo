"use client";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getClientAuth } from "./firebase";

export async function establishServerAdminSession(user: User): Promise<{
  ok: boolean;
  error?: string;
}> {
  const idToken = await user.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    const defaultMsg =
      res.status >= 500
        ? `Studio server authentication service failed (HTTP ${res.status}). Check server Firebase Admin configuration.`
        : "Unauthorized: Administrator privileges required.";
    return {
      ok: false,
      error: payload.error || defaultMsg,
    };
  }

  return { ok: true };
}

function formatFirebaseSignInError(err: unknown): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect administrator email or password.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network connection failed while reaching Firebase Authentication.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is disabled in Firebase Authentication.";
    case "auth/unauthorized-domain":
      return "This deployment domain is not authorized in Firebase Authentication.";
    default:
      return err instanceof Error
        ? err.message
        : "Authentication failed. Verify your administrator credentials.";
  }
}

export async function signInAdmin(email: string, password: string) {
  const auth = getClientAuth();
  if (!auth) {
    throw new Error(
      "Firebase client credentials are not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error(formatFirebaseSignInError(err));
  }

  const sessionResult = await establishServerAdminSession(credential.user);
  if (!sessionResult.ok) {
    await signOut(auth);
    throw new Error(sessionResult.error);
  }
  return credential.user;
}

export async function signOutAdmin() {
  const auth = getClientAuth();
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => null);
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  const auth = getClientAuth();
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, callback);
}

