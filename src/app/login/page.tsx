"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Logo from "@/components/Logo";
export default function Login() {
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const r = await signIn("credentials", { email: f.get("email"), password: f.get("password"), redirect: false });
    r?.ok ? (location.href = "/") : setErr("Wrong email or password");
  }
  return (<form onSubmit={submit} className="mx-auto mt-24 max-w-sm space-y-3 rounded-lg bg-white p-6 shadow">
    <div className="-mx-6 -mt-6 mb-2 rounded-t-lg bg-navy-900 py-6"><Logo size="lg" /></div>
    <h1 className="text-xl font-semibold">Staff sign in</h1>
    <input name="email" type="email" placeholder="Email" className="w-full rounded border p-2" required />
    <input name="password" type="password" placeholder="Password" className="w-full rounded border p-2" required />
    {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
    <button className="w-full rounded bg-brand p-2 text-white">Sign in</button>
  </form>);
}