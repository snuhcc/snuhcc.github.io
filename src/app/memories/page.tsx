import type { Metadata } from "next";
import Image from "next/image";
import MemoryGallery from "@/components/MemoryGallery";

export const metadata: Metadata = {
  title: "Memories",
  description:
    "Photo gallery of HCC Lab events, conferences, and lab life at Seoul National University.",
  openGraph: {
    title: "Memories | HCC Lab",
    description:
      "Photo gallery of HCC Lab events, conferences, and lab life at Seoul National University.",
  },
};

const memories = [
  { name: "CHI 2026 @ Barcelona",      year: 2026, category: "Conference", folder: "2026-spain-chi",           photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg", "photo5.jpg", "photo6.jpg", "photo7.jpg"] },
  { name: "Happy Teachers' Day!",             year: 2026, category: "Lab Event",  folder: "2026-teachers-day",        photos: ["photo1.jpg", "photo2.jpg"] },
  { name: "Congrats, Graduates!",         year: 2026, category: "Lab Event",  folder: "2026-graduation-spring",   photos: ["photo1.jpg", "photo2.jpg"] },
  { name: "UIST 2025 @ Busan",                 year: 2025, category: "Conference", folder: "2025-uist",                photos: ["photo1.jpg", "photo2.jpg"] },
  { name: "CHI 2025 @ Yokohama",       year: 2025, category: "Conference", folder: "2025-chi-yokohama",        photos: ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg"] },
  { name: "Happy Teachers' Day!",             year: 2025, category: "Lab Event",  folder: "2025-teachers-day",        photos: ["photo1.jpeg"] },
  { name: "End-of-Year Party",            year: 2024, category: "Lab Event",  folder: "2024-year-end-party",      photos: ["photo1.jpeg", "photo2.jpeg"] },
  { name: "Seminar",                   year: 2024, category: "Seminar",    folder: "2024-seminar",             photos: ["photo1.jpeg", "photo2.jpeg"] },
  { name: "Congrats, Graduates!",         year: 2024, category: "Lab Event",  folder: "2024-spring-graduation",   photos: ["photo1.jpeg"] },
  { name: "CHI 2024 @ Honolulu",       year: 2024, category: "Conference", folder: "2024-chi-hawaii",          photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg"] },
  { name: "HCIK 2024 @ Gangwon",                 year: 2024, category: "Conference", folder: "2024-hci-korea",           photos: ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg", "photo4.jpeg"] },
  { name: "Happy Birthday, Professor!",      year: 2024, category: "Lab Event",  folder: "2024-professors-birthday", photos: ["photo1.jpg"] },
  { name: "Celebration Time",               year: 2024, category: "Lab Event",  folder: "2024-celebration",         photos: ["photo1.jpeg"] },
  { name: "Lab Dinner",           year: 2024, category: "Lab Life",   folder: "2024-dining",              photos: ["photo1.jpeg", "photo2.jpeg"] },
  { name: "HCIK 2023 @ Gangwon",       year: 2023, category: "Conference", folder: "2023-hci-korea",           photos: ["photo1.png", "photo2.jpeg"] },
  { name: "Congrats, Graduates!",         year: 2023, category: "Lab Event",  folder: "2023-spring-graduation",   photos: ["photo1.png"] },
  { name: "Poster Day",       year: 2023, category: "Conference", folder: "2023-poster",              photos: ["photo1.jpeg"] },
  { name: "Happy Birthday, Professor!",      year: 2023, category: "Lab Event",  folder: "2023-professors-birthday", photos: ["photo1.jpeg"] },
  { name: "Hiking Together",     year: 2023, category: "Lab Life",   folder: "2023-mountain-climbing",   photos: ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg"] },
  { name: "Lab Dinner",           year: 2023, category: "Lab Life",   folder: "2023-dining",              photos: ["photo1.jpeg"] },
  { name: "Happy Teachers' Day!",             year: 2023, category: "Lab Event",  folder: "2023-teachers-day",        photos: ["photo1.jpeg", "photo2.jpeg"] },
  { name: "HCI Group Day",         year: 2023, category: "Lab Event",  folder: "2023-snu-hci-group-day",   photos: ["photo1.png", "photo2.png"] },
  { name: "SNU–CMU Joint Workshop",    year: 2023, category: "Research",   folder: "2023-snu-cmu-workshop",    photos: ["photo1.png"] },
  { name: "Happy Teachers' Day!",             year: 2022, category: "Lab Event",  folder: "2022-teachers-day",        photos: ["photo1.jpeg"] },
  { name: "Lab Dinner",           year: 2022, category: "Lab Life",   folder: "2022-dining",              photos: ["photo1.jpeg"] },
];

export default function MemoriesPage() {
  return (
    <div
      className="max-w-6xl mx-auto px-6 py-16"
      data-analytics-section="memories_overview"
      data-analytics-page="memories"
    >
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Memories</h1>

      <div className="flex items-end justify-center gap-4 mb-12">
        <Image
          src="/images/assets/sticker_prof.png"
          alt=""
          width={80}
          height={80}
          className="object-contain transition-transform duration-300 hover:-rotate-12"
        />
        <Image
          src="/images/assets/sticker_stu.png"
          alt=""
          width={80}
          height={80}
          className="object-contain transition-transform duration-300 hover:rotate-12"
        />
        <Image
          src="/images/assets/sticker_kitty.png"
          alt=""
          width={100}
          height={84}
          className="object-contain transition-transform duration-300 hover:-rotate-12"
        />
      </div>

      <MemoryGallery memories={memories} />
    </div>
  );
}
