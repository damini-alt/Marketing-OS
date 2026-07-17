import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Megaphone,
  Users,
  TrendingUp,
  Radio,
  IndianRupee,
  Target,
  Zap,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Facebook,
  Globe,
  MoreVertical,
  FileText,
  MapPin,
  UserCheck,
  Star,
} from 'lucide-react'
import { Tooltip, Dropdown, message } from 'antd'
import StatCard from '../components/common/StatCard'
import BarChart from '../components/charts/BarChart'
import AreaChart from '../components/charts/AreaChart'
import Badge from '../components/common/Badge'
import { useStore } from '../hooks/useStore'

const pageVariants = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -8, filter: 'blur(2px)', transition: { duration: 0.2 } },
}

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
}

function Dashboard() {
  const { stats, leadsBySource, campaigns, leads, workflows, painPoints, quotations, fieldSales, onboarding, testimonials, syncData } = useStore()
  
  const leadAcquisitionData = [
    { name: '1st week', value: 30 },
    { name: '2nd week', value: 45 },
    { name: '3rd week', value: 60 },
    { name: 'This week', value: 85 }
  ]
  
  const enabledWorkflows = workflows.filter(w => w.enabled).length
  const activePainPoints = painPoints.filter(p => p.enabled).length

  // Recent data from each module
  const recentQuotations = [...quotations].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3)
  const recentFieldVisits = [...fieldSales].slice(0, 3)
  const recentOnboarding = [...onboarding].slice(0, 3)
  const recentTestimonials = [...testimonials].filter(t => t.status === 'Collected').slice(0, 3)
  const recentLeads = [...leads].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5)

  // Leads by Source for Pie Chart
  const leadsSourceData = Object.entries(leadsBySource).map(([name, value]) => ({ name, value }))

  const campaignPerformanceData = campaigns.slice(0, 5).map((c) => ({
    name: c.campaign_name.length > 15 ? c.campaign_name.substring(0, 15) + '...' : c.campaign_name,
    leads: leads.filter((l) => l.campaign_id === c.campaign_id).length,
    converted: leads.filter((l) => l.campaign_id === c.campaign_id && l.status === 'converted').length,
  }))

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* Top Status Cards */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-900/60 uppercase tracking-wider">Active Workflows</p>
                <p className="text-lg font-bold text-blue-900">{enabledWorkflows} of {workflows.length} running</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {workflows.slice(0, 7).map((w) => (
                <Tooltip key={w.id} title={w.name}>
                  <div className={`w-2 h-2 rounded-full transition-all ${w.enabled ? 'bg-blue-500 ring-2 ring-blue-200' : 'bg-slate-200'}`} />
                </Tooltip>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-900/60 uppercase tracking-wider">Pain Points Addressed</p>
                <p className="text-lg font-bold text-emerald-900">{activePainPoints} Issues Solved</p>
              </div>
            </div>
            <Link to="/settings" className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-50 transition-all border border-emerald-100">
              Settings
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Stats Grid - All 8 Cards Same Style */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <StatCard icon={Megaphone} label="Total Campaigns" value={stats.total_campaigns || 0} gradient="purple" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={Users} label="Total Leads" value={stats.total_leads || 0} gradient="blue" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={Target} label="Conversion Rate" value={stats.total_leads > 0 ? ((stats.converted_leads / stats.total_leads) * 100).toFixed(1) : 0} suffix="%" gradient="green" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={IndianRupee} label="Total Revenue" value={stats.total_revenue || 0} prefix="₹" gradient="orange" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={FileText} label="Quotations" value={stats.total_quotations || 0} gradient="indigo" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={MapPin} label="Field Visits" value={stats.total_field_visits || 0} gradient="orange" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={UserCheck} label="KYC Onboarding" value={stats.total_onboarding || 0} gradient="cyan" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard icon={Star} label="Testimonials" value={stats.collected_testimonials || 0} gradient="amber" />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <BarChart data={campaignPerformanceData} title="Campaign Performance" subtitle="Leads vs Conversions" dataKey="leads" xKey="name" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Top Channels</h3>
              <p className="text-sm text-slate-500">Lead distribution</p>
            </div>
            <Dropdown
              menu={{
                items: [
                  { key: '1', label: 'Refresh Data' },
                  { key: '2', label: 'View Channel Details' }
                ],
                onClick: ({ key }) => {
                  if (key === '1') {
                    syncData()
                    message.success('Refreshing channel data...')
                  } else {
                    message.info('Channel details view simulated.')
                  }
                }
              }}
              trigger={['click']}
            >
              <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer border-none outline-none">
                <MoreVertical className="w-4 h-4" />
              </button>
            </Dropdown>
          </div>
          <div className="space-y-4">
            {leadsSourceData.map((item, index) => {
              const colors = ['bg-rose-50 text-rose-600', 'bg-blue-50 text-blue-600', 'bg-cyan-50 text-cyan-600', 'bg-slate-50 text-slate-600']
              const total = leadsSourceData.reduce((sum, curr) => sum + curr.value, 0)
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[index % colors.length]}`}>
                      {item.name === 'Instagram' && <Instagram className="w-4 h-4" />}
                      {item.name === 'Facebook' && <Facebook className="w-4 h-4" />}
                      {item.name === 'Google Ads' && <Globe className="w-4 h-4" />}
                      {item.name !== 'Instagram' && item.name !== 'Facebook' && item.name !== 'Google Ads' && <Radio className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{percentage}%</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Campaigns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Campaigns</h3>
              <p className="text-sm text-slate-500">Currently running marketing efforts</p>
            </div>
            <Link to="/campaigns" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {campaigns.filter((c) => c.status === 'active').length > 0 ? (
              campaigns.filter((c) => c.status === 'active').slice(0, 3).map((campaign) => (
                <div key={campaign.campaign_id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                  {campaign.image_url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={campaign.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 truncate">{campaign.campaign_name}</h4>
                      <Badge status={campaign.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-500" /> {leads.filter((l) => l.campaign_id === campaign.campaign_id).length} leads</span>
                      <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> ₹{campaign.budget?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">No active campaigns found</div>
            )}
          </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">Recent Leads</h3>
            <Link to="/leads" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.lead_id} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100">
                  {lead.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.source} • {lead.created_date}</p>
                </div>
                <Badge status={lead.status} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Trends Row */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <AreaChart data={leadAcquisitionData} title="Lead Acquisition Trend" subtitle="Weekly performance in the last month" dataKey="value" xKey="name" />
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acquisition Status</h4>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Active Growth</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lead acquisition velocity has increased by 40% compared to the first week of the month, driven by strong performance in Google Ads.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Module Lists - 4 Columns with Recent Items */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quotations List */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Quotations</h3>
            </div>
            <Link to="/quotations" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentQuotations.length > 0 ? recentQuotations.map((q) => (
              <div key={q.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{q.customer}</p>
                  <p className="text-xs text-slate-500 truncate">{q.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹{(q.amount || 0).toLocaleString()}</p>
                  <span className={`text-xs ${q.status?.toLowerCase() === 'approved' ? 'text-emerald-600' : 'text-amber-600'}`}>{q.status}</span>
                </div>
              </div>
            )) : <p className="text-sm text-slate-400 text-center py-4">No quotations</p>}
          </div>
        </motion.div>

        {/* Field Visits List */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-bold text-slate-900">Recent Visits</h3>
            </div>
            <Link to="/field-sales" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentFieldVisits.length > 0 ? recentFieldVisits.map((visit) => (
              <div key={visit.id} className="py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${visit.status === 'Completed' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <p className="text-sm font-medium text-slate-900 truncate">{visit.customer}</p>
                </div>
                <p className="text-xs text-slate-500">{visit.rep} • {visit.time}</p>
              </div>
            )) : <p className="text-sm text-slate-400 text-center py-4">No visits</p>}
          </div>
        </motion.div>

        {/* Onboarding List */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-cyan-600" />
              </div>
              <h3 className="font-bold text-slate-900">Onboarding</h3>
            </div>
            <Link to="/onboarding" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentOnboarding.length > 0 ? recentOnboarding.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{o.name}</p>
                  <p className="text-xs text-slate-500">{o.documents?.length || 0} docs</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
              </div>
            )) : <p className="text-sm text-slate-400 text-center py-4">No onboarding</p>}
          </div>
        </motion.div>

        {/* Testimonials List */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900">Testimonials</h3>
            </div>
            <Link to="/testimonials" className="text-xs text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentTestimonials.length > 0 ? recentTestimonials.map((t) => (
              <div key={t.id} className="py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-0.5 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < t.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">"{t.review}"</p>
              </div>
            )) : <p className="text-sm text-slate-400 text-center py-4">No testimonials</p>}
          </div>
          {stats.avg_rating > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-slate-900">{stats.avg_rating}</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs text-slate-500">avg</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard
