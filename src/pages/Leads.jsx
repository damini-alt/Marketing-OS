import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Phone, Mail, MessageCircle, UserPlus, Filter, Trash2, IndianRupee } from 'lucide-react'
import { Button, message, Avatar, Tag, Space, Select, Input, Form, Popconfirm } from 'antd'
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

const sourceIcons = {
  WhatsApp: { icon: MessageCircle, color: 'text-green-600 bg-green-50' },
  Instagram: { icon: MessageCircle, color: 'text-pink-600 bg-pink-50' },
  Facebook: { icon: MessageCircle, color: 'text-primary-600 bg-primary-50' },
  'Google Ads': { icon: MessageCircle, color: 'text-red-600 bg-red-50' },
}

function Leads() {
  const { leads, campaigns, addLead, updateLead, deleteLead, loading } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [form] = Form.useForm()
  const [filterStatus, setFilterStatus] = useState(null)
  const [filterSource, setFilterSource] = useState(null)

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    revenue: leads.reduce((sum, l) => sum + (parseFloat(l.revenue) || 0), 0),
  }

  const columns = [
    {
      title: 'Lead ID',
      dataIndex: 'lead_id',
      key: 'lead_id',
      sorter: (a, b) => a.lead_id.localeCompare(b.lead_id),
      render: (text) => <span className="font-mono text-sm text-gray-600">{text}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div className="flex items-center gap-4">
          <Avatar
            style={{ backgroundColor: '#f2e8e5', color: '#5d2a23' }}
            className="flex-shrink-0 font-bold border border-primary-100"
          >
            {text?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <div>
            <p className="font-bold text-slate-900">{text}</p>
            <p className="text-xs text-slate-500 font-medium">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => (
        <a href={`tel:${text}`} className="text-slate-600 hover:text-primary font-medium transition-colors">
          {text}
        </a>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      filters: [
        { text: 'WhatsApp', value: 'WhatsApp' },
        { text: 'Instagram', value: 'Instagram' },
        { text: 'Facebook', value: 'Facebook' },
        { text: 'Google Ads', value: 'Google Ads' },
      ],
      onFilter: (value, record) => record.source === value,
      render: (source) => <Badge status={source} />,
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      render: (campaignId) => {
        const campaign = campaigns.find((c) => c.campaign_id === campaignId)
        return (
          <span className="text-sm text-gray-600">
            {campaign?.campaign_name || '-'}
          </span>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'New', value: 'new' },
        { text: 'Contacted', value: 'contacted' },
        { text: 'Qualified', value: 'qualified' },
        { text: 'Converted', value: 'converted' },
        { text: 'Lost', value: 'lost' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => <Badge status={status} />,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a, b) => a.revenue - b.revenue,
      render: (revenue) => (
        <span className="font-medium text-gray-900">
          {revenue ? `₹${revenue.toLocaleString('en-IN')}` : '-'}
        </span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_date',
      key: 'created_date',
      sorter: (a, b) => new Date(a.created_date) - new Date(b.created_date),
      render: (date) => <span className="text-xs text-gray-500">{date ? new Date(date).toLocaleDateString('en-IN') : '-'}</span>,
    },
    {
      title: 'Converted Date',
      dataIndex: 'converted_date',
      key: 'converted_date',
      sorter: (a, b) => new Date(a.converted_date) - new Date(b.converted_date),
      render: (date) => <span className="text-xs text-green-600 font-medium">{date ? new Date(date).toLocaleDateString('en-IN') : '-'}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Edit className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(record)
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<Phone className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation()
              window.open(`tel:${record.phone}`)
            }}
          />

          <Popconfirm
            title="Delete this lead?"
            onConfirm={(e) => {
              e.stopPropagation()
              handleDelete(record.lead_id, record.row_number)
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 className="w-4 h-4" />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleDelete = async (leadId, rowNumber) => {
    const result = await deleteLead(leadId, rowNumber)
    if (result.success) {
      message.success('Lead deleted successfully')
    } else {
      message.error('Failed to delete lead')
    }
  }

  const handleAdd = () => {
    setEditingLead(null)
    form.resetFields()
    // Auto-fill today's date for new leads
    form.setFieldsValue({ 
      created_date: new Date().toISOString().split('T')[0],
      status: 'new'
    })
    setIsModalOpen(true)
  }



  const handleEdit = (lead) => {
    setEditingLead(lead)
    form.setFieldsValue(lead)
    setIsModalOpen(true)
  }

  const handleSubmit = async (values) => {
    if (editingLead) {
      await updateLead(editingLead.lead_id, values, editingLead.row_number)
      message.success('Lead updated successfully')
    } else {
      await addLead(values)
      message.success('Lead added successfully')
    }
    setIsModalOpen(false)
    form.resetFields()
  }

  const filteredLeads = leads.filter((l) => {
    if (filterStatus && filterStatus !== 'all' && l.status !== filterStatus) return false
    if (filterSource && filterSource !== 'all' && l.source !== filterSource) return false
    return true
  })

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={UserPlus}
          label="Total Leads"
          value={stats.total}
          gradient="purple"
        />
        <StatCard
          icon={Plus}
          label="New Leads"
          value={stats.new}
          gradient="maroon"
        />
        <StatCard
          icon={Edit}
          label="Converted"
          value={stats.converted}
          gradient="green"
        />
        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={stats.revenue}
          prefix="₹"
          gradient="orange"
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leads</h2>
          <p className="text-sm text-slate-500 font-medium">Manage and track your potential customers</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <Select
            placeholder="Status"
            style={{ width: 140 }}
            allowClear
            onChange={setFilterStatus}
            className="rounded-xl"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'new', label: 'New' },
              { value: 'contacted', label: 'Contacted' },
              { value: 'qualified', label: 'Qualified' },
              { value: 'converted', label: 'Converted' },
              { value: 'lost', label: 'Lost' },
            ]}
          />
          <Select
            placeholder="Source"
            style={{ width: 140 }}
            allowClear
            onChange={setFilterSource}
            className="rounded-xl"
            options={[
              { value: 'all', label: 'All Sources' },
              { value: 'WhatsApp', label: 'WhatsApp' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'Facebook', label: 'Facebook' },
              { value: 'Google Ads', label: 'Google Ads' },
            ]}
          />
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
            className="shadow-soft"
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton variant="table" />
      ) : (
        <DataTable
          columns={columns}
          data={filteredLeads}
          rowKey="lead_id"
          searchPlaceholder="Search leads..."
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
        size="lg"
      >
        <div className="mb-6 flex gap-2 flex-wrap">
          <p className="w-full text-xs text-gray-400 mb-1 uppercase font-bold">Quick Fill Test Templates:</p>
          <Button size="small" onClick={() => form.setFieldsValue({ name: 'Rohit Verma', email: 'rohit.v@example.com', phone: '9822334455', source: 'WhatsApp', status: 'new' })}>
            High Intent (WA)
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ name: 'Sneha Kapur', email: 'sneha.k@example.com', phone: '9911882233', source: 'Instagram', status: 'new' })}>
            Inquiry (Insta)
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ name: 'Vikram Singh', email: 'vikram.s@example.com', phone: '9733445566', source: 'Google Ads', status: 'new' })}>
            Cold Lead (Ads)
          </Button>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Full name" size="large" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: 'Please enter phone' }]}
            >
              <Input placeholder="9876543210" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter valid email' }]}
          >
            <Input placeholder="email@example.com" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="source"
              label="Source"
              rules={[{ required: true, message: 'Please select source' }]}
            >
              <Select placeholder="Select source" size="large">
                <Select.Option value="WhatsApp">WhatsApp</Select.Option>
                <Select.Option value="Instagram">Instagram</Select.Option>
                <Select.Option value="Facebook">Facebook</Select.Option>
                <Select.Option value="Google Ads">Google Ads</Select.Option>
                <Select.Option value="Referral">Referral</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="campaign_id"
              label="Campaign"
            >
              <Select placeholder="Select campaign" size="large" allowClear>
                {campaigns.map((c) => (
                  <Select.Option key={c.campaign_id} value={c.campaign_id}>
                    {c.campaign_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Status"
            initialValue="new"
          >
            <Select size="large">
              <Select.Option value="new">New</Select.Option>
              <Select.Option value="contacted">Contacted</Select.Option>
              <Select.Option value="qualified">Qualified</Select.Option>
              <Select.Option value="converted">Converted</Select.Option>
              <Select.Option value="lost">Lost</Select.Option>
            </Select>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="created_date"
              label="Created Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <Input type="date" size="large" />
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
            >
              {({ getFieldValue }) => 
                getFieldValue('status') === 'converted' ? (
                  <Form.Item
                    name="converted_date"
                    label="Converted Date"
                    rules={[{ required: true, message: 'Please select conversion date' }]}
                  >
                    <Input type="date" size="large" />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </div>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.status !== currentValues.status}
          >
            {({ getFieldValue }) => 
              getFieldValue('status') === 'converted' ? (
                <Form.Item
                  name="revenue"
                  label="Revenue (₹)"
                  rules={[{ required: true, message: 'Please enter revenue' }]}
                  initialValue={0}
                >
                  <Input
                    type="number"
                    placeholder="Actual revenue from this lead"
                    size="large"
                    prefix="₹"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <div className="flex justify-between items-center pt-4">
            <Button type="dashed" onClick={() => form.setFieldsValue({ name: 'Amit Kumar', phone: '9876543210', email: 'amit@example.com', source: 'WhatsApp', status: 'new', created_date: '2026-05-20' })}>Fill Dummy Data</Button>
            <div className="flex gap-3">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingLead ? 'Update Lead' : 'Add Lead'}
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default Leads
