import fs from "node:fs/promises";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  inferImageMimeType,
  resolveSafeMediaSegments,
} from "@/lib/media-paths";

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: rawSegments } = await context.params;
  const resolved = resolveSafeMediaSegments(rawSegments ?? []);
  if (!resolved) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const fileBuf = await fs.readFile(/*turbopackIgnore: true*/ resolved.localPath);
    return new Response(new Uint8Array(fileBuf), {
      status: 200,
      headers: {
        "Content-Type": inferImageMimeType(resolved.filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Fall back to Firestore media_assets if running on read-only/ephemeral disk
  }

  const db = getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("media_assets").doc(resolved.docId).get();
      if (snap.exists) {
        const data = snap.data() as {
          base64?: string;
          contentType?: string;
        };
        if (typeof data.base64 === "string" && data.base64) {
          const bytes = Buffer.from(data.base64, "base64");
          return new Response(new Uint8Array(bytes), {
            status: 200,
            headers: {
              "Content-Type":
                data.contentType || inferImageMimeType(resolved.filename),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    } catch {
      // Fall through to 404
    }
  }

  return new Response("Not Found", { status: 404 });
}
