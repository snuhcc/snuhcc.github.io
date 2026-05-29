import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lab Seminar",
  description:
    "Weekly research seminars at HCC Lab, Seoul National University — covering the latest papers in HCI, AI, and social computing.",
  openGraph: { title: "Lab Seminar | HCC Lab", description: "Weekly research seminars at HCC Lab, SNU." },
};

export default function SeminarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
