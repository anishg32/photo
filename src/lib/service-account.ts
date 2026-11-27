import fs from "node:fs";
import path from "node:path";

export interface ResolvedServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function normalizeJsonAccount(raw: unknown): ResolvedServiceAccount | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as {
    project_id?: string;
    projectId?: string;
    client_email?: string;
    clientEmail?: string;
    private_key?: string;
    privateKey?: string;
  };
  const projectId = obj.project_id || obj.projectId;
  const clientEmail = obj.client_email || obj.clientEmail;
  const privateKey = obj.private_key || obj.privateKey;
  if (projectId && clientEmail && privateKey) {
    return {
      projectId: projectId.trim(),
      clientEmail: clientEmail.trim(),
      privateKey: privateKey.replace(/\\n/g, "\n"),
    };
  }
  return null;
}

function readServiceAccountFile(
  filePath: string
): ResolvedServiceAccount | null {
  try {
    const resolved = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath);
    if (!fs.existsSync(/*turbopackIgnore: true*/ resolved)) return null;
    const raw = fs.readFileSync(/*turbopackIgnore: true*/ resolved, "utf-8");
    return normalizeJsonAccount(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Resolves Firebase Admin SDK service account credentials from inline JSON,
 * explicit JSON file path, discrete env variables, or a local gitignored key file.
 */
export function resolveServiceAccount(): ResolvedServiceAccount | null {
  const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (jsonKey) {
    if (jsonKey.startsWith("{")) {
      try {
        const parsed = normalizeJsonAccount(JSON.parse(jsonKey));
        if (parsed) return parsed;
      } catch {
        // Fall through to file/env resolution
      }
    } else {
      const fromPath = readServiceAccountFile(jsonKey);
      if (fromPath) return fromPath;
    }
  }

  const configuredPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (configuredPath) {
    const fromPath = readServiceAccountFile(configuredPath);
    if (fromPath) return fromPath;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  const rootServiceAccount = readServiceAccountFile("serviceAccountKey.json");
  if (rootServiceAccount) return rootServiceAccount;

  try {
    const entries = fs.readdirSync(/*turbopackIgnore: true*/ process.cwd());
    const sdkFile = entries.find((name) =>
      /firebase-adminsdk.*\.json$/i.test(name)
    );
    if (sdkFile) {
      return readServiceAccountFile(sdkFile);
    }
  } catch {
    // Ignore directory read failures
  }

  return null;
}
