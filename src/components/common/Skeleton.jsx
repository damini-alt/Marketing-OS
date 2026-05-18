import { Skeleton as AntSkeleton } from 'antd'

function Skeleton({ className = '', variant = 'text', rows = 1 }) {
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-[24px] p-8 shadow-card border border-slate-100 ${className}`}>
        <div className="flex items-start justify-between mb-6">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="w-20 h-8 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="w-3/4 h-10 bg-slate-100 rounded-xl mb-3 animate-pulse" />
        <div className="w-1/2 h-5 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={`premium-card ${className}`}>
        <div className="p-8 border-b border-slate-50 flex gap-4">
          <div className="w-64 h-11 bg-slate-100 rounded-xl animate-pulse" />
          <div className="w-40 h-11 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-6 border-b border-slate-50 flex items-center gap-6">
            <div className="w-24 h-6 bg-slate-100 rounded animate-pulse" />
            <div className="w-32 h-6 bg-slate-100 rounded flex-1 animate-pulse" />
            <div className="w-20 h-6 bg-slate-100 rounded animate-pulse" />
            <div className="w-16 h-8 bg-slate-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="w-full h-5 bg-slate-100 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

export default Skeleton
