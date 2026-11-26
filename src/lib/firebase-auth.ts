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
    return {
      ok: false,
      error: payload.error || "Unauthorized: Administrator privileges required.",
    };
  }

  return { ok: true };
}

export async function signInAdmin(email: string, password: string) {
  const auth = getClientAuth();
  if (!auth) {
    throw new Error(
      "Firebase client credentials are not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
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

