import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import { getTestimonials } from "@/lib/firestore";
import { testimonialModerationSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getTestimonials({ includePending: true });
  return NextResponse.json({ items });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = testimonialModerationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid testimonial moderation payload." },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  await db
    .collection("testimonials")
    .doc(parsed.data.id)
    .update({ approved: parsed.data.approved });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { error: "Missing testimonial ID." },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  await db.collection("testimonials").doc(id).delete();
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

