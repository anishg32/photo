import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import { getCategories } from "@/lib/firestore";
import { categorySchema } from "@/lib/validation";
import { deleteStorageObjectsByUrls } from "@/lib/storage-server";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getCategories({ allowFallback: false });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid category payload." },
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
  const docId = data.id || `cat-${data.slug}`;
  await db.collection("categories").doc(docId).set({
    name: data.name,
    slug: data.slug,
    description: data.description,
    coverImage: data.coverImage,
    displayOrder: data.displayOrder,
    createdAt: FieldValue.serverTimestamp(),
  });

  revalidateTag("categories", "max");
  revalidatePath("/");
  revalidatePath("/categories");

  return NextResponse.json({ ok: true, id: docId }, { status: 201 });
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
    return NextResponse.json(
      { error: "Valid category ID is required." },
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

  const docRef = db.collection("categories").doc(id);
  const existingSnap = await docRef.get();
  if (!existingSnap.exists) {
    return NextResponse.json(
      { error: "Category record not found in Firestore." },
      { status: 404 }
    );
  }
  const prevData = existingSnap.data();

  // Allow direct cover-image replacement when only coverImage is supplied
  if (typeof body?.coverImage === "string" && !body.name) {
    const nextCover = body.coverImage.trim();
    if (!nextCover) {
      return NextResponse.json(
        { error: "Replacement cover image URL cannot be empty." },
        { status: 400 }
      );
    }

    await docRef.update({ coverImage: nextCover });

    if (
      body.replacePreviousImage === true &&
      typeof prevData?.coverImage === "string" &&
      prevData.coverImage &&
      prevData.coverImage !== nextCover
    ) {
      await deleteStorageObjectsByUrls([prevData.coverImage]);
    }

    revalidateTag("categories", "max");
    revalidatePath("/");
    revalidatePath("/categories");
    if (typeof prevData?.slug === "string" && prevData.slug) {
      revalidatePath(`/categories/${prevData.slug}`);
    }
    revalidatePath("/services");
    return NextResponse.json({ ok: true });
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid category fields." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  await docRef.update({
    name: data.name,
    slug: data.slug,
    description: data.description,
    coverImage: data.coverImage,
    displayOrder: data.displayOrder,
  });

  if (
    body?.replacePreviousImage === true &&
    typeof prevData?.coverImage === "string" &&
    prevData.coverImage &&
    prevData.coverImage !== data.coverImage
  ) {
    await deleteStorageObjectsByUrls([prevData.coverImage]);
  }

  revalidateTag("categories", "max");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath(`/categories/${data.slug}`);
  revalidatePath("/services");

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
    return NextResponse.json({ error: "Missing category ID." }, { status: 400 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not configured." },
      { status: 503 }
    );
  }

  const docRef = db.collection("categories").doc(id);
  const snap = await docRef.get();
  if (snap.exists) {
    const cover = snap.data()?.coverImage;
    if (typeof cover === "string" && cover) {
      await deleteStorageObjectsByUrls([cover]);
    }
    await docRef.delete();
  }

  revalidateTag("categories", "max");
  revalidatePath("/");
  revalidatePath("/categories");

  return NextResponse.json({ ok: true });
}

