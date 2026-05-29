import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memories",
  description:
    "Photo memories from HCC Lab events — conferences, lab gatherings, and research activities at Seoul National University.",
  openGraph: { title: "Memories | HCC Lab", description: "Photo memories from HCC Lab events and conferences." },
};

export default function MemoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
