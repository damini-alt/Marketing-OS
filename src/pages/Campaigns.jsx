import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, MoreVertical, Filter, Download, Megaphone, Users, TrendingUp, Calendar, Radio, RefreshCw } from 'lucide-react'
import { Button, Dropdown, Menu, message, Popconfirm, Tooltip } from 'antd'
import { Form, Input, Select, InputNumber, DatePicker } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import { useStore } from '../hooks/useStore'
import { downloadImage } from '../utils/downloadUtils'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function Campaigns() {
  const { campaigns, leads, addCampaign, updateCampaign, loading, deleteCampaign } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [form] = Form.useForm()
  const [filterStatus, setFilterStatus] = useState(null)
  const [filterType, setFilterType] = useState(null)

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    planned: campaigns.filter((c) => c.status === 'planned').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
  }



  const columns = [
    {
      title: 'Campaign ID',
      dataIndex: 'campaign_id',
      key: 'campaign_id',
      sorter: (a, b) => a.campaign_id.localeCompare(b.campaign_id),
      render: (text) => <span className="font-mono text-sm text-gray-600">{text}</span>,
    },
    {
      title: 'Campaign',
      dataIndex: 'campaign_name',
      key: 'campaign_name',
      sorter: (a, b) => a.campaign_name.localeCompare(b.campaign_name),
      render: (text) => <span className="font-semibold text-gray-900">{text}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'campaign_type',
      key: 'campaign_type',
      render: (type) => <Badge status={type} />,
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      sorter: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
    },
    {
      title: 'Budget',
      dataIndex: 'budget',
      key: 'budget',
      sorter: (a, b) => a.budget - b.budget,
      render: (budget) => <span className="font-medium text-gray-900">₹{budget?.toLocaleString('en-IN')}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Badge status={status} />,
    },
    {
      title: 'Leads',
      key: 'leads',
      render: (_, record) => {
        const count = leads.filter((l) => l.campaign_id === record.campaign_id).length
        return <span className="font-medium">{count}</span>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="text"
            size="small"
            icon={<Edit className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(record)
            }}
          />
          {record.image_url && (
            <>
              <Button
                type="text"
                size="small"
                icon={<Eye className="w-4 h-4 text-purple-600" />}
                title="View Banner"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewImage(record.image_url)
                  setIsPreviewOpen(true)
                }}
              />
              <Button
                type="text"
                size="small"
                icon={<Download className="w-4 h-4 text-primary" />}
                title="Download Banner"
                onClick={(e) => {
                  e.stopPropagation()
                  downloadImage(record.image_url, `${record.campaign_name}-banner.jpg`)
                }}
              />
            </>
          )}
          <Popconfirm
            title="Delete this campaign?"
            onConfirm={() => handleDelete(record.campaign_id, record.row_number)}
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
        </div>
      ),
    },
  ]



  const handleAdd = () => {
    setEditingCampaign(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign)
    form.setFieldsValue(campaign)
    setIsModalOpen(true)
  }

  const handleDelete = async (campaignId, rowNumber) => {
    const result = await deleteCampaign(campaignId, rowNumber)
    if (result.success) {
      message.success('Campaign deleted successfully')
    } else {
      message.error('Failed to delete campaign')
    }
  }

  const handleSubmit = async (values) => {
    if (editingCampaign) {
      await updateCampaign(editingCampaign.campaign_id, values, editingCampaign.row_number)
      message.success('Campaign updated successfully')
    } else {
      await addCampaign(values)
      message.success('Campaign created successfully')
    }
    setIsModalOpen(false)
    form.resetFields()
  }

  const filteredCampaigns = campaigns.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false
    if (filterType && c.campaign_type !== filterType) return false
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
          icon={Megaphone}
          label="Total"
          value={stats.total}
          gradient="purple"
        />
        <StatCard
          icon={Eye}
          label="Active"
          value={stats.active}
          gradient="green"
        />
        <StatCard
          icon={Filter}
          label="Planned"
          value={stats.planned}
          gradient="maroon"
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={stats.completed}
          gradient="slate"
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Campaigns</h2>
          <p className="text-sm text-slate-500 font-medium">Create and monitor your performance marketing</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            placeholder="Status"
            style={{ width: 140 }}
            allowClear
            onChange={setFilterStatus}
            className="rounded-xl"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'planned', label: 'Planned' },
              { value: 'completed', label: 'Completed' },
              { value: 'paused', label: 'Paused' },
            ]}
          />
          <Select
            placeholder="Type"
            style={{ width: 140 }}
            allowClear
            onChange={setFilterType}
            className="rounded-xl"
            options={[
              { value: 'festival', label: 'Festival' },
              { value: 'product', label: 'Product' },
              { value: 'discount', label: 'Discount' },
              { value: 'branding', label: 'Branding' },
            ]}
          />
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
            className="shadow-soft"
          >
            New Campaign
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton variant="table" />
      ) : (
        <DataTable
          columns={columns}
          data={filteredCampaigns}
          rowKey="campaign_id"
          searchPlaceholder="Search campaigns..."
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        size="lg"
      >
        <div className="mb-6 flex gap-2 flex-wrap">
          <p className="w-full text-xs text-gray-400 mb-1 uppercase font-bold">Quick Fill Test Templates:</p>
          <Button size="small" onClick={() => form.setFieldsValue({ campaign_name: 'Summer Sale 2024', type: 'promotion', budget: 50000, start_date: '2024-06-01', end_date: '2024-06-30' })}>
            Promotion
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ campaign_name: 'New Product Launch', type: 'product', budget: 100000, start_date: '2024-07-15', end_date: '2024-08-15' })}>
            Product
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ campaign_name: 'Newsletter July', type: 'newsletter', budget: 5000, start_date: '2024-07-01', end_date: '2024-07-01' })}>
            Newsletter
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
              name="campaign_name"
              label="Campaign Name"
              rules={[{ required: true, message: 'Please enter campaign name' }]}
            >
              <Input placeholder="e.g., Diwali Sale 2024" size="large" />
            </Form.Item>
            <Form.Item
              name="campaign_type"
              label="Campaign Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select placeholder="Select type" size="large">
                <Select.Option value="festival">Festival</Select.Option>
                <Select.Option value="product">Product Launch</Select.Option>
                <Select.Option value="discount">Discount/Offer</Select.Option>
                <Select.Option value="branding">Branding</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="start_date"
              label="Start Date"
              rules={[{ required: true, message: 'Please select start date' }]}
            >
              <Input type="date" size="large" />
            </Form.Item>
            <Form.Item
              name="end_date"
              label="End Date"
              rules={[{ required: true, message: 'Please select end date' }]}
            >
              <Input type="date" size="large" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="budget"
              label="Budget (₹)"
              rules={[{ required: true, message: 'Please enter budget' }]}
            >
              <InputNumber
                size="large"
                min={0}
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              initialValue="planned"
            >
              <Select size="large">
                <Select.Option value="planned">Planned</Select.Option>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="paused">Paused</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="channels"
            label="Marketing Channels"
          >
            <Select
              mode="multiple"
              placeholder="Select channels"
              size="large"
              options={[
                { value: 'WhatsApp', label: 'WhatsApp' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'Facebook', label: 'Facebook' },
                { value: 'Google Ads', label: 'Google Ads' },
                { value: 'LinkedIn', label: 'LinkedIn' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="target_audience"
            label="Target Audience"
          >
            <Input placeholder="e.g., All customers, New leads, Young professionals" size="large" />
          </Form.Item>

          <div className="flex justify-between items-center pt-4">
            <Button type="dashed" onClick={() => form.setFieldsValue({ campaign_name: 'Dummy Mega Sale 2026', campaign_type: 'discount', start_date: '2026-06-01', end_date: '2026-06-30', budget: 150000, status: 'planned', channels: ['WhatsApp', 'Instagram'], target_audience: 'Existing Customers' })}>Fill Dummy Data</Button>
            <div className="flex gap-3">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Campaign Banner Preview"
        size="lg"
      >
        <div className="flex flex-col items-center">
          <img 
            src={previewImage} 
            alt="Campaign Banner" 
            className="w-full h-auto rounded-xl shadow-lg border border-gray-100"
          />
          <div className="mt-6 flex justify-center">
            <Button 
              type="primary" 
              icon={<Download className="w-4 h-4" />}
              onClick={() => downloadImage(previewImage, 'campaign-banner.jpg')}
            >
              Download Original Image
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default Campaigns
