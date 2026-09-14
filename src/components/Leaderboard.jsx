export default function Leaderboard({ entries }) {
  return (
    <div className="bg-white border border-line rounded-card shadow-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-bold text-[15px]">Leaderboard</h2>
        <div className="text-[11px] font-mono text-faint">Season 2026</div>
      </div>

      {entries.map((entry, i) => (
        <div
          key={entry.name}
          className={`flex items-center gap-3 py-2.5 px-1 border-l-[3px] ${
            i !== entries.length - 1 ? 'border-b border-line' : ''
          } ${entry.rank === 1 ? 'border-l-red' : 'border-l-transparent'}`}
        >
          <div
            className={`w-[26px] h-[26px] rounded-full flex items-center justify-center font-mono font-bold text-[12px] text-white flex-shrink-0 ${
              entry.rank === 1 ? 'bg-red' : 'bg-navy'
            }`}
          >
            {entry.rank}
          </div>
          <div className="flex-1 font-semibold text-[13.5px]">{entry.name}</div>
          <div className="font-mono text-[13px] text-muted font-bold">
            {entry.points} pts
          </div>
        </div>
      ))}
    </div>
  )
}
