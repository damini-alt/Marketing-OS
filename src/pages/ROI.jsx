import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, IndianRupee, Target, Calculator, RefreshCw } from 'lucide-react'
import { Button, Select, Table, Tag, message, Progress } from 'antd'
import StatCard from '../components/common/StatCard'
import BarChart from '../components/charts/BarChart'
import PieChart from '../components/charts/PieChart'
import Badge from '../components/common/Badge'
import { useStore } from '../hooks/useStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function ROI() {
  const { roi, campaigns, calculateROI, loading, syncData } = useStore()
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  useEffect(() => {
    syncData()
  }, [syncData])

  const overallStats = {
    totalInvestment: (roi || []).reduce((sum, r) => sum + Number(r.total_cost || 0), 0),
    totalRevenue: (roi || []).reduce((sum, r) => sum + Number(r.total_revenue || 0), 0),
    totalLeads: (roi || []).reduce((sum, r) => sum + Number(r.leads_generated || 0), 0),
    totalConversions: (roi || []).reduce((sum, r) => sum + Number(r.leads_converted || 0), 0),
    avgROI: (roi?.length > 0) ? (roi.reduce((sum, r) => sum + Number(r.roi_percentage || 0), 0) / roi.length) : 0,
    avgConversion: (roi?.length > 0) ? (roi.reduce((sum, r) => sum + Number(r.conversion_rate || 0), 0) / roi.length) : 0,
  }

  const overallROI = isFinite(overallStats.totalInvestment) && overallStats.totalInvestment > 0
    ? ((overallStats.totalRevenue - overallStats.totalInvestment) / overallStats.totalInvestment) * 100
    : 0

  const columns = [
    {
      title: 'Campaign',
      dataIndex: 'campaign_name',
      key: 'campaign_name',
      render: (text) => <span className="font-semibold text-gray-900">{text || 'Unnamed'}</span>,
    },
    {
      title: 'Investment',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (cost) => <span className="font-medium">₹{Number(cost || 0).toLocaleString('en-IN')}</span>,
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (revenue) => (
        <span className={`font-medium ${revenue > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          ₹{Number(revenue || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      title: 'ROI %',
      dataIndex: 'roi_percentage',
      key: 'roi_percentage',
      render: (val) => {
        const num = Number(val || 0)
        return <Tag color={num >= 50 ? 'green' : num >= 0 ? 'orange' : 'red'}>{num}%</Tag>
      },
    },
    {
      title: 'Conv. Rate',
      dataIndex: 'conversion_rate',
      key: 'conversion_rate',
      render: (rate) => (
        <div className="w-24">
          <Progress
            percent={isFinite(rate) ? Math.min(Math.max(0, rate), 100) : 0}
            size="small"
            strokeColor={rate >= 20 ? '#10b981' : '#c01a7a'}
            format={(percent) => `${percent?.toFixed(0) || 0}%`}
          />
        </div>
      ),
    },
  ]

  const chartData = (roi || []).map((r) => ({
    name: (r.campaign_name || 'Unknown').length > 10 ? (r.campaign_name || 'Unknown').substring(0, 10) + '...' : (r.campaign_name || 'Unknown'),
    Investment: Number(r.total_cost || 0),
    Revenue: Number(r.total_revenue || 0),
  }))

  const roiDistribution = (roi || []).map((r) => {
    const cost = Number(r.total_cost || 0)
    const rev = Number(r.total_revenue || 0)
    const calcRoi = cost > 0 ? Math.round(((rev - cost) / cost) * 100) : (rev > 0 ? 100 : 0)
    const val = Number(r.roi_percentage) || calcRoi
    // Pie chart slice magnitude: prefer revenue, or ROI %, or cost to guarantee visual distribution
    const sliceVal = rev > 0 ? rev : (val > 0 ? val * 1000 : (cost > 0 ? cost : 10000))

    return {
      name: (r.campaign_name || 'Unknown').length > 10 ? (r.campaign_name || 'Unknown').substring(0, 10) + '...' : (r.campaign_name || 'Unknown'),
      value: Math.max(10, sliceVal),
      roiVal: val,
      revenue: rev,
      cost: cost,
    }
  })

  const filteredROI = selectedCampaign
    ? (roi || []).filter((r) => r.campaign_id === selectedCampaign)
    : (roi || [])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ROI Analytics</h2>
          <p className="text-sm text-slate-500 font-medium">Track campaign performance and revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={IndianRupee} label="Total Investment" value={overallStats.totalInvestment} prefix="₹" gradient="purple" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={overallStats.totalRevenue} prefix="₹" gradient="green" />
        <StatCard icon={Target} label="Overall ROI" value={overallROI.toFixed(1)} suffix="%" gradient="blue" />
        <StatCard icon={TrendingUp} label="Total Leads" value={overallStats.totalLeads} gradient="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart data={chartData} title="Investment vs Revenue" dataKey="Investment" xKey="name" />
        <PieChart data={roiDistribution} title="ROI Distribution" />
      </div>

      <div className="premium-card overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-lg font-bold text-slate-900">Campaign Performance</h3>
          <Button 
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />} 
            onClick={() => calculateROI()} 
            loading={loading}
            className="rounded-xl"
          >
            Refresh
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredROI}
          rowKey={(r) => r.roi_id || Math.random().toString()}
          pagination={{ pageSize: 10 }}
          className="ant-table-modern"
        />
      </div>
    </motion.div>
  )
}

export default ROI
