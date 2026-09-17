import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const SERIES = [
  { key: 'Team Red', color: '#ED1940' },
  { key: 'Team White', color: '#5D3F99' },
  { key: 'Team Black', color: '#00B8DD' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy text-white text-[11px] font-mono rounded-lg px-3 py-2 shadow-card">
      <div className="text-[#9FB2C0] mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          {p.dataKey}: {p.value}
        </div>
      ))}
    </div>
  )
}

export default function ResultsChart({ data }) {
  return (
    <div className="bg-white border border-line rounded-card shadow-card p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-bold text-[15px]">Team results by night</h2>
        <div className="text-[11px] font-mono text-faint">FFG 1&ndash;6</div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid vertical={false} stroke="#EDF1F4" />
          <XAxis
            dataKey="night"
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#8B9AA6' }}
            axisLine={true}
            tickLine={true}
          />
          <YAxis
            domain={[0, 200]}
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#8B9AA6' }}
            axisLine={true}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(9,31,47,0.04)' }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: '#5B6D7B', paddingTop: 12 }}
          />
          {SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={s.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={16}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}