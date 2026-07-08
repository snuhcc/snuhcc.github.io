"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/people", label: "People" },
  { href: "/publications", label: "Publications" },
  { href: "/news", label: "News" },
  { href: "/seminar", label: "Seminar" },
  { href: "/memories", label: "Memories" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <nav
        className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
        data-analytics-section="site_nav"
        data-analytics-page="global"
      >
        <Link
          href="/"
          className="flex items-center gap-3"
          data-analytics-event="nav_brand_click"
          data-analytics-label="HCC Lab"
          data-analytics-destination="/"
        >
          <Image
            src="/snublue_lablogo.webp"
            alt="HCC Lab"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className="text-base text-slate-700 hidden sm:block font-medium" style={{ fontFamily: "var(--font-mono)" }}>
            HCC Lab
          </span>
        </Link>

        <ul className="flex gap-1" style={{ fontFamily: "var(--font-mono)" }}>
          {links.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  data-analytics-event="nav_click"
                  data-analytics-label={label}
                  data-analytics-destination={href}
                  className={`px-4 py-2 rounded-md text-xs tracking-widest uppercase transition-colors ${
                    active
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
