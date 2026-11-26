import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebase-admin";
import { getCategories } from "@/lib/firestore";
import { categorySchema } from "@/lib/validation";

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

  revalidatePath("/");
  revalidatePath("/categories");

  return NextResponse.json({ ok: true, id: docId }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json(
      { error: "Valid category ID and fields are required." },
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
  await db.collection("categories").doc(data.id!).update({
    name: data.name,
    slug: data.slug,
    description: data.description,
    coverImage: data.coverImage,
    displayOrder: data.displayOrder,
  });

  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath(`/categories/${data.slug}`);

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

  await db.collection("categories").doc(id).delete();

  revalidatePath("/");
  revalidatePath("/categories");

  return NextResponse.json({ ok: true });
}

