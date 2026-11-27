import "./load-env";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

/**
 * Trusted server-side CLI utility to grant administrator role + Firebase custom claims.
 * Usage: npx tsx scripts/set-admin.ts admin@mjphotography.art "MJ Studio Admin"
 */
async function main() {
  const email = process.argv[2]?.trim();
  const fullName = process.argv[3]?.trim() || "MJ Studio Administrator";

  if (!email) {
    console.error("Usage: npx tsx scripts/set-admin.ts <email> [fullName]");
    process.exit(1);
  }

  if (!getApps().length) {
    const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (jsonKey) {
      const parsed = JSON.parse(jsonKey);
      initializeApp({ credential: cert(parsed) });
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

  const auth = getAuth();
  const db = getFirestore();

  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, {
    admin: true,
    role: "admin",
  });

  await db.collection("users").doc(user.uid).set(
    {
      uid: user.uid,
      fullName,
      email: user.email || email,
      role: "admin",
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`Granted admin claim and role to ${email} (uid=${user.uid})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

