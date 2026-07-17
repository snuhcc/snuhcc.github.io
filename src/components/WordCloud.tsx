type WordCloudItem = {
  name: string;
  count: number;
};

const TIER_STYLES = {
  md: [
    "text-2xl font-semibold text-[#0B3D91]",
    "text-lg font-medium text-[#0B3D91]/80",
    "text-base text-slate-600",
    "text-sm text-slate-400",
  ],
  sm: [
    "text-lg font-semibold text-[#0B3D91]",
    "text-base font-medium text-[#0B3D91]/80",
    "text-sm text-slate-600",
    "text-xs text-slate-400",
  ],
} as const;

function tierFor(count: number, min: number, max: number): number {
  if (max === min) return 1;
  const ratio = (count - min) / (max - min);
  if (ratio > 0.66) return 0;
  if (ratio > 0.33) return 1;
  if (ratio > 0.12) return 2;
  return 3;
}

export default function WordCloud({
  items,
  size = "md",
}: {
  items: WordCloudItem[];
  size?: keyof typeof TIER_STYLES;
}) {
  if (items.length === 0) return null;

  const counts = items.map((item) => item.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);

  return (
    <div className={`flex flex-wrap items-baseline leading-snug ${size === "sm" ? "gap-x-2 gap-y-1.5" : "gap-x-3 gap-y-2"}`}>
      {items.map((item) => (
        <span key={item.name} className={TIER_STYLES[size][tierFor(item.count, min, max)]}>
          {item.name}
        </span>
      ))}
    </div>
  );
}
