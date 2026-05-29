import { Suspense } from "react";
import PublicationsClient from "./PublicationsClient";

export default function PublicationsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-16 text-slate-400">Loading…</div>}>
      <PublicationsClient />
    </Suspense>
  );
}
