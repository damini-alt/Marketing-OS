import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Megaphone,
  Users,
  TrendingUp,
  Calendar,
  Radio,
  IndianRupee,
  Target,
  Clock,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Download,
  Eye,
  Instagram,
  Facebook,
  Globe,
  MoreVertical,
} from 'lucide-react'
import { Button, Avatar, Tooltip } from 'antd'
import { downloadImage } from '../utils/downloadUtils'
import StatCard from '../components/common/StatCard'
import AreaChart from '../components/charts/AreaChart'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'
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

const painPointIcons = {
  calendar: Calendar,
  chart: TrendingUp,
  gift: Megaphone,
  users: Users,
  layers: Target,
  analytics: TrendingUp,
}

function Dashboard() {
  const { stats, leadsBySource, campaigns, leads, roi, workflows, painPoints } = useStore()
  
  const enabledWorkflows = workflows.filter(w => w.enabled).length

  // Leads by Source for Pie Chart
  const leadsSourceData = Object.entries(leadsBySource).map(([name, value]) => ({
    name,
    value,
  }))

  const campaignPerformanceData = campaigns.slice(0, 5).map((c) => ({
    name: c.campaign_name.length > 15 ? c.campaign_name.substring(0, 15) + '...' : c.campaign_name,
    leads: leads.filter((l) => l.campaign_id === c.campaign_id).length,
    converted: leads.filter((l) => l.campaign_id === c.campaign_id && l.status === 'converted').length,
  }))

  const recentLeads = [...leads].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5)
  const activePainPoints = painPoints.filter(p => p.enabled).length

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-4 md:p-6 lg:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          variants={itemVariants}
          className="bg-primary-50/50 rounded-2xl border border-primary-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-900/60 uppercase tracking-wider">Active Workflows</p>
                <p className="text-xl font-bold text-primary-900">{enabledWorkflows} of {workflows.length} running</p>
              </div>
            </div>
            <div className="flex gap-2">
              {workflows.slice(0, 7).map((w) => (
                <Tooltip key={w.id} title={w.name}>
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${w.enabled ? 'bg-primary ring-4 ring-primary-100' : 'bg-slate-200'}`}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-primary-50/50 rounded-2xl border border-primary-100 p-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-900/60 uppercase tracking-wider">Pain Points Addressed</p>
                <p className="text-xl font-bold text-primary-900">{activePainPoints} Issues Solved</p>
              </div>
            </div>
            <Link to="/settings" className="text-xs font-bold text-primary bg-white px-4 py-2 rounded-xl shadow-soft hover:bg-primary-50 transition-all border border-primary-100">
              Settings
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Megaphone}
            label="Total Campaigns"
            value={stats.total_campaigns || 0}
            gradient="purple"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Users}
            label="Total Leads"
            value={stats.total_leads || 0}
            gradient="blue"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={Target}
            label="Conversion Rate"
            value={stats.total_leads > 0 ? ((stats.converted_leads / stats.total_leads) * 100).toFixed(1) : 0}
            suffix="%"
            gradient="green"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            icon={IndianRupee}
            label="Total Revenue"
            value={stats.total_revenue || 0}
            prefix="₹"
            gradient="orange"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="col-span-2 lg:col-span-1">
          <StatCard
            icon={Clock}
            label="Pending Content"
            value={stats.pending_content || 0}
            gradient="pink"
          />
        </motion.div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <BarChart
            data={campaignPerformanceData}
            title="Campaign Performance"
            subtitle="Leads vs Conversions"
            dataKey="leads"
            xKey="name"
          />
        </motion.div>
        
        {/* Top Channels List - Matches Template */}
        <motion.div variants={itemVariants} className="premium-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Top Channels</h3>
              <p className="text-sm text-slate-500">Lead distribution</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </div>
          </div>
          
          <div className="space-y-6">
            {leadsSourceData.map((item, index) => {
              const colors = [
                'bg-rose-50 text-rose-600',
                'bg-blue-50 text-blue-600',
                'bg-cyan-50 text-cyan-600',
                'bg-slate-50 text-slate-600'
              ]
              const total = leadsSourceData.reduce((sum, curr) => sum + curr.value, 0)
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
              
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[index % colors.length]}`}>
                      {item.name === 'Instagram' && <Instagram className="w-5 h-5" />}
                      {item.name === 'Facebook' && <Facebook className="w-5 h-5" />}
                      {item.name === 'Google Ads' && <Globe className="w-5 h-5" />}
                      {item.name !== 'Instagram' && item.name !== 'Facebook' && item.name !== 'Google Ads' && <Radio className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{percentage}%</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Campaigns Quick View */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 premium-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Active Campaigns</h3>
              <p className="text-sm text-slate-500">Currently running marketing efforts</p>
            </div>
            <Link to="/campaigns" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.filter((c) => c.status === 'active').length > 0 ? (
              campaigns
                .filter((c) => c.status === 'active')
                .slice(0, 4)
                .map((campaign) => (
                  <div
                    key={campaign.campaign_id}
                    className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-card hover:border-slate-100 transition-all group"
                  >
                    <div className="flex gap-4">
                      {campaign.image_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                          <img src={campaign.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-bold text-slate-900 truncate">{campaign.campaign_name}</h4>
                          <Badge status={campaign.status} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500 mt-2">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            {leads.filter((l) => l.campaign_id === campaign.campaign_id).length}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                            ₹{campaign.budget?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center mb-3">
                  <Megaphone className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">No active campaigns found</p>
                <p className="text-xs text-slate-400 mt-1">Start or update a campaign to see it here</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div
          variants={itemVariants}
          className="premium-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Recent Leads</h3>
              <p className="text-sm text-slate-500">Latest potential customers</p>
            </div>
            <Link to="/leads" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {recentLeads.map((lead) => (
              <div key={lead.lead_id} className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary font-bold flex items-center justify-center border border-primary-100 group-hover:bg-primary group-hover:text-white transition-all">
                  {lead.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{lead.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {lead.source} • {lead.created_date}
                  </p>
                </div>
                <Badge status={lead.status} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard
