import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import { getGalleryImages } from "@/lib/firestore";
import { galleryImageSchema } from "@/lib/validation";
import { deleteStorageObjectsByUrls } from "@/lib/storage-server";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await getGalleryImages({
    includeUnpublished: true,
    allowFallback: false,
  });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = galleryImageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid gallery image payload." },
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
  const catDoc = await db.collection("categories").doc(data.categoryId).get();
  const catData = catDoc.exists ? catDoc.data() : null;

  const ref = db.collection("gallery_images").doc();
  await ref.set({
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl,
    thumbnailUrl: data.thumbnailUrl,
    categoryId: data.categoryId,
    categoryName: data.categoryName || catData?.name || "",
    categorySlug: data.categorySlug || catData?.slug || "",
    location: data.location,
    captureDate: data.captureDate,
    featured: data.featured,
    published: data.published,
    displayOrder: data.displayOrder,
    width: data.width ?? 1600,
    height: data.height ?? 1200,
    cameraSpec: data.cameraSpec ?? "",
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/categories");

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
    return NextResponse.json({ error: "Missing photograph ID." }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  const allowedUpdates: Record<string, unknown> = {};
  if (typeof body?.title === "string") allowedUpdates.title = body.title.trim();
  if (typeof body?.description === "string")
    allowedUpdates.description = body.description.trim();
  if (typeof body?.imageUrl === "string" && body.imageUrl.trim())
    allowedUpdates.imageUrl = body.imageUrl.trim();
  if (typeof body?.thumbnailUrl === "string" && body.thumbnailUrl.trim())
    allowedUpdates.thumbnailUrl = body.thumbnailUrl.trim();
  if (typeof body?.width === "number" && body.width > 0)
    allowedUpdates.width = body.width;
  if (typeof body?.height === "number" && body.height > 0)
    allowedUpdates.height = body.height;
  if (typeof body?.location === "string")
    allowedUpdates.location = body.location.trim();
  if (typeof body?.captureDate === "string")
    allowedUpdates.captureDate = body.captureDate.trim();
  if (typeof body?.featured === "boolean")
    allowedUpdates.featured = body.featured;
  if (typeof body?.published === "boolean")
    allowedUpdates.published = body.published;
  if (typeof body?.displayOrder === "number")
    allowedUpdates.displayOrder = body.displayOrder;
  if (typeof body?.cameraSpec === "string")
    allowedUpdates.cameraSpec = body.cameraSpec.trim();
  if (typeof body?.categoryId === "string" && body.categoryId.trim()) {
    allowedUpdates.categoryId = body.categoryId.trim();
    const catDoc = await db
      .collection("categories")
      .doc(body.categoryId.trim())
      .get();
    if (catDoc.exists) {
      allowedUpdates.categoryName = catDoc.data()?.name ?? "";
      allowedUpdates.categorySlug = catDoc.data()?.slug ?? "";
    }
  }

  const docRef = db.collection("gallery_images").doc(id);
  const existingSnap = await docRef.get();
  const prevData = existingSnap.exists ? existingSnap.data() : null;

  await docRef.update(allowedUpdates);

  if (
    body?.replacePreviousImage === true &&
    prevData &&
    typeof allowedUpdates.imageUrl === "string" &&
    prevData.imageUrl !== allowedUpdates.imageUrl
  ) {
    await deleteStorageObjectsByUrls([
      String(prevData.imageUrl ?? ""),
      String(prevData.thumbnailUrl ?? ""),
    ]);
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/categories");
  revalidatePath("/exhibition");

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
    return NextResponse.json({ error: "Missing photograph ID." }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  const docRef = db.collection("gallery_images").doc(id);
  const snap = await docRef.get();
  if (snap.exists) {
    const d = snap.data()!;
    await deleteStorageObjectsByUrls([
      String(d.imageUrl ?? ""),
      String(d.thumbnailUrl ?? ""),
    ]);
    await docRef.delete();
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/categories");

  return NextResponse.json({ ok: true });
}

