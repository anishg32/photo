import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  getAdminDb,
  verifyOptionalAppCheck,
} from "@/lib/firebase-admin";
import { getCachedTestimonials } from "@/lib/portfolio-cache";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { testimonialCreateSchema } from "@/lib/validation";

export async function GET() {
  const items = await getCachedTestimonials();
  return NextResponse.json({ items });
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
    const rate = checkRateLimit(`testimonials:${ip}`, 3, 60 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          error: `Submission limit reached. Please retry in ${rate.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = testimonialCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Please review your testimonial fields.",
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
            "Testimonial submission requires Firebase Admin configuration.",
        },
        { status: 503 }
      );
    }

    const data = parsed.data;
    const ref = db.collection("testimonials").doc();
    await ref.set({
      customerName: data.customerName,
      message: data.message,
      rating: data.rating,
      serviceType: data.serviceType || "",
      customerPhotoUrl: data.customerPhotoUrl || "",
      // Always force false on public submissions; admin must approve before display
      approved: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        ok: true,
        id: ref.id,
        message:
          "Thank you for sharing your words. Your reflection has been submitted for studio verification.",
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to submit testimonial right now." },
      { status: 500 }
    );
  }
}

