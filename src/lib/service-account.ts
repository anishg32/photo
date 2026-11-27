import fs from "node:fs";
import path from "node:path";

export interface ResolvedServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function normalizePrivateKey(key: string): string {
  return key
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2")
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n");
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
      privateKey: normalizePrivateKey(privateKey),
    };
  }
  return null;
}

function tryParseJsonAccount(input: string): ResolvedServiceAccount | null {
  try {
    const parsed: unknown = JSON.parse(input);
    if (typeof parsed === "string") {
      return normalizeJsonAccount(JSON.parse(parsed));
    }
    return normalizeJsonAccount(parsed);
  } catch {
    return null;
  }
}

/**
 * Parses service account credentials across raw JSON, quote-wrapped JSON,
 * base64-encoded JSON, and multiline-corrupted env values.
 */
export function parseInlineServiceAccount(
  rawValue: string
): ResolvedServiceAccount | null {
  const candidates: string[] = [];
  let trimmed = rawValue.trim();
  if (!trimmed) return null;

  candidates.push(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
    candidates.push(trimmed);
  }

  for (const candidate of candidates) {
    const direct = tryParseJsonAccount(candidate);
    if (direct) return direct;

    if (candidate.includes('\\"')) {
      const unescaped = tryParseJsonAccount(candidate.replace(/\\"/g, '"'));
      if (unescaped) return unescaped;
    }

    if (!candidate.startsWith("{")) {
      try {
        const decoded = Buffer.from(candidate, "base64")
          .toString("utf-8")
          .trim();
        if (decoded.startsWith("{")) {
          const fromB64 = tryParseJsonAccount(decoded);
          if (fromB64) return fromB64;
        }
      } catch {
        // Ignore invalid base64
      }
    }

    // Recover when an env UI converts `\\n` inside private_key to literal newlines
    const projectMatch = candidate.match(
      /"(?:project_id|projectId)"\s*:\s*"([^"]+)"/
    );
    const emailMatch = candidate.match(
      /"(?:client_email|clientEmail)"\s*:\s*"([^"]+)"/
    );
    const keyMatch = candidate.match(
      /"(?:private_key|privateKey)"\s*:\s*"([\s\S]*?END[^"]*PRIVATE KEY[^"]*)"/
    );
    if (projectMatch?.[1] && emailMatch?.[1] && keyMatch?.[1]) {
      return {
        projectId: projectMatch[1].trim(),
        clientEmail: emailMatch[1].trim(),
        privateKey: normalizePrivateKey(keyMatch[1]),
      };
    }
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
    const parsed = parseInlineServiceAccount(jsonKey);
    if (parsed) return parsed;
    const fromPath = readServiceAccountFile(jsonKey);
    if (fromPath) return fromPath;
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
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && rawPrivateKey) {
    return {
      projectId: projectId.trim(),
      clientEmail: clientEmail.trim(),
      privateKey: normalizePrivateKey(rawPrivateKey),
    };
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
