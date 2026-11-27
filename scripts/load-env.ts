import fs from "node:fs";
import path from "node:path";

/** Loads `.env.local` variables into `process.env` for standalone CLI scripts. */
export function loadLocalEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;
    const key = line.slice(0, eqIndex).trim();
    const rawVal = line.slice(eqIndex + 1).trim();
    const val = rawVal.replace(/^(['"])(.*)\1$/, "$2");
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadLocalEnv();
