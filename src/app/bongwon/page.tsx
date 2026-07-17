import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import facultyProfilesData from "@/data/facultyProfiles.json";

type EducationItem = {
  degree: string;
  field: string;
  institution: string;
  year: string;
};

type ProfileLink = {
  label: string;
  url: string;
};

type FacultyProfile = {
  slug: string;
  name: string;
  title: string;
  photo: string;
  email: string;
  phone: string;
  affiliation: string;
  department: string;
  school: string;
  lab: string;
  office: string;
  summary: string;
  researchAreas: string[];
  education: EducationItem[];
  links: ProfileLink[];
};

const profile = (facultyProfilesData as Record<string, FacultyProfile>).bongwon;

export const metadata: Metadata = {
  title: `${profile.name} | HCC Lab`,
  description: `${profile.name}, ${profile.title} at ${profile.affiliation}.`,
  openGraph: {
    title: `${profile.name} | HCC Lab`,
    description: profile.summary,
  },
};

export default function BongwonPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <Link href="/people" className="inline-flex text-sm text-slate-400 hover:text-[#192e57] transition-colors mb-8">
        Back to People
      </Link>

      <section className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
        <div className="relative aspect-[4/5] max-w-[220px] overflow-hidden border border-slate-200 bg-slate-100">
          <Image
            src={profile.photo}
            alt={profile.name}
            fill
            sizes="(min-width: 1024px) 280px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#192e57] mb-3">
            Faculty Profile
          </p>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{profile.name}</h1>
          <p className="text-lg text-slate-600 mb-6">
            {profile.title} · {profile.department}
          </p>
          <p className="text-base text-slate-600 leading-7 max-w-3xl mb-6">{profile.summary}</p>
          <div className="flex flex-wrap gap-2">
            {profile.researchAreas.map((area) => (
              <span
                key={area}
                className="text-xs px-3 py-1 border border-slate-200 text-slate-600"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_320px] mt-16">
        <section>
          <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
            Overview
          </h2>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-1">Affiliation</dt>
              <dd className="text-sm text-slate-700 leading-6">{profile.affiliation}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-1">School</dt>
              <dd className="text-sm text-slate-700 leading-6">{profile.school}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-1">Department</dt>
              <dd className="text-sm text-slate-700 leading-6">{profile.department}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-1">Research Lab</dt>
              <dd className="text-sm text-slate-700 leading-6">{profile.lab}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-1">Office</dt>
              <dd className="text-sm text-slate-700 leading-6">{profile.office}</dd>
            </div>
          </dl>

          <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mt-12 mb-5 border-b-2 border-slate-200">
            Education
          </h2>
          <div className="space-y-4">
            {profile.education.map((item) => (
              <div key={`${item.degree}-${item.institution}`} className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 border-b border-slate-100 pb-4">
                <p className="text-sm text-slate-400 tabular-nums">{item.year}</p>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {item.degree}, {item.field}
                  </p>
                  <p className="text-sm text-slate-500">{item.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <div className="border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-800 mb-4">Contact</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <a href={`mailto:${profile.email}`} className="block hover:text-[#192e57] transition-colors">
                {profile.email}
              </a>
              <p>{profile.phone}</p>
            </div>
            <div className="border-t border-slate-100 mt-6 pt-6">
              <h3 className="text-xs uppercase tracking-[0.14em] text-slate-400 mb-3">External Links</h3>
              <div className="flex flex-col gap-2">
                {profile.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 hover:text-[#192e57] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
