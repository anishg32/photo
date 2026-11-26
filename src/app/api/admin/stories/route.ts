import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import { getStories } from "@/lib/firestore";
import { storySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getStories({
    includeUnpublished: true,
    allowFallback: false,
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = storySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid story payload." },
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

  const data = parsed.data;
  const ref = db.collection("stories").doc();
  await ref.set({
    title: data.title,
    slug: data.slug,
    description: data.description,
    coverImage: data.coverImage,
    content: data.content,
    location: data.location || "",
    captureDate: data.captureDate || "",
    galleryImages: data.galleryImages ?? [],
    published: data.published,
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/");
  revalidatePath("/stories");
  revalidatePath(`/stories/${data.slug}`);

  return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
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
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "Missing story ID." }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (typeof body?.title === "string") updates.title = body.title.trim();
  if (typeof body?.slug === "string") updates.slug = body.slug.trim();
  if (typeof body?.description === "string")
    updates.description = body.description.trim();
  if (typeof body?.coverImage === "string")
    updates.coverImage = body.coverImage.trim();
  if (typeof body?.content === "string") updates.content = body.content.trim();
  if (typeof body?.location === "string")
    updates.location = body.location.trim();
  if (typeof body?.captureDate === "string")
    updates.captureDate = body.captureDate.trim();
  if (Array.isArray(body?.galleryImages))
    updates.galleryImages = body.galleryImages;
  if (typeof body?.published === "boolean")
    updates.published = body.published;

  await db.collection("stories").doc(id).update(updates);

  revalidatePath("/");
  revalidatePath("/stories");

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
    return NextResponse.json({ error: "Missing story ID." }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  await db.collection("stories").doc(id).delete();
  revalidatePath("/");
  revalidatePath("/stories");

  return NextResponse.json({ ok: true });
}

