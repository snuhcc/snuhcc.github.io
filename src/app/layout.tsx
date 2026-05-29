import type { Metadata } from "next";
import { Space_Mono, Lora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HCC Lab — Seoul National University",
  description:
    "Human Centered Computing Lab at Seoul National University. Research in HCI, Social Computing, Human-AI Interaction, and Big Data Analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-slate-900">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <footer className="border-t border-slate-100 py-8 mt-16">
          <div className="max-w-6xl mx-auto px-6 text-sm text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} Human Centered Computing Lab, Seoul National University</span>
            <span>bongwon@snu.ac.kr</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
