import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, IndianRupee, FileText, CheckCircle, Clock, Upload as UploadIcon, Download, Eye } from 'lucide-react'
import { Button, message, Tag, Space, Select, Input, Form, Upload, Tooltip } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'

import { useStore } from '../hooks/useStore'

const WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/bNB6pScGn1uoOx5vVVMmO/sync'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function Quotations() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [filterStatus, setFilterStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const quotations = useStore(state => state.quotations)
  const syncData = useStore(state => state.syncData)

  const columns = [
    { title: 'Quote ID', dataIndex: 'id', key: 'id', render: (text) => <span className="font-mono text-xs text-slate-600">{text}</span> },
    { title: 'Customer', dataIndex: 'customer', key: 'customer', render: (text) => <span className="font-bold text-slate-900">{text}</span> },
    { title: 'Product', dataIndex: 'product', key: 'product' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val) => `₹${Number(val).toLocaleString('en-IN')}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Approved' ? 'green' : status === 'Sent' ? 'blue' : status === 'Rejected' ? 'red' : 'gray'}>{status}</Tag>
      )
    },
    {
      title: 'PDF Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.pdf_url ? (
            <>
              <Tooltip title="View PDF">
                <Button
                  type="text"
                  size="small"
                  icon={<Eye className="w-4 h-4 text-blue-600" />}
                  onClick={() => window.open(record.pdf_url, '_blank')}
                />
              </Tooltip>
              <Tooltip title="Download PDF">
                <Button
                  type="text"
                  size="small"
                  icon={<Download className="w-4 h-4 text-green-600" />}
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = record.pdf_url
                    a.download = `${record.id}_Quotation.pdf`
                    a.click()
                  }}
                />
              </Tooltip>
            </>
          ) : (
            <span className="text-xs text-slate-400">No PDF</span>
          )}
        </Space>
      )
    }
  ]

  const filteredQuotes = filterStatus ? quotations.filter(q => q.status === filterStatus) : quotations

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.customer,
          email: values.email,
          phone: values.phone,
          product: values.product,
          quantity: values.quantity,
          unit_price: values.unit_price,
          logo_url: values.logo_url || 'https://raw.githubusercontent.com/damini07le-byte/pucho-assets/main/logo.png'
        }),
      })

      if (response.ok) {
        message.success('Quotation generated and sent successfully!')
        setIsModalOpen(false)
        form.resetFields()
        await syncData()
      } else {
        message.error('Failed to generate quotation.')
      }
    } catch (error) {
      message.error('Error sending request.')
      console.error(error)
    } finally {
      setLoading(false)
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Total Quotes" value={quotations.length} gradient="purple" />
        <StatCard icon={Clock} label="Pending" value={quotations.filter(q => q.status === 'Draft').length} gradient="orange" />
        <StatCard icon={CheckCircle} label="Approved" value={quotations.filter(q => q.status === 'Approved').length} gradient="green" />
        <StatCard icon={IndianRupee} label="Total Value" value={`₹${quotations.reduce((s, q) => s + Number(q.amount), 0).toLocaleString('en-IN')}`} gradient="maroon" />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quotations</h2>
          <p className="text-sm text-slate-500 font-medium">Generate and send professional quotation PDFs to customers</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <Select
            placeholder="Status"
            style={{ width: 140 }}
            allowClear
            onChange={setFilterStatus}
            options={[
              { value: 'Draft', label: 'Draft' },
              { value: 'Sent', label: 'Sent' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />
          <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Create Quote
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <DataTable columns={columns} data={filteredQuotes} rowKey="id" />
      </div>

      {/* Create Quote Modal */}
      <Modal
        title="Create New Quotation"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="customer" label="Customer Name" rules={[{ required: true }]}>
            <Input placeholder="Enter customer name" />
          </Form.Item>
          <Form.Item name="email" label="Customer Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter email to send quote" />
          </Form.Item>
          <Form.Item name="phone" label="Customer Phone" rules={[{ required: true }]}>
            <Input placeholder="e.g. 9876543210" type="tel" />
          </Form.Item>
          <Form.Item name="product" label="Product/Service" rules={[{ required: true }]}>
            <Input placeholder="Enter product name" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
              <Input type="number" placeholder="Qty" />
            </Form.Item>
            <Form.Item name="unit_price" label="Unit Price (₹)" rules={[{ required: true }]}>
              <Input type="number" placeholder="Price in ₹" />
            </Form.Item>
          </div>

          {/* Logo Upload Section */}
          <Form.Item name="logo_url" label="Company Logo URL (Optional)">
            <Input placeholder="Enter Logo URL" />
          </Form.Item>
          <Form.Item label="Upload Logo File (Optional)">
            <Upload maxCount={1} beforeUpload={() => false}>
              <Button icon={<UploadIcon className="w-4 h-4" />}>Select File</Button>
            </Upload>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => form.setFieldsValue({
              customer: 'Test Customer',
              email: 'test@example.com',
              phone: '9876543210',
              product: 'Steel Pipes',
              quantity: 10,
              unit_price: 500,
              logo_url: 'https://raw.githubusercontent.com/damini07le-byte/pucho-assets/main/logo.png'
            })}>Fill Dummy Data</Button>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Generate & Send Quote
            </Button>
          </div>
        </Form>
      </Modal>
    </motion.div>
  )
}

export default Quotations
