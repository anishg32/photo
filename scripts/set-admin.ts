import "./load-env";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { resolveServiceAccount } from "../src/lib/service-account";

/**
 * Trusted server-side CLI utility to grant administrator role + Firebase custom claims.
 * Usage: npx tsx scripts/set-admin.ts vishnumj112004@gmail.com "MJ Studio Admin"
 */
async function main() {
  const email = process.argv[2]?.trim();
  const fullName = process.argv[3]?.trim() || "MJ Studio Administrator";

  if (!email) {
    console.error("Usage: npx tsx scripts/set-admin.ts <email> [fullName]");
    process.exit(1);
  }

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

