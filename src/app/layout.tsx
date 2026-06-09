import type { Metadata } from "next";
import { Space_Mono, Lora } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Navbar from "@/components/Navbar";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});
const lora = Lora({ subsets: ["latin"], variable: "--font-sans" });

const BASE_URL = "https://snuhcc.github.io/hcclab.github.io";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HCC Lab — Seoul National University",
    template: "%s | HCC Lab",
  },
  description:
    "Human Centered Computing Lab at Seoul National University. Research in HCI, Social Computing, Human-AI Interaction, and Big Data Analytics.",
  icons: {
    icon: "/images/assets/lab_logo.png",
    apple: "/images/assets/lab_logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "HCC Lab",
    title: "HCC Lab — Seoul National University",
    description:
      "Human Centered Computing Lab at Seoul National University. Research in HCI, Social Computing, Human-AI Interaction, and Big Data Analytics.",
    url: BASE_URL,
    images: [{ url: "/images/assets/lab_logo.png", width: 500, height: 500, alt: "HCC Lab" }],
  },
  twitter: {
    card: "summary",
    title: "HCC Lab — Seoul National University",
    description:
      "Human Centered Computing Lab at Seoul National University. Research in HCI, Social Computing, Human-AI Interaction, and Big Data Analytics.",
    images: ["/images/assets/lab_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ResearchOrganization",
              name: "Human Centered Computing Lab",
              alternateName: "HCC Lab",
              url: BASE_URL,
              logo: `${BASE_URL}/images/assets/lab_logo.png`,
              description:
                "Human Centered Computing Lab at Seoul National University. Research in HCI, Social Computing, Human-AI Interaction, and Big Data Analytics.",
              parentOrganization: {
                "@type": "CollegeOrUniversity",
                name: "Seoul National University",
                url: "https://www.snu.ac.kr",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "2nd floor, 18-dong, Gwanak-ro 1, Gwanak-gu",
                addressLocality: "Seoul",
                addressCountry: "KR",
                postalCode: "08826",
              },
              email: "bongwon@snu.ac.kr",
            }),
          }}
        />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <footer className="bg-[#192e57] mt-16">
          <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row justify-between gap-10">
            {/* Left: logo + lab name */}
            <div>
              <Image
                src="/images/assets/lab_logo_textonly.png"
                alt="HCC Lab"
                width={160}
                height={50}
                className="h-10 w-auto object-contain mb-4 brightness-0 invert"
              />
              <p className="text-sm text-white/80">Human Centered Computing Lab</p>
              <p className="text-sm text-white/70">Graduate School of Convergence Science and Technology, Seoul National University</p>
            </div>
            {/* Right: address */}
            <div className="text-sm text-white/70 sm:text-right leading-relaxed shrink-0">
              <p>2nd floor, 18-dong, Gwanak-ro 1, Gwanak-gu</p>
              <p>Seoul, Republic of Korea (08826)</p>
              <p className="mt-3">Gwanggyo-ro 145, Yeongtong-gu</p>
              <p>Suwon-si, Gyeonggi-do (16229)</p>
              <p className="mt-4 text-xs text-white/60">
                © {new Date().getFullYear()} HCC Lab, Seoul National University
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
