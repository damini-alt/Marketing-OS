import { motion } from 'framer-motion'

const gradientColors = {
  purple: 'bg-primary-50 text-primary',
  maroon: 'bg-primary-50 text-primary',
  blue: 'bg-primary-50 text-primary', // Changed blue to maroon for theme consistency
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-amber-50 text-amber-600',
  pink: 'bg-rose-50 text-rose-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  slate: 'bg-slate-100 text-slate-600',
}

function StatCard({ icon: Icon, label, value, change, gradient = 'purple', prefix = '', suffix = '' }) {
  const colorClass = gradientColors[gradient] || gradientColors.purple

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="premium-card h-full">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            {change !== undefined && (
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  change >= 0
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {change >= 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
            </h3>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard
