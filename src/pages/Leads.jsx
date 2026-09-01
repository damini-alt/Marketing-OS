import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Phone, Mail, MessageCircle, UserPlus, Filter, Trash2, IndianRupee, MessageSquare } from 'lucide-react'
import { Button, message, Avatar, Tag, Space, Select, Input, Form, Popconfirm, Drawer, Timeline } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import { useStore } from '../hooks/useStore'
import QuickPresets from '../components/common/QuickPresets'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function Leads() {
  const { leads, campaigns, addLead, updateLead, deleteLead, loading, initialLoading, leadComments, addLeadComment, getLeadComments } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [form] = Form.useForm()
  const [filterStatus, setFilterStatus] = useState(null)
  const [filterSource, setFilterSource] = useState(null)
  
  // Comments Drawer States
  const [selectedLeadForComments, setSelectedLeadForComments] = useState(null)
  const [newCommentText, setNewCommentText] = useState('')

  const role = localStorage.getItem('userRole') || 'admin'

  // Filter leads first to determine stats visibility
  const displayedLeads = leads.filter((l) => {
    if (role === 'executive' && l.assigned_to !== 'executive') return false
    return true
  })

  const stats = {
    total: displayedLeads.length,
    new: displayedLeads.filter((l) => l.status === 'new').length,
    converted: displayedLeads.filter((l) => l.status === 'converted').length,
    revenue: displayedLeads.reduce((sum, l) => sum + (parseFloat(l.revenue) || 0), 0),
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
      title: 'Assignee',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      render: (assignee) => (
        <span className="capitalize text-sm font-medium text-slate-700">
          {assignee === 'executive' ? 'Executive' : 'Admin'}
        </span>
      ),
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
      title: 'UTM Attribution',
      key: 'utm',
      render: (_, record) => {
        if (!record.utm_source && !record.utm_campaign) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex flex-col gap-1">
            {record.utm_source && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono w-max">
                src: {record.utm_source}
              </span>
            )}
            {record.utm_campaign && (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded font-bold w-max">
                cmp: {record.utm_campaign}
              </span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Touch Count',
      dataIndex: 'touch_count',
      key: 'touch_count',
      sorter: (a, b) => (a.touch_count || 1) - (b.touch_count || 1),
      render: (touch_count) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          (touch_count || 1) > 1 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700'
        }`}>
          {touch_count || 1}
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
            icon={<MessageSquare className="w-4 h-4 text-[#5d2a23]" />}
            onClick={(e) => {
              e.stopPropagation()
              handleOpenComments(record)
            }}
            title="Comments & Timeline"
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
    form.setFieldsValue({ 
      created_date: new Date().toISOString().split('T')[0],
      status: 'new',
      assigned_to: 'admin'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (lead) => {
    setEditingLead(lead)
    form.setFieldsValue(lead)
    setIsModalOpen(true)
  }

  const handleOpenComments = (lead) => {
    setSelectedLeadForComments(lead)
    getLeadComments(lead.lead_id)
    setNewCommentText('')
  }

  const handleAddComment = () => {
    if (!newCommentText.trim() || !selectedLeadForComments) return
    const authorRole = localStorage.getItem('userRole') === 'executive' ? 'Marketing Executive' : 'Admin'
    const authorName = localStorage.getItem('adminName') || authorRole
    addLeadComment(selectedLeadForComments.lead_id, newCommentText.trim(), authorName)
    setNewCommentText('')
    message.success('Comment added')
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

  const filteredLeads = displayedLeads.filter((l) => {
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
            style={{ width: 160 }}
            allowClear
            onChange={setFilterSource}
            className="rounded-xl"
            options={[
              { value: 'all', label: 'All Sources' },
              { value: 'WhatsApp', label: 'WhatsApp' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'Facebook', label: 'Facebook' },
              { value: 'Google Ads', label: 'Google Ads' },
              { value: 'TradeIndia', label: 'TradeIndia' },
              { value: 'Meta Lead Forms', label: 'Meta Lead Forms' },
              { value: 'Website', label: 'Website' },
              { value: 'LinkedIn', label: 'LinkedIn' },
              { value: 'API', label: 'API' },
              { value: 'Referral', label: 'Referral' },
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
      {initialLoading ? (
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
        <QuickPresets type="leads" form={form} />
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
                <Select.Option value="TradeIndia">TradeIndia</Select.Option>
                <Select.Option value="Meta Lead Forms">Meta Lead Forms</Select.Option>
                <Select.Option value="Website">Website</Select.Option>
                <Select.Option value="LinkedIn">LinkedIn</Select.Option>
                <Select.Option value="API">API</Select.Option>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <Form.Item
              name="assigned_to"
              label="Assigned To"
              rules={[{ required: true, message: 'Please select assignee' }]}
              initialValue="admin"
            >
              <Select size="large">
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>
          </div>

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

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingLead ? 'Update Lead' : 'Add Lead'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Comments & Timeline Drawer */}
      <Drawer
        title={`Comments & Timeline - ${selectedLeadForComments?.name}`}
        placement="right"
        width={450}
        onClose={() => setSelectedLeadForComments(null)}
        open={!!selectedLeadForComments}
      >
        {selectedLeadForComments && (
          <div className="flex flex-col h-full justify-between">
            <div className="space-y-6 overflow-y-auto flex-1 pr-2 pb-4">
              {/* Lead Summary Info */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <h4 className="font-bold text-slate-800 mb-2 text-sm text-primary flex justify-between items-center">
                  <span>Lead Details</span>
                  <span className="bg-primary-50 text-primary border border-primary-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    Touch Count: {selectedLeadForComments.touch_count || 1}
                  </span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Source</span>
                    <Badge status={selectedLeadForComments.source} size="sm" />
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Status</span>
                    <Badge status={selectedLeadForComments.status} size="sm" />
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Assigned To</span>
                    <span className="text-slate-700 font-semibold capitalize">{selectedLeadForComments.assigned_to || 'Admin'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Revenue</span>
                    <span className="text-slate-700 font-semibold">₹{(selectedLeadForComments.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* UTM Attribution Parameters */}
                {(selectedLeadForComments.utm_source || selectedLeadForComments.utm_campaign) && (
                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-400 font-medium block mb-1">UTM Attribution</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedLeadForComments.utm_source && (
                        <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                          source: {selectedLeadForComments.utm_source}
                        </span>
                      )}
                      {selectedLeadForComments.utm_medium && (
                        <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                          medium: {selectedLeadForComments.utm_medium}
                        </span>
                      )}
                      {selectedLeadForComments.utm_campaign && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-bold text-[10px]">
                          campaign: {selectedLeadForComments.utm_campaign}
                        </span>
                      )}
                      {selectedLeadForComments.utm_content && (
                        <span className="bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                          content: {selectedLeadForComments.utm_content}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline list */}
              <div>
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Activities & Internal Notes</h4>
                <Timeline>
                  <Timeline.Item color="blue">
                    <div className="text-xs">
                      <p className="font-semibold text-slate-700">Lead Created</p>
                      <p className="text-slate-500">Source: {selectedLeadForComments.source}</p>
                      <span className="text-[10px] text-slate-400">{selectedLeadForComments.created_date}</span>
                    </div>
                  </Timeline.Item>

                  {(leadComments[selectedLeadForComments.lead_id] || []).map((c) => (
                    <Timeline.Item key={c.id} color="green">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-700">{c.author}</p>
                        <p className="text-slate-600 bg-emerald-50/50 p-2 rounded border border-emerald-100/50 mt-1 leading-relaxed">
                          {c.text}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>

                {(!leadComments[selectedLeadForComments.lead_id] || leadComments[selectedLeadForComments.lead_id].length === 0) && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No comments found. Add a note below.
                  </div>
                )}
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-slate-100 pt-4 flex gap-2">
              <Input.TextArea
                rows={2}
                placeholder="Type internal notes..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                type="primary"
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className="h-auto px-4"
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  )
}

export default Leads

