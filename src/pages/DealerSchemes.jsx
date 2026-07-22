import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, IndianRupee, Award, CheckCircle, AlertTriangle, Send } from 'lucide-react'
import { Button, message, Tag, Space, Input, Form, Progress, Divider, Tooltip, Select } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import { useStore } from '../hooks/useStore'
import QuickPresets from '../components/common/QuickPresets'

const WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/0a3okVuPFHgbgCR3KumJ0'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}


function DealerSchemes() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dealerRows, setDealerRows] = useState([{ name: '', email: '' }])

  const [selectedDealers, setSelectedDealers] = useState([])
  const [selectedSchemeName, setSelectedSchemeName] = useState('')
  const [isDealersModalOpen, setIsDealersModalOpen] = useState(false)

  const schemes = useStore(state => state.dealerSchemes)
  const syncData = useStore(state => state.syncData)
  const onboarding = useStore(state => state.onboarding) || []
  const leads = useStore(state => state.leads) || []

  // Map of known dealers/customers: name -> email
  const knownDealers = new Map()
  onboarding.forEach(o => {
    if (o.name && o.email) {
      knownDealers.set(o.name.trim(), o.email.trim())
    }
  })
  leads.forEach(l => {
    if (l.name && l.email) {
      knownDealers.set(l.name.trim(), l.email.trim())
    }
  })
  schemes.forEach(s => {
    if (s.dealers) {
      s.dealers.forEach(d => {
        if (d.name && d.email) {
          knownDealers.set(d.name.trim(), d.email.trim())
        }
      })
    }
  })

  const claims = [
    { id: 'CLM001', dealer: 'Rajesh Enterprises', scheme: 'Summer Cooler Promo', claimed: 10000, verified: 10000, status: 'Approved' },
    { id: 'CLM002', dealer: 'Kapoor & Sons', scheme: 'Diwali Volume Bonus', claimed: 25000, verified: 20000, status: 'Disputed' },
    { id: 'CLM003', dealer: 'Balaji Traders', scheme: 'Summer Cooler Promo', claimed: 10000, verified: 0, status: 'Pending' },
  ]

  const schemeColumns = [
    { title: 'Scheme ID', dataIndex: 'id', key: 'id', render: (text) => <span className="font-mono text-xs text-slate-600">{text}</span> },
    { title: 'Scheme Name', dataIndex: 'name', key: 'name', render: (text) => <span className="font-bold text-slate-900">{text}</span> },
    { title: 'Product', dataIndex: 'product', key: 'product' },
    { title: 'Discount', dataIndex: 'discount', key: 'discount', render: (text) => <span className="text-primary font-medium">{text}</span> },
    { title: 'Valid Till', dataIndex: 'validity', key: 'validity' },
    {
      title: 'Dealers',
      key: 'dealers',
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          className="p-0 font-semibold text-red-700 hover:text-red-900 underline decoration-dotted"
          onClick={() => {
            setSelectedDealers(record.dealers || [])
            setSelectedSchemeName(record.name)
            setIsDealersModalOpen(true)
          }}
        >
          {record.dealers_count} Dealers (View)
        </Button>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'Active' ? 'green' : 'gray'}>{status}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          icon={<Send className="w-3 h-3" />}
          onClick={() => {
            form.setFieldsValue({
              scheme_name: record.name,
              product: record.product,
              discount: record.discount,
              valid_till: record.validity,
            })
            setDealerRows([{ name: '', email: '' }])
            setIsModalOpen(true)
          }}
        >
          Broadcast
        </Button>
      )
    }
  ]

  const claimColumns = [
    { title: 'Claim ID', dataIndex: 'id', key: 'id' },
    { title: 'Dealer', dataIndex: 'dealer', key: 'dealer', render: (text) => <span className="font-bold text-slate-900">{text}</span> },
    { title: 'Scheme', dataIndex: 'scheme', key: 'scheme' },
    { title: 'Claimed', dataIndex: 'claimed', key: 'claimed', render: (val) => `₹${val.toLocaleString()}` },
    { title: 'Verified', dataIndex: 'verified', key: 'verified', render: (val) => `₹${val.toLocaleString()}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'Approved' ? 'green' : status === 'Disputed' ? 'red' : 'gold'}>{status}</Tag>
    },
  ]

  const addDealerRow = () => setDealerRows([...dealerRows, { name: '', email: '' }])
  const removeDealerRow = (index) => setDealerRows(dealerRows.filter((_, i) => i !== index))
  const updateDealerRow = (index, field, value) => {
    const updated = [...dealerRows]
    updated[index][field] = value
    setDealerRows(updated)
  }




  const handleSubmit = async (values) => {
    const validDealers = dealerRows.filter(d => d.name && d.email)
    if (validDealers.length === 0) {
      message.error('Please add at least one dealer with name and email.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme_name: values.scheme_name,
          product: values.product,
          discount: values.discount,
          valid_till: values.valid_till,
          dealers: validDealers
        }),
      })
      if (response.ok) {
        message.success('Scheme broadcast sent to all dealers!')
        setIsModalOpen(false)
        form.resetFields()
        setDealerRows([{ name: '', email: '' }])
        await syncData()
      } else {
        message.error('Failed to send scheme broadcast.')
      }
    } catch (err) {
      message.error('Error sending request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-6 lg:p-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Award} label="Active Schemes" value={schemes.length} gradient="purple" />
        <StatCard icon={AlertTriangle} label="Pending Claims" value={1} gradient="orange" />
        <StatCard icon={CheckCircle} label="Settled Claims" value={1} gradient="green" />
        <StatCard icon={IndianRupee} label="Total Payout" value="₹10,000" gradient="maroon" />
      </div>

      {/* Target vs Achievement */}
      <div className="bg-white p-6 rounded-2xl shadow-soft mb-6 border border-gray-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Top Dealers - Target vs Achievement</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">Rajesh Enterprises (Target: ₹5L)</span>
              <span className="text-slate-500">80% (₹4L)</span>
            </div>
            <Progress percent={80} strokeColor="#b91c1c" trailColor="#f3f4f6" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">Kapoor & Sons (Target: ₹5L)</span>
              <span className="text-slate-500">40% (₹2L)</span>
            </div>
            <Progress percent={40} strokeColor="#b91c1c" trailColor="#f3f4f6" />
          </div>
        </div>
      </div>

      {/* Active Schemes Table */}
      <div className="bg-white p-6 rounded-2xl shadow-soft mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Active Trade Schemes</h3>
          <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => {
            form.resetFields()
            setDealerRows([{ name: '', email: '' }])
            setIsModalOpen(true)
          }}>
            Broadcast New Scheme
          </Button>
        </div>
        <DataTable columns={schemeColumns} data={schemes} rowKey="id" />
      </div>

      {/* Claims Settlement */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Claims Settlement</h3>
        <DataTable columns={claimColumns} data={claims} rowKey="id" />
      </div>

      {/* Broadcast Modal */}
      <Modal title="Broadcast Scheme to Dealers" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <QuickPresets type="dealerSchemes" form={form} />
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="scheme_name" label="Scheme Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Summer Discount 2026" />
          </Form.Item>
          <Form.Item name="product" label="Product" rules={[{ required: true }]}>
            <Input placeholder="e.g. Steel Pipes" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="discount" label="Discount / Payout" rules={[{ required: true }]}>
              <Input placeholder="e.g. 15% or ₹5000 Fix" />
            </Form.Item>
            <Form.Item name="valid_till" label="Valid Till" rules={[{ required: true }]}>
              <Input type="date" />
            </Form.Item>
          </div>

          <Divider orientation="left" className="text-sm text-slate-500">Dealers List</Divider>
          {dealerRows.map((dealer, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <Select
                showSearch
                mode="combobox"
                placeholder="Dealer Name"
                value={dealer.name}
                onChange={(val) => {
                  updateDealerRow(index, 'name', val)
                  if (knownDealers.has(val)) {
                    updateDealerRow(index, 'email', knownDealers.get(val))
                  }
                }}
                options={Array.from(knownDealers.keys()).map(name => ({ value: name, label: name }))}
                style={{ flex: 1 }}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
              <Input
                placeholder="Dealer Email"
                value={dealer.email}
                onChange={(e) => updateDealerRow(index, 'email', e.target.value)}
                style={{ flex: 1 }}
              />
              {dealerRows.length > 1 && (
                <Button danger size="small" onClick={() => removeDealerRow(index)}>✕</Button>
              )}
            </div>
          ))}
          <Button type="dashed" onClick={addDealerRow} block className="mb-4">+ Add Dealer</Button>

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<Send className="w-4 h-4" />}>
              Send Scheme Broadcast
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Dealers Modal */}
      <Modal title={`Target Dealers - ${selectedSchemeName}`} isOpen={isDealersModalOpen} onClose={() => setIsDealersModalOpen(false)}>
        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
          {selectedDealers.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No dealers assigned to this scheme.</p>
          ) : (
            selectedDealers.map((d, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-slate-950 text-sm">{d.name || 'N/A'}</div>
                  <div className="text-xs text-slate-600 font-medium">{d.email || 'N/A'}</div>
                </div>
                <Tag color="red" className="m-0">Dealer</Tag>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsDealersModalOpen(false)}>Close</Button>
        </div>
      </Modal>
    </motion.div>
  )
}

export default DealerSchemes
