import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Filter, Trash2, Repeat, Users, CheckCircle, Clock } from 'lucide-react'
import { Button, message, Avatar, Tag, Space, Select, Input, Form, Popconfirm } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function Sequences() {
  const sequences = [
    { id: 'SEQ001', name: 'New Lead Welcome', steps: 3, activeLeads: 45, status: 'Active' },
    { id: 'SEQ002', name: 'Post-Demo Follow-Up', steps: 4, activeLeads: 12, status: 'Active' },
    { id: 'SEQ003', name: 'Re-engagement Cold Leads', steps: 5, activeLeads: 85, status: 'Paused' },
  ]

  const columns = [
    { title: 'Sequence ID', dataIndex: 'id', key: 'id' },
    { title: 'Sequence Name', dataIndex: 'name', key: 'name', render: (text) => <span className="font-bold text-slate-900">{text}</span> },
    { title: 'Steps', dataIndex: 'steps', key: 'steps' },
    { title: 'Active Leads', dataIndex: 'activeLeads', key: 'activeLeads' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'orange'}>{status}</Tag>
      )
    },
  ]

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Repeat} label="Total Sequences" value={3} gradient="purple" />
        <StatCard icon={Users} label="Active Leads" value={57} gradient="green" />
        <StatCard icon={Clock} label="Avg Duration" value="7 Days" gradient="orange" />
        <StatCard icon={CheckCircle} label="Conv. Rate" value="12%" gradient="maroon" />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Follow-Up Sequences</h2>
          <p className="text-sm text-slate-500 font-medium">Automate multi-touch follow-up cadences</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <Button type="primary" icon={<Plus className="w-4 h-4" />}>Create Sequence</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <DataTable columns={columns} data={sequences} rowKey="id" />
      </div>
    </motion.div>
  )
}

export default Sequences
