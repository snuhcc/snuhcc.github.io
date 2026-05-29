import Image from "next/image";
import membersData from "@/data/members.json";

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
  const hasUrl = !!member.url;

  const inner = (
    <div className="flex flex-col items-center text-center gap-3 group/card">
      {/* Photo */}
      <div className="w-44 h-44 rounded-full overflow-hidden bg-slate-100 shrink-0 ring-2 ring-transparent group-hover/card:ring-[#0B3D91]/30 transition-all duration-300">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            width={176}
            height={176}
            className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-3xl font-semibold">
            {member.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p
          className={`text-base font-semibold mb-0.5 transition-colors duration-200 ${
            hasUrl
              ? "text-slate-900 group-hover/card:text-[#0B3D91] underline underline-offset-2 decoration-slate-200 group-hover/card:decoration-[#0B3D91]/40"
              : "text-slate-900"
          }`}
        >
          {member.name}
        </p>
        <p className="text-xs text-slate-500">{member.bio}</p>
      </div>
    </div>
  );

  return hasUrl ? (
    <a href={member.url!} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <div>{inner}</div>
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
        <span className="text-xs text-slate-400">{member.current}</span>
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
                <MemberCard key={member.email} member={member} />
              ))}
            </div>
          </section>
        )
      )}

      {/* Alumni */}
      <section>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-10 pb-3 border-b border-slate-100">
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
