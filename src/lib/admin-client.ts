/**
 * Shared JSON request helper for Admin Dashboard panels.
 * Enforces response status verification and surfaces server-side error messages.
 */
export async function adminJsonRequest<T = { ok?: boolean }>(
  url: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      data.error || `Request to ${url} failed with HTTP ${res.status}.`
    );
  }
  return data;
}
