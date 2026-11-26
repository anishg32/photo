import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  getAdminDb,
  verifyOptionalAppCheck,
} from "@/lib/firebase-admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { bookingCreateSchema } from "@/lib/validation";

async function dispatchAdminNotification(payload: {
  bookingId: string;
  customerName: string;
  email: string;
  serviceType: string;
  preferredDate: string;
  location: string;
}) {
  const webhookUrl = process.env.BOOKING_NOTIFICATION_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "booking.created",
        studio: "MJ PHOTOGRAPHY",
        adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "",
        ...payload,
      }),
    });
  } catch {
    // Notification delivery is best-effort after durable Firestore persistence
  }
}

export async function POST(request: Request) {
  try {
    const appCheckValid = await verifyOptionalAppCheck(request);
    if (!appCheckValid) {
      return NextResponse.json(
        { error: "App Check verification failed." },
        { status: 403 }
      );
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`bookings:${ip}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Too many enquiry submissions. Please try again in ${rate.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Please check the required enquiry fields.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        {
          error:
            "Booking service is not connected to Firebase yet. Please configure server Firebase Admin credentials or contact the studio directly via email.",
        },
        { status: 503 }
      );
    }

    const data = parsed.data;
    const bookingRef = db.collection("bookings").doc();

    await bookingRef.set({
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
      preferredDate: data.preferredDate,
      location: data.location,
      message: data.message,
      status: "Pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await db.collection("admin_notifications").add({
      type: "booking_enquiry",
      bookingId: bookingRef.id,
      customerName: data.customerName,
      serviceType: data.serviceType,
      preferredDate: data.preferredDate,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    await dispatchAdminNotification({
      bookingId: bookingRef.id,
      customerName: data.customerName,
      email: data.email,
      serviceType: data.serviceType,
      preferredDate: data.preferredDate,
      location: data.location,
    });

    return NextResponse.json(
      {
        ok: true,
        id: bookingRef.id,
        message:
          "Your enquiry has been recorded in the MJ PHOTOGRAPHY studio archive. We will respond within 24–48 hours.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to record your booking enquiry right now." },
      { status: 500 }
    );
  }
}

