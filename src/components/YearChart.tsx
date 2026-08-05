const LABEL_INTERVAL = 5;

function histogram(years: number[]): { year: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const year of years) counts.set(year, (counts.get(year) ?? 0) + 1);

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const bars: { year: number; count: number }[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    bars.push({ year: y, count: counts.get(y) ?? 0 });
  }
  return bars;
}

export default function YearChart({ years }: { years: number[] }) {
  if (years.length === 0) return null;

  const bars = histogram(years);
  const maxCount = Math.max(...bars.map((b) => b.count));

  return (
    <div>
      <div className="flex items-end gap-[2px] h-36">
        {bars.map((b) => (
          <div
            key={b.year}
            className="flex-1 h-full flex flex-col justify-end"
            title={`${b.year}: ${b.count}`}
          >
            <div
              className="w-full bg-[#0B3D91]/70"
              style={{ height: maxCount ? `${(b.count / maxCount) * 100}%` : "0" }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-[2px] mt-2">
        {bars.map((b, i) => (
          <div key={b.year} className="flex-1 text-center">
            {(i % LABEL_INTERVAL === 0 || i === bars.length - 1) && (
              <span className="text-[10px] text-slate-600">{b.year}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
