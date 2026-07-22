import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = [
  '#c01a7a', '#ed1e79', '#8b5cf6', '#3b82f6', 
  '#10b981', '#f59e0b', '#ec4899', '#6366f1', 
  '#14b8a6', '#f43f5e', '#a855f7', '#06b6d4'
]

function PieChart({ data = [], title, subtitle, height = 320, innerRadius = 55, outerRadius = 90 }) {
  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0)

  return (
    <div className="premium-card p-6 md:p-8 flex flex-col justify-between">
      <div className="flex flex-col mb-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="w-full relative" style={{ height }}>
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">
            No data available for distribution
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80 outline-none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)',
                  padding: '12px 16px',
                }}
                itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                labelStyle={{ display: 'none' }}
                formatter={(value, name, item) => {
                  const payload = item?.payload || {}
                  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
                  if (payload.roiVal !== undefined) {
                    return [`ROI: ${payload.roiVal}% (Share: ${pct}%)`, payload.name || name]
                  }
                  return [`₹${Number(value).toLocaleString('en-IN')} (${pct}%)`, name]
                }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={9}
                wrapperStyle={{ paddingTop: '12px' }}
                formatter={(value) => (
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider ml-1">{value}</span>
                )}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default PieChart
