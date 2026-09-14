const ACCENT = {
  red: 'before:bg-red',
  cyan: 'before:bg-cyan',
  orange: 'before:bg-orange',
  purple: 'before:bg-purple',
}

function Tile({ label, value, unit, sub, accent = 'red', children }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#091f2f] rounded-md shadow-card
      px-5 pt-[18px] pb-4 before:content-[''] before:absolute
      before:top-0 before:left-0 before:right-0 before:h-[3px] ${ACCENT[accent]}
      transition-all duration-200 ease-out cursor-default
      hover:-translate-y-1 hover:shadow-lg hover:bg-navy-soft`}
    >
      <div className="text-[11px] tracking-wider uppercase text-[#9FB2C0] font-semibold mb-2.5">
        {label}
      </div>

      {children ?? (
        <div className="font-mono text-[32px] font-bold text-white leading-none flex items-baseline gap-1.5">
          {value}
          {unit && (
            <span className="text-[13px] text-[#9FB2C0] font-medium">
              {unit}
            </span>
          )}
        </div>
      )}

      {sub && <div className="mt-2 text-[12px] text-[#7690A0]">{sub}</div>}
    </div>
  )
}

export default function StatStrip({ stats }) {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
      <Tile
        label="Total teams"
        value={stats.totalTeams}
        unit="teams"
        accent="red"
      />
      <Tile
        label="Players"
        value={stats.players}
        unit="registered"
        accent="cyan"
      />
      <Tile
        label="Games played"
        value={stats.gamesPlayed}
        unit="this season"
        accent="orange"
      />
      <Tile label="Current leader" accent="purple">
        <div className="text-[19px] font-extrabold text-white">
          {stats.leader.name}
        </div>
        <div className="inline-block mt-2 font-mono text-[12.5px] font-bold text-purple bg-white px-2 py-0.5 rounded">
          {stats.leader.points} PTS
        </div>
      </Tile>
    </div>
  )
}