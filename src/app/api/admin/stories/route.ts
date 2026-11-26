import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import { getStories } from "@/lib/firestore";
import { storySchema } from "@/lib/validation";
import { deleteStorageObjectsByUrls } from "@/lib/storage-server";

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
  if (typeof body?.coverImage === "string" && body.coverImage.trim())
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

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid story fields provided." },
      { status: 400 }
    );
  }

  const docRef = db.collection("stories").doc(id);
  const existingSnap = await docRef.get();
  if (!existingSnap.exists) {
    return NextResponse.json(
      { error: "Story record not found in Firestore." },
      { status: 404 }
    );
  }
  const prevData = existingSnap.data();

  await docRef.update(updates);

  if (
    body?.replacePreviousImage === true &&
    typeof updates.coverImage === "string" &&
    typeof prevData?.coverImage === "string" &&
    prevData.coverImage &&
    prevData.coverImage !== updates.coverImage
  ) {
    await deleteStorageObjectsByUrls([prevData.coverImage]);
  }

  revalidatePath("/");
  revalidatePath("/stories");
  if (typeof prevData?.slug === "string" && prevData.slug) {
    revalidatePath(`/stories/${prevData.slug}`);
  }
  if (typeof updates.slug === "string" && updates.slug) {
    revalidatePath(`/stories/${updates.slug}`);
  }

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

  const docRef = db.collection("stories").doc(id);
  const snap = await docRef.get();
  if (snap.exists) {
    const d = snap.data()!;
    const urlsToDelete: string[] = [];
    if (typeof d.coverImage === "string" && d.coverImage) {
      urlsToDelete.push(d.coverImage);
    }
    if (Array.isArray(d.galleryImages)) {
      for (const item of d.galleryImages) {
        if (item && typeof item.url === "string" && item.url) {
          urlsToDelete.push(item.url);
        }
      }
    }
    await deleteStorageObjectsByUrls(urlsToDelete);
    await docRef.delete();
  }
  revalidatePath("/");
  revalidatePath("/stories");

  return NextResponse.json({ ok: true });
}

