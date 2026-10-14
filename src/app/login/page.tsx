"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function Login() {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    const r = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    if (r?.ok) { location.href = "/"; return; }
    setBusy(false);
    setErr(r?.error === "LOCKED" ? "Too many wrong attempts. This account is locked for 15 minutes. A manager can reset your password." : "Wrong email or password");
  }
  return (<form onSubmit={submit} className="mx-auto mt-16 max-w-sm space-y-3 rounded-lg bg-white p-6 shadow md:mt-24">
    <div className="-mx-6 -mt-6 mb-2 rounded-t-lg bg-navy-900 py-6"><Logo size="lg" /></div>
    <h1 className="text-xl font-semibold">Staff sign in</h1>
    <input name="email" type="email" placeholder="Email" autoComplete="username" className="w-full rounded border p-2" required />
    <input name="password" type="password" placeholder="Password" autoComplete="current-password" className="w-full rounded border p-2" required />
    {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
    <button disabled={busy} className="w-full rounded bg-brand p-2 text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
  </form>);
}