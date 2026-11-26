import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import { getSiteSettings } from "@/lib/firestore";
import { siteSettingsSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = siteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid site settings payload." },
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
    .collection("site_settings")
    .doc("main")
    .set(
      {
        ...parsed.data,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/services");
  revalidatePath("/contact");

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  const updates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (typeof body.heroImageUrl === "string") {
    updates.heroImageUrl = body.heroImageUrl.trim();
  }
  if (typeof body.aboutImageUrl === "string") {
    updates.aboutImageUrl = body.aboutImageUrl.trim();
  }

  await db
    .collection("site_settings")
    .doc("main")
    .set(updates, { merge: true });

  revalidatePath("/");
  revalidatePath("/about");

  return NextResponse.json({ ok: true });
}

