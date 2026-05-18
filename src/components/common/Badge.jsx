const statusConfig = {
  // Campaign Status
  planned: { color: 'bg-primary-50 text-primary border-primary-100', label: 'Planned' },
  active: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Active' },
  completed: { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Completed' },
  paused: { color: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Paused' },

  // Lead Status
  new: { color: 'bg-primary-50 text-primary border-primary-100', label: 'New' },
  contacted: { color: 'bg-indigo-50 text-indigo-600 border-indigo-100', label: 'Contacted' },
  qualified: { color: 'bg-cyan-50 text-cyan-600 border-cyan-100', label: 'Qualified' },
  converted: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Converted' },
  lost: { color: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Lost' },

  // Content Status
  draft: { color: 'bg-slate-50 text-slate-500 border-slate-200', label: 'Draft' },
  scheduled: { color: 'bg-primary-50 text-primary border-primary-100', label: 'Scheduled' },
  posted: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Posted' },
  cancelled: { color: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Cancelled' },

  // Broadcast Status
  sent: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Sent' },
  failed: { color: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Failed' },

  // Campaign Types
  festival: { color: 'bg-primary-50 text-primary border-primary-100', label: 'Festival' },
  product: { color: 'bg-primary-50 text-primary border-primary-100', label: 'Product' },
  discount: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Discount' },
  branding: { color: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Branding' },

  // Platforms
  WhatsApp: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'WhatsApp' },
  Instagram: { color: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Instagram' },
  Facebook: { color: 'bg-primary-50 text-primary border-primary-100', label: 'Facebook' },
  'Google Ads': { color: 'bg-rose-50 text-rose-600 border-rose-100', label: 'Google Ads' },
  LinkedIn: { color: 'bg-primary-50 text-primary border-primary-100', label: 'LinkedIn' },

  // Segments
  new_leads: { color: 'bg-primary-50 text-primary border-primary-100', label: 'New Leads' },
  existing_customers: { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Existing Customers' },
  inactive_users: { color: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Inactive Users' },
  all: { color: 'bg-slate-100 text-slate-600 border-slate-200', label: 'All' },
}

function Badge({ status, size = 'md' }) {
  const config = statusConfig[status] || { color: 'bg-gray-50 text-gray-700 border-gray-200', label: status }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  )
}

export default Badge
export { statusConfig }
