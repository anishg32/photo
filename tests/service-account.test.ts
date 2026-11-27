import { describe, it, expect, afterEach } from "vitest";
import {
  parseInlineServiceAccount,
  resolveServiceAccount,
} from "../src/lib/service-account";

describe("Service Account Parsing", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("parses compact JSON, quote-wrapped JSON, base64 JSON, and literal-newline PEM", () => {
    const sample = {
      project_id: "mj-photography-7ea3a",
      client_email: "firebase-adminsdk@mj-photography-7ea3a.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nABC\nDEF\n-----END PRIVATE KEY-----\n",
    };

    const compact = JSON.stringify(sample);
    expect(parseInlineServiceAccount(compact)?.projectId).toBe(
      "mj-photography-7ea3a"
    );

    expect(parseInlineServiceAccount(`'${compact}'`)?.clientEmail).toBe(
      sample.client_email
    );

    const b64 = Buffer.from(compact, "utf-8").toString("base64");
    expect(parseInlineServiceAccount(b64)?.privateKey).toContain(
      "-----BEGIN PRIVATE KEY-----\nABC"
    );

    const brokenMultiline = `{"project_id":"${sample.project_id}","client_email":"${sample.client_email}","private_key":"-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----\n"}`;
    const recovered = parseInlineServiceAccount(brokenMultiline);
    expect(recovered?.projectId).toBe(sample.project_id);
    expect(recovered?.privateKey).toContain("-----BEGIN PRIVATE KEY-----");
  });

  it("resolves discrete env vars with escaped newlines", () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    process.env.FIREBASE_PROJECT_ID = "mj-photography-7ea3a";
    process.env.FIREBASE_CLIENT_EMAIL =
      "firebase-adminsdk@mj-photography-7ea3a.iam.gserviceaccount.com";
    process.env.FIREBASE_PRIVATE_KEY =
      '"-----BEGIN PRIVATE KEY-----\\nXYZ\\n-----END PRIVATE KEY-----\\n"';

    const resolved = resolveServiceAccount();
    expect(resolved?.projectId).toBe("mj-photography-7ea3a");
    expect(resolved?.privateKey).toContain("\nXYZ\n");
  });
});
