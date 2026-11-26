import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import sharp from "sharp";
import { z } from "zod";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

const bookingSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(32),
  serviceType: z.string().trim().min(2).max(100),
  preferredDate: z.string().trim().min(4).max(40),
  location: z.string().trim().min(2).max(180),
  message: z.string().trim().min(10).max(3000),
});

/**
 * Triggered whenever a new booking enquiry is created in Firestore.
 * Records an admin notification and dispatches an optional webhook alert.
 */
export const onBookingCreated = onDocumentCreated(
  "bookings/{bookingId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const booking = snap.data();
    const bookingId = event.params.bookingId;

    await db.collection("admin_notifications").add({
      type: "cloud_function_booking_alert",
      bookingId,
      customerName: booking.customerName ?? "",
      serviceType: booking.serviceType ?? "",
      preferredDate: booking.preferredDate ?? "",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const webhookUrl = process.env.BOOKING_NOTIFICATION_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "booking.created",
          bookingId,
          customerName: booking.customerName,
          email: booking.email,
          serviceType: booking.serviceType,
          preferredDate: booking.preferredDate,
          location: booking.location,
        }),
      }).catch(() => null);
    }
  }
);

/**
 * Automatically generates a non-destructive WebP display thumbnail in /thumbnails/
 * whenever an original high-resolution photograph is uploaded to /gallery/.
 */
export const onGalleryImageUploaded = onObjectFinalized(
  { memory: "512MiB", timeoutSeconds: 120 },
  async (event) => {
    const object = event.data;
    const filePath = object.name;
    const contentType = object.contentType ?? "";

    if (!filePath || !filePath.startsWith("gallery/")) return;
    if (!contentType.startsWith("image/")) return;

    const bucket = storage.bucket(object.bucket);
    const baseName = filePath
      .replace(/^gallery\//, "")
      .replace(/\.[^.]+$/, "");
    const thumbPath = `thumbnails/${baseName}.webp`;

    const [exists] = await bucket.file(thumbPath).exists();
    if (exists) return;

    const [buffer] = await bucket.file(filePath).download();
    const thumbnailBuffer = await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 960, withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toBuffer();

    await bucket.file(thumbPath).save(thumbnailBuffer, {
      resumable: false,
      contentType: "image/webp",
      metadata: {
        cacheControl: "public, max-age=31536000, immutable",
        metadata: { derivedFrom: filePath },
      },
    });
  }
);

/**
 * App-Check-enforced callable Cloud Function for booking enquiries.
 */
export const submitBooking = onCall(
  { enforceAppCheck: true },
  async (request) => {
    const parsed = bookingSchema.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError(
        "invalid-argument",
        parsed.error.issues[0]?.message || "Invalid booking details."
      );
    }

    const ref = db.collection("bookings").doc();
    await ref.set({
      ...parsed.data,
      status: "Pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true, id: ref.id };
  }
);

/**
 * Admin-only callable function to grant or revoke administrator claims.
 * Strictly requires an existing verified admin caller.
 */
export const setAdminClaim = onCall(
  { enforceAppCheck: true },
  async (request) => {
    if (!request.auth || request.auth.token.admin !== true) {
      throw new HttpsError(
        "permission-denied",
        "Only verified administrators can assign roles."
      );
    }

    const uid = String(request.data?.uid ?? "").trim();
    const makeAdmin = Boolean(request.data?.admin);
    if (!uid) {
      throw new HttpsError("invalid-argument", "Target user UID is required.");
    }

    await admin.auth().setCustomUserClaims(uid, {
      admin: makeAdmin,
      role: makeAdmin ? "admin" : "customer",
    });

    await db
      .collection("users")
      .doc(uid)
      .set(
        {
          uid,
          role: makeAdmin ? "admin" : "customer",
        },
        { merge: true }
      );

    return { ok: true, uid, admin: makeAdmin };
  }
);

