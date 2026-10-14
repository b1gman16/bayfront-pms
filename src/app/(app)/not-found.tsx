import Link from "next/link";

export default function NotFound() {
  return (<div className="mx-auto mt-16 max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
    <h1 className="text-xl font-semibold">Page not found</h1>
    <p className="mt-2 text-sm text-slate-600">It may not exist, or your role may not have access to it.</p>
    <Link href="/" className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-medium text-white">Back to dashboard</Link>
  </div>);
}