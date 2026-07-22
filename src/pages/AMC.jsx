import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, IndianRupee, Shield, Clock, AlertCircle, Send, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react'
import { Button, message, Tag, Space, Select, Input, Form, Divider } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import QuickPresets from '../components/common/QuickPresets'

const RENEWAL_WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/your-renewal-webhook-id'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const INITIAL_CONTRACTS = [
  { id: 'AMC001', customer: 'Tata Motors', asset: 'Industrial AC Unit', endDate: '2026-06-15', value: 50000, status: 'Expiring' },
  { id: 'AMC002', customer: 'Reliance Jio', asset: 'Enterprise Server Rack', endDate: '2026-12-20', value: 120000, status: 'Active' },
  { id: 'AMC003', customer: 'Infosys Ltd', asset: 'Modular UPS System', endDate: '2026-05-10', value: 15000, status: 'Expired' },
  { id: 'AMC004', customer: 'Wipro Technologies', asset: 'Power Generator 250kVA', endDate: '2026-09-01', value: 85000, status: 'Active' },
  { id: 'AMC005', customer: 'Maruti Suzuki', asset: 'CNC Robotic Arm', endDate: '2026-06-05', value: 240000, status: 'Expiring' },
]

function AMC() {
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS)
  const [filterStatus, setFilterStatus] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleAddContract = (values) => {
    setLoading(true)
    setTimeout(() => {
      const newContract = {
        id: 'AMC' + Math.floor(100 + Math.random() * 900),
        customer: values.customer,
        asset: values.asset,
        endDate: values.endDate,
        value: parseFloat(values.value) || 0,
        status: values.status || 'Active'
      }
      setContracts([newContract, ...contracts])
      message.success('New AMC Contract added successfully!')
      setIsModalOpen(false)
      form.resetFields()
      setLoading(false)
    }, 600)
  }

  const handleTriggerRenewal = async (record) => {
    message.loading(`Sending renewal notification to ${record.customer}...`, 1)
    try {
      await fetch(RENEWAL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_id: record.id,
          customer: record.customer,
          asset: record.asset,
          end_date: record.endDate,
          value: record.value,
          action: 'send_renewal_reminder'
        })
      })
      message.success(`Renewal reminder sent via WhatsApp to ${record.customer}!`)
    } catch (e) {
      // Mock alert success fallback
      message.success(`Renewal notification simulated successfully for ${record.customer}!`)
    }
  }



  const columns = [
    { title: 'Contract ID', dataIndex: 'id', key: 'id', render: (text) => <span className="font-mono text-xs text-slate-600">{text}</span> },
    { title: 'Customer', dataIndex: 'customer', key: 'customer', render: (text) => <span className="font-bold text-slate-900">{text}</span> },
    { title: 'Asset / Service', dataIndex: 'asset', key: 'asset', render: (text) => <span className="text-slate-600">{text}</span> },
    { title: 'Expiry Date', dataIndex: 'endDate', key: 'endDate', render: (date) => <span className={new Date(date) < new Date() ? 'text-red-500 font-medium' : 'text-slate-600'}>{date}</span> },
    { title: 'Value', dataIndex: 'value', key: 'value', render: (val) => `₹${val.toLocaleString('en-IN')}` },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : status === 'Expiring' ? 'orange' : 'red'}>{status}</Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          {(record.status === 'Expiring' || record.status === 'Expired') ? (
            <Button 
              type="primary" 
              size="small" 
              ghost 
              icon={<Send className="w-3 h-3" />}
              onClick={() => handleTriggerRenewal(record)}
            >
              Send Renewal Alert
            </Button>
          ) : (
            <span className="text-xs text-slate-400">No action needed</span>
          )}
        </Space>
      )
    }
  ]

  const filteredContracts = filterStatus ? contracts.filter(c => c.status === filterStatus) : contracts

  // Stats calculation
  const totalContracts = contracts.length
  const activeContracts = contracts.filter(c => c.status === 'Active').length
  const expiringContracts = contracts.filter(c => c.status === 'Expiring').length
  const totalValue = contracts.reduce((sum, c) => sum + c.value, 0)

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Shield} label="Total Contracts" value={totalContracts} gradient="purple" />
        <StatCard icon={Clock} label="Active Contracts" value={activeContracts} gradient="green" />
        <StatCard icon={AlertCircle} label="Expiring Soon" value={expiringContracts} gradient="orange" />
        <StatCard icon={IndianRupee} label="Pipeline Value" value={`₹${totalValue.toLocaleString('en-IN')}`} gradient="maroon" />
      </div>

      {/* Automated AI Renewal Flow Section */}
      <div className="bg-gradient-to-r from-red-50/70 to-orange-50/70 p-6 rounded-2xl border border-red-100/80">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-red-100 rounded-lg text-red-700"><Send className="w-5 h-5" /></span>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Pucho AI Automated Renewal Sequence</h3>
            <p className="text-xs text-slate-500 font-medium">How B2B Annual Contract reminders and invoice generation flows automatically</p>
          </div>
        </div>
        <Divider className="my-3 border-red-200/50" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 1</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-red-50 rounded-lg"><Calendar className="w-4 h-4 text-red-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Scheduler Trigger</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              A daily scheduler script checks for contracts expiring in exactly 30, 15, or 7 days and starts the renewal workflow.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 2</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-red-50 rounded-lg"><Send className="w-4 h-4 text-red-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">WhatsApp Reminder</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pucho AI sends a custom WhatsApp reminder to the customer's procurement contact containing a pre-filled renewal quotation link.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 3</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-red-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-red-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">ERP Contract Update</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once payment/approval is received, the system extends the contract validity in Google Sheets and logs the renewed status.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Active AMC & Subscriptions</h2>
          <p className="text-sm text-slate-500 font-medium">Manage B2B service contracts and track pending renewals</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <Select
            placeholder="Filter Status"
            style={{ width: 150 }}
            allowClear
            onChange={setFilterStatus}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Expiring', label: 'Expiring Soon' },
              { value: 'Expired', label: 'Expired' },
            ]}
          />
          <Button 
            type="primary" 
            icon={<Plus className="w-4 h-4" />} 
            onClick={() => {
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            Add AMC Contract
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <DataTable columns={columns} data={filteredContracts} rowKey="id" />
      </div>

      {/* Add AMC Contract Modal */}
      <Modal title="Create New AMC / Service Contract" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <QuickPresets type="amc" form={form} />
        <Form form={form} layout="vertical" onFinish={handleAddContract}>
          <Form.Item name="customer" label="Customer / Corporate Client" rules={[{ required: true, message: 'Please input customer name' }]}>
            <Input placeholder="e.g. Tata Motors, Adani Power" />
          </Form.Item>
          <Form.Item name="asset" label="Asset / Service Contract Name" rules={[{ required: true, message: 'Please input asset name' }]}>
            <Input placeholder="e.g. Industrial AC Maintenance, Generator Service" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="endDate" label="Expiry Date" rules={[{ required: true, message: 'Please enter expiry date' }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="value" label="Contract Value (Annual)" rules={[{ required: true, message: 'Please enter value' }]}>
              <Input type="number" prefix="₹" placeholder="e.g. 50000" />
            </Form.Item>
          </div>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Select contract status">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Expiring">Expiring Soon</Select.Option>
              <Select.Option value="Expired">Expired</Select.Option>
            </Select>
          </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Save Contract</Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default AMC
