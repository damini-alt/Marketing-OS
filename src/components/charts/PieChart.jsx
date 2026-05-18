import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = ['#c01a7a', '#ed1e79', '#ff3388', '#ff66a5', '#ffa0ca', '#ffc9e3']

function PieChart({ data, title, subtitle, height = 300, innerRadius = 70, outerRadius = 100 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="premium-card p-8">
      <div className="flex flex-col mb-8">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
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
            formatter={(value, name) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{value}</span>
            )}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChart
