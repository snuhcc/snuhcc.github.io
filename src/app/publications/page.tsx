import type { Metadata } from "next";
import { Suspense } from "react";
import PublicationsClient from "./PublicationsClient";

export const metadata: Metadata = {
  title: "Publications",
  description:
    "Research publications from HCC Lab at Seoul National University — covering Human-AI Interaction, Healthcare, Social Computing, Accessibility, and Data Intelligence.",
  openGraph: { title: "Publications | HCC Lab", description: "Research publications from HCC Lab, SNU." },
};

export default function PublicationsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-6 py-16 text-slate-400">Loading…</div>}>
      <PublicationsClient />
    </Suspense>
  );
}
