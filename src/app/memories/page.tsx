import type { Metadata } from "next";
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
  { name: "Teachers' Day",             year: 2026, category: "Lab Event",  folder: "2026-teachers-day",        photos: ["photo1.jpg", "photo2.jpg"] },
  { name: "CHI 2025 @ Yokohama",       year: 2025, category: "Conference", folder: "2025-chi-yokohama",        photos: ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg"] },
  { name: "Teachers' Day",             year: 2025, category: "Lab Event",  folder: "2025-teachers-day",        photos: ["photo1.jpeg"] },
  { name: "Year-end Party",            year: 2024, category: "Lab Event",  folder: "2024-year-end-party",      photos: ["photo1.jpeg", "photo2.jpeg"] },
  { name: "Year-end Seminar",          year: 2024, category: "Seminar",    folder: "2024-year-end-seminar",    photos: ["photo1.jpeg"] },
  { name: "Spring Graduation",         year: 2024, category: "Lab Event",  folder: "2024-spring-graduation",   photos: ["photo1.jpeg"] },
  { name: "CHI 2024 @ Honolulu",       year: 2024, category: "Conference", folder: "2024-chi-hawaii",          photos: [] },
  { name: "HCI Korea — Session",       year: 2024, category: "Conference", folder: "2024-hci-korea-session",   photos: ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg"] },
  { name: "HCI Korea",                 year: 2024, category: "Conference", folder: "2024-hci-korea",           photos: ["photo1.jpeg"] },
  { name: "Professor's Birthday",      year: 2024, category: "Lab Event",  folder: "2024-professors-birthday", photos: ["photo1.jpg"] },
  { name: "SNU HCI Group Day",         year: 2024, category: "Lab Event",  folder: "2024-snu-hci-group-day",   photos: ["photo1.png", "photo2.png"] },
  { name: "SNU–CMU Joint Workshop",    year: 2024, category: "Research",   folder: "2024-snu-cmu-workshop",    photos: ["photo1.png"] },
  { name: "Celebration",               year: 2024, category: "Lab Event",  folder: "2024-celebration",         photos: ["photo1.jpeg"] },
  { name: "Dining Together",           year: 2024, category: "Lab Life",   folder: "2024-dining",              photos: ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg"] },
  { name: "Teachers' Day",             year: 2024, category: "Lab Event",  folder: "2024-teachers-day",        photos: ["photo1.jpeg"] },
  { name: "Lab Kitty",                 year: 2024, category: "Lab Life",   folder: "lab-kitty",                photos: ["photo1.jpeg", "photo2.jpeg"] },
  { name: "HCI Korea @ Gangwon",       year: 2023, category: "Conference", folder: "2023-hci-korea",           photos: ["photo1.png", "photo2.jpeg"] },
  { name: "Spring Graduation",         year: 2023, category: "Lab Event",  folder: "2023-spring-graduation",   photos: ["photo1.png"] },
  { name: "Spring AI Retreat",         year: 2023, category: "Research",   folder: "2023-ai-retreat",          photos: ["photo1.jpeg"] },
  { name: "Professor's Birthday",      year: 2023, category: "Lab Event",  folder: "2023-professors-birthday", photos: ["photo1.jpeg"] },
  { name: "Lab Mountain Climbing",     year: 2023, category: "Lab Life",   folder: "2023-mountain-climbing",   photos: ["photo1.jpeg", "photo2.jpeg", "photo3.jpeg"] },
  { name: "Online Seminar",            year: 2023, category: "Seminar",    folder: "2023-online-seminar",      photos: ["photo1.jpeg"] },
  { name: "Dining Together",           year: 2023, category: "Lab Life",   folder: "2023-dining",              photos: ["photo1.jpeg", "photo2.jpeg"] },
  { name: "Teachers' Day",             year: 2023, category: "Lab Event",  folder: "2023-teachers-day",        photos: ["photo1.jpeg", "photo2.jpeg"] },
];

export default function MemoriesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Memories</h1>
      <MemoryGallery memories={memories} />
    </div>
  );
}
