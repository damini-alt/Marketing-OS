import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Users, ShoppingBag, BarChart2, CheckCircle2, AlertCircle, Calendar, Shield, ExternalLink, Send } from 'lucide-react'
import { Button, message, Tag, Input, Form, Select, Divider } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import { useStore } from '../hooks/useStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/3ZtUf537XDKsGPe86sfPi'

const INITIAL_VISITS = [
  { id: 'VST001', rep: 'Amit Kumar', customer: 'Sharma Kirana Store', time: '10:30 AM', status: 'Completed', orders: '₹5,000', location: 'Delhi (28.6139, 77.2090)', remarks: 'Delivered initial stock' },
  { id: 'VST002', rep: 'Sumit Singh', customer: 'Verma Departmental', time: '11:45 AM', status: 'Completed', orders: 'None', location: 'Noida (28.5355, 77.3910)', remarks: 'Stock check only' },
  { id: 'VST003', rep: 'Amit Kumar', customer: 'Gupta Traders', time: '02:15 PM', status: 'Missed', orders: 'None', location: 'Gurugram (28.4595, 77.0266)', remarks: 'Store was closed today' },
  { id: 'VST004', rep: 'Rahul Dev', customer: 'Modern Bazaar', time: '04:00 PM', status: 'Scheduled', orders: 'Pending', location: 'Delhi (28.6139, 77.2090)', remarks: 'Monthly review meeting' },
]

const SALES_REPS = ['Amit Kumar', 'Sumit Singh', 'Rahul Dev', 'Priya Sharma']

