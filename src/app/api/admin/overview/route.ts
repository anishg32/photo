import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/firebase-admin";
import { getDashboardOverview } from "@/lib/firestore";

export async function GET(request: Request) {
  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const overview = await getDashboardOverview();
  return NextResponse.json({ overview });
}

