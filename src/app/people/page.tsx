import type { Metadata } from "next";
import Image from "next/image";
import membersData from "@/data/members.json";

export const metadata: Metadata = {
  title: "People",
  description:
    "Meet the members of HCC Lab — professors, PhD students, and master's students at Seoul National University working on HCI, AI, and social computing.",
  openGraph: { title: "People | HCC Lab", description: "Meet the HCC Lab team at Seoul National University." },
};

type CurrentMember = {
  name: string;
  email: string;
  title: string;
  fields: string[];
  photo: string | null;
  bio: string;
  url: string | null;
};

type AlumniMember = {
  name: string;
  current: string | null;
  url: string | null;
};

const titleOrder = ["Professor", "Ph.D. Student", "Master's Student"];

function MemberCard({ member }: { member: CurrentMember }) {
  const isLinkedIn = member.url?.includes("linkedin.com");

  return (
    <div className="flex flex-col items-center text-center gap-3">
      {/* Photo */}
      <div className="w-44 h-44 overflow-hidden bg-slate-100 shrink-0">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            width={176}
            height={176}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl font-semibold">
            {member.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="text-base font-semibold text-slate-900 mb-2">{member.name}</p>
        <div className="flex items-center justify-center gap-3">
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="text-slate-400 hover:text-[#0B3D91] transition-colors"
              title={member.email}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          )}
          {member.url && (
            <a
              href={member.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#0B3D91] transition-colors"
              title={member.url}
            >
              {isLinkedIn ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function AlumniCard({ member }: { member: AlumniMember }) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      {member.url ? (
        <a
          href={member.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
        >
          {member.name}
        </a>
      ) : (
        <span className="text-sm font-medium text-slate-700">{member.name}</span>
      )}
      {member.current && (
        <span className="text-xs text-slate-500">{member.current}</span>
      )}
    </div>
  );
}

export default function PeoplePage() {
  const grouped = titleOrder.map((title) => ({
    title,
    members: (membersData.current as CurrentMember[]).filter((m) => m.title === title),
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">People</h1>
      <p className="text-slate-500 mb-16">
        Graduate School of Convergence Science and Technology, Seoul National University
      </p>

      {/* Current members */}
      {grouped.map(({ title, members }) =>
        members.length === 0 ? null : (
          <section key={title} className="mb-16">
            <h2 className="sticky top-16 z-10 bg-white text-base font-bold text-slate-700 py-3 mb-5 border-b-2 border-slate-200">
              {title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-10">
              {members.map((member) => (
                <MemberCard key={member.name} member={member} />
              ))}
            </div>
          </section>
        )
      )}

      {/* Alumni */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-10 pb-3 border-b border-slate-100">
          Alumni
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-6">
          {(membersData.alumni as AlumniMember[]).map((member) => (
            <AlumniCard key={member.name} member={member} />
          ))}
        </div>
      </section>
    </div>
  );
}