function FieldSales() {
  const fieldSales = useStore(state => state.fieldSales)
  const syncData = useStore(state => state.syncData)
  
  const visits = fieldSales.length > 0 ? fieldSales : INITIAL_VISITS
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    syncData()
  }, [syncData])

  const columns = [
    { title: 'Visit ID', dataIndex: 'id', key: 'id', render: (text) => <span className="font-mono text-xs text-slate-600">{text}</span> },
    { title: 'Sales Rep', dataIndex: 'rep', key: 'rep', render: (text) => <span className="font-bold text-slate-900">{text}</span> },
    { title: 'Customer Shop', dataIndex: 'customer', key: 'customer', render: (text) => <span className="font-medium text-slate-700">{text}</span> },
    { title: 'Time', dataIndex: 'time', key: 'time' },
    { 
      title: 'Location (GPS)', 
      dataIndex: 'location', 
      key: 'location',
      render: (text, record) => {
        const url = record.mapUrl || (text.includes('(') ? `https://www.google.com/maps/search/?api=1&query=${text.split('(')[1].replace(')', '')}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`);
        return (
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-600 hover:text-red-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>{text.split('(')[0] || 'View'}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        )
      }
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Missed' || status.includes('Mismatch') ? 'red' : 'gold'}>{status}</Tag>
      )
    },
    { title: 'Orders Taken', dataIndex: 'orders', key: 'orders', render: (text) => <span className="font-semibold text-slate-800">{text}</span> },
    { title: 'Remarks / Feedback', dataIndex: 'remarks', key: 'remarks', render: (text) => <span className="text-slate-500 text-sm max-w-[200px] truncate block">{text}</span> },
  ]

  const handleLogVisit = async (values) => {
    setLoading(true)
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rep: values.rep,
          customer: values.customer,
          status: values.status,
          orders: values.orders || 'None',
          location: values.location || 'Delhi (28.6139, 77.2090)',
          remarks: values.remarks || 'Logged from manager portal'
        })
      })

      if (response.ok) {
        message.success('Field visit logged and webhook triggered successfully!')
        setIsModalOpen(false)
        form.resetFields()
        setTimeout(async () => {
          await syncData()
        }, 2000)
      } else {
        message.error('Failed to trigger webhook.')
      }
    } catch (err) {
      message.error('Error sending webhook request.')
    } finally {
      setLoading(false)
    }
  }

  const handleFillDummy = () => {
    form.setFieldsValue({
      rep: 'Priya Sharma',
      customer: 'Metro Hypermarket',
      status: 'Completed',
      orders: '₹12,500',
      location: 'Noida (28.5355, 77.3910)',
      remarks: 'Product catalogue shared and bulk order finalized.'
    })
  }

  // Calculate Stats
  const activeReps = new Set(visits.map(v => v.rep)).size
  const totalVisits = visits.length
  const completedVisits = visits.filter(v => v.status === 'Completed').length
  const coverageRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0
  const ordersVal = visits.filter(v => v.orders !== 'None' && v.orders !== 'Pending')
    .reduce((sum, v) => sum + parseInt(v.orders.replace(/[^0-9]/g, '') || 0), 0)

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="p-4 md:p-6 lg:p-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={MapPin} label="Total Visits Today" value={totalVisits} gradient="purple" />
        <StatCard icon={Users} label="Active Reps" value={activeReps} gradient="orange" />
        <StatCard icon={ShoppingBag} label="Orders Worth" value={`₹${ordersVal.toLocaleString()}`} gradient="green" />
        <StatCard icon={BarChart2} label="Coverage Rate" value={`${coverageRate}%`} gradient="maroon" />
      </div>

      {/* Ground Flow Architecture Map */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 mb-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-wide uppercase flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-red-700" />
          Field Sales Automation Flow (AI & Ground Integration)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 1</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-red-50 rounded-lg"><Calendar className="w-4 h-4 text-red-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Assign & Notify</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manager assigns visits on the dashboard. The field executive receives a WhatsApp message with the shop details and maps.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 2</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-red-50 rounded-lg"><MapPin className="w-4 h-4 text-red-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">GPS Check-In</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upon arriving at the shop, the rep triggers a "Check-in" which logs real-time geolocation coordinates, validating physical presence.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 3</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-red-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-red-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Submit Report</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The rep submits order details, photos, or feedback. This automatically writes to Google Sheets and updates the portal in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Table Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Today's Visits Logs</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time GPS validation and order reporting dashboard</p>
        </div>
        <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => {
          form.setFieldsValue({
            rep: 'Priya Sharma',
            customer: 'Metro Hypermarket',
            status: 'Completed',
            orders: '₹12,500',
            location: 'Noida (28.5355, 77.3910)',
            remarks: 'Product catalogue shared and bulk order finalized.'
          })
          setIsModalOpen(true)
        }}>
          Log Visit (Check-In)
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <DataTable columns={columns} data={visits} rowKey="id" />
      </div>

      {/* Log Visit Modal */}
      <Modal title="Log / Assign New Field Visit" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleLogVisit}>
          <Form.Item name="rep" label="Sales Representative" rules={[{ required: true, message: 'Please select sales rep' }]}>
            <Select placeholder="Select representative">
              {SALES_REPS.map(rep => (
                <Select.Option key={rep} value={rep}>{rep}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="customer" label="Customer Shop Name" rules={[{ required: true, message: 'Enter shop name' }]}>
            <Input placeholder="e.g. Sharma Kirana Store" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="location" label="Location / Coordinates">
              <Input placeholder="e.g. Delhi (28.6139, 77.2090)" />
            </Form.Item>
            <Form.Item name="orders" label="Orders Value (if any)">
              <Input placeholder="e.g. ₹5,000 or None" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Completed">Completed</Select.Option>
                <Select.Option value="Scheduled">Scheduled</Select.Option>
                <Select.Option value="Missed">Missed</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="remarks" label="Remarks / Visit Notes">
            <Input.TextArea rows={3} placeholder="Provide feedback or notes from ground..." />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleFillDummy}>Fill Dummy Check-In</Button>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading} icon={<Send className="w-4 h-4" />}>
              Submit Check-In Log
            </Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default FieldSales
