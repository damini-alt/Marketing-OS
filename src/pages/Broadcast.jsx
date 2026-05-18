import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Users, Clock, CheckCircle, XCircle, Plus, Edit, Radio as RadioIcon } from 'lucide-react'
import { Button, Select, Input, Form, Radio, message, Avatar, Tag, Progress, Popconfirm } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import { useStore } from '../hooks/useStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const segmentOptions = [
  { value: 'new_leads', label: 'New Leads', description: 'Leads added in last 30 days' },
  { value: 'existing_customers', label: 'Existing Customers', description: 'Converted leads' },
  { value: 'inactive_users', label: 'Inactive Users', description: 'No activity in 60 days' },
  { value: 'all', label: 'All Contacts', description: 'Complete contact list' },
]

function Broadcast() {
  const { broadcasts, campaigns, leads, addBroadcast, updateBroadcast, deleteBroadcast, sendBroadcastNow, loading } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBroadcast, setEditingBroadcast] = useState(null)
  const [form] = Form.useForm()
  const [sending, setSending] = useState(false)

  const stats = {
    total: broadcasts.length,
    sent: broadcasts.filter((b) => b.status === 'sent').length,
    scheduled: broadcasts.filter((b) => b.status === 'scheduled').length,
    totalMessages: broadcasts.reduce((sum, b) => sum + (Number(b.total_sent) || 0), 0),
    totalDelivered: broadcasts.reduce((sum, b) => sum + (Number(b.delivered) || 0), 0),
    totalResponses: broadcasts.reduce((sum, b) => sum + (Number(b.responses) || 0), 0),
  }

  const deliveryRate = stats.totalMessages > 0
    ? ((stats.totalDelivered / stats.totalMessages) * 100).toFixed(1)
    : 0

  const responseRate = stats.totalDelivered > 0
    ? ((stats.totalResponses / stats.totalDelivered) * 100).toFixed(1)
    : 0

  const columns = [
    {
      title: 'Broadcast ID',
      dataIndex: 'broadcast_id',
      key: 'broadcast_id',
      render: (text) => <span className="font-mono text-sm text-gray-600">{text}</span>,
    },
    {
      title: 'Segment',
      dataIndex: 'segment',
      key: 'segment',
      render: (segment) => <Badge status={segment} />,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (text) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {text.substring(0, 50)}...
        </span>
      ),
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      render: (campaignId) => {
        const campaign = campaigns.find((c) => c.campaign_id === campaignId)
        return <span className="text-sm">{campaign?.campaign_name || '-'}</span>
      },
    },
    {
      title: 'Scheduled',
      key: 'scheduled',
      render: (_, record) => (
        <span className="text-sm text-gray-600">
          {record.scheduled_date} {record.scheduled_time}
        </span>
      ),
    },
    {
      title: 'Delivered',
      key: 'delivery',
      render: (_, record) => (
        <div className="w-24">
          <Progress
            percent={record.total_sent > 0 ? (record.delivered / record.total_sent) * 100 : 0}
            size="small"
            strokeColor="#10b981"
            format={() => `${record.delivered}/${record.total_sent}`}
          />
        </div>
      ),
    },
    {
      title: 'Responses',
      dataIndex: 'responses',
      key: 'responses',
      render: (responses) => (
        <span className="font-medium text-purple-600">{responses}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Badge status={status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
          <div className="flex gap-2">
            <Button 
              type="link" 
              size="small" 
              icon={<Edit className="w-4 h-4" />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
        </div>
      ),
    },
  ]

  const handleDelete = async (broadcastId, rowNumber) => {
    const result = await deleteBroadcast(broadcastId, rowNumber)
    if (result.success) {
      message.success('Broadcast deleted successfully')
    } else {
      message.error('Failed to delete broadcast')
    }
  }

  const handleAdd = () => {
    setEditingBroadcast(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingBroadcast(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleSubmit = async (values) => {
    setSending(true)
    try {
      // Calculate contacts based on the selected segment and channel
      const segmentLeads = leads.filter((l) => {
        if (values.segment === 'all') return true
        if (values.segment === 'new_leads') return l.status === 'new'
        if (values.segment === 'existing_customers') return l.status === 'converted'
        if (values.segment === 'inactive_users') return l.status === 'lost'
        return true
      })

      const phones = segmentLeads.map((l) => l.phone).filter(p => p)
      const emails = segmentLeads.map((l) => l.email).filter(e => e)
      
      const broadcastData = {
        ...values,
        phones: values.channel === 'whatsapp' ? phones : [],
        emails: values.channel === 'email' ? emails : [],
        action: values.channel === 'email' ? 'email' : 'create'
      }

      if (editingBroadcast) {
        await updateBroadcast(editingBroadcast.broadcast_id, broadcastData, editingBroadcast.row_number)
        message.success('Broadcast updated successfully')
      } else {
        await addBroadcast(broadcastData)
        message.success('Broadcast scheduled successfully')
      }
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error('Failed to schedule broadcast')
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={RadioIcon}
          label="Total Broadcasts"
          value={stats.total}
          gradient="purple"
        />
        <StatCard
          icon={Send}
          label="Messages Sent"
          value={stats.totalMessages}
          gradient="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Delivery Rate"
          value={deliveryRate}
          suffix="%"
          gradient="green"
        />
        <StatCard
          icon={Users}
          label="Response Rate"
          value={responseRate}
          suffix="%"
          gradient="orange"
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Broadcast Center</h2>
          <p className="text-sm text-slate-500 font-medium">Reach your audience at scale</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
            className="shadow-soft"
          >
            New Broadcast
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Delivered</p>
            <p className="text-2xl font-bold text-emerald-900">{stats.totalDelivered.toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-600/70 mt-1 font-medium">{deliveryRate}% success rate</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
        
        <div className="bg-primary-50/50 rounded-2xl p-6 border border-primary-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Responses</p>
            <p className="text-2xl font-bold text-primary-900">{stats.totalResponses.toLocaleString('en-IN')}</p>
            <p className="text-xs text-primary/70 mt-1 font-medium">{responseRate}% interaction rate</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-blue-900">{stats.scheduled}</p>
            <p className="text-xs text-blue-600/70 mt-1 font-medium">Broadcasts in queue</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-soft flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Broadcast Table */}
      {loading ? (
        <Skeleton variant="table" />
      ) : (
        <DataTable
          columns={columns}
          data={broadcasts}
          rowKey="broadcast_id"
          searchPlaceholder="Search broadcasts..."
        />
      )}

      {/* New Broadcast Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Broadcast"
        size="lg"
      >
        <div className="mb-6 flex gap-2 flex-wrap">
          <p className="w-full text-xs text-gray-400 mb-1 uppercase font-bold">Quick Fill Test Templates:</p>
          <Button size="small" onClick={() => form.setFieldsValue({ channel: 'email', segment: 'all', message: 'Hello! Check out our new summer collection and get 20% off on your first order.', scheduled_date: '2024-06-01', scheduled_time: '10:00' })}>
            Email Offer
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ channel: 'whatsapp', segment: 'new_leads', message: 'Hi there! We saw you inquired about our services. Would you like to hop on a quick call?', scheduled_date: '2024-06-02', scheduled_time: '11:00' })}>
            WhatsApp Follow-up
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ channel: 'email', segment: 'inactive_users', message: "We haven't seen you in a while! Here is a special comeback offer just for you.", scheduled_date: '2024-06-03', scheduled_time: '09:00' })}>
            Reactivation
          </Button>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
          initialValues={{ channel: 'whatsapp' }}
        >
          <Form.Item
            name="channel"
            label="Communication Channel"
            rules={[{ required: true }]}
          >
            <Radio.Group size="large" className="w-full">
              <div className="grid grid-cols-2 gap-4">
                <Radio.Button value="whatsapp" className="flex-1 text-center h-12 flex items-center justify-center">
                  WhatsApp (Placeholder)
                </Radio.Button>
                <Radio.Button value="email" className="flex-1 text-center h-12 flex items-center justify-center">
                  Email (Nurture)
                </Radio.Button>
              </div>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="segment"
            label="Target Segment"
            rules={[{ required: true, message: 'Please select segment' }]}
          >
            <Select placeholder="Select target audience" size="large">
              {segmentOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  <div>
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-gray-400 ml-2">{opt.description}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="campaign_id"
            label="Link to Campaign"
          >
            <Select placeholder="Select campaign (optional)" size="large" allowClear>
              {campaigns.map((c) => (
                <Select.Option key={c.campaign_id} value={c.campaign_id}>
                  {c.campaign_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="message"
            label="Broadcast Message"
            rules={[{ required: true, message: 'Please enter message' }]}
          >
            <Input.TextArea
              placeholder="Type your broadcast message..."
              rows={5}
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="scheduled_date"
              label="Schedule Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <Input type="date" size="large" />
            </Form.Item>
            <Form.Item
              name="scheduled_time"
              label="Schedule Time"
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <Input type="time" size="large" />
            </Form.Item>
          </div>

          <Form.Item 
            noStyle 
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.segment !== currentValues.segment || prevValues.channel !== currentValues.channel
            }
          >
            {({ getFieldValue }) => {
              const currentSegment = getFieldValue('segment')
              const currentChannel = getFieldValue('channel')
              let count = 0
              const targetLeads = leads.filter(l => {
                if (currentSegment === 'all') return true
                if (currentSegment === 'new_leads') return l.status === 'new'
                if (currentSegment === 'existing_customers') return l.status === 'converted'
                if (currentSegment === 'inactive_users') return l.status === 'lost'
                return true
              })

              count = targetLeads.filter(l => currentChannel === 'email' ? l.email : l.phone).length

              return (
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Target Audience Preview</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-soft flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Approximately <span className="text-primary">{count} contacts</span>
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Will receive via <span className="capitalize">{currentChannel}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )
            }}
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={sending}>
              Schedule Broadcast
            </Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default Broadcast
