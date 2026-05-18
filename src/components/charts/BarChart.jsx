import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const COLORS = ['#c01a7a', '#ed1e79', '#ff3388', '#ff66a5', '#ffa0ca', '#ffc9e3']

function BarChart({ data, title, dataKey = 'value', xKey = 'name', subtitle, height = 300 }) {
  return (
    <div className="premium-card p-8">
      <div className="flex flex-col mb-8">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} barSize={32}>
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
            cursor={{ fill: '#f8f9fc' }}
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
          <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart
