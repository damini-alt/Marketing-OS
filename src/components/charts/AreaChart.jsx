import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function AreaChart({ data, title, dataKey = 'value', xKey = 'name', subtitle, height = 300 }) {
  return (
    <div className="premium-card p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          {['1W', '1M', '3M', '1Y'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === '1M' ? 'bg-white text-primary shadow-soft' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5d2a23" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#5d2a23" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #f1f5f9',
              borderRadius: '16px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
              padding: '12px 16px',
            }}
            itemStyle={{ fontSize: '13px', fontWeight: 600 }}
            labelStyle={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#5d2a23"
            strokeWidth={3}
            fill="url(#areaGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: '#5d2a23',
              stroke: '#fff',
              strokeWidth: 3,
              shadow: '0 0 10px rgba(93, 42, 35, 0.4)'
            }}
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AreaChart
