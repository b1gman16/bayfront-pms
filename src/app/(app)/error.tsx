"use client";

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (<div role="alert" className="mx-auto mt-16 max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
    <h1 className="text-xl font-semibold">Something went wrong</h1>
    <p className="mt-2 text-sm text-slate-600">
      This page couldn't load. It is often a short database or network problem. Try again, and if it keeps happening, tell a manager
      {error.digest ? ` (reference ${error.digest})` : ""}.
    </p>
    <button onClick={reset} className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white">Try again</button>
  </div>);
}