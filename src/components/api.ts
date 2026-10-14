export async function call(url: string, method: string, body?: unknown) {
  try {
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (r.ok) return { ok: true as const, data: j };
    const fe = j.details?.fieldErrors;
    return { ok: false as const, error: fe ? Object.entries(fe).map(([k, v]) => `${k}: ${(v as string[])[0]}`).join(". ") : j.error ?? "Could not save" };
  } catch { return { ok: false as const, error: "No connection to the server. Nothing was saved." }; }
}
export const field = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";
export const btn = "inline-flex items-center rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";

/** Unique ID that also works over plain http:// on the local network (crypto.randomUUID needs https or localhost). */
export function uuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
}