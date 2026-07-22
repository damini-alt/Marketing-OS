import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, IndianRupee, FileText, CheckCircle, Clock, Upload as UploadIcon, Download, Eye } from 'lucide-react'
import { Button, message, Tag, Space, Select, Input, Form, Upload, Tooltip } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'

import { useStore } from '../hooks/useStore'
import QuickPresets from '../components/common/QuickPresets'

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
                  onClick={async () => {
                    try {
                      const response = await fetch(record.pdf_url)
                      let text = await response.text()
                      
                      let cleanText = text
                      const match = text.match(/```html([\s\S]*?)```/)
                      if (match) {
                        cleanText = match[1].trim()
                      } else if (text.startsWith('```') && text.endsWith('```')) {
                        cleanText = text.replace(/^```[a-z]*\n?|```$/g, '').trim()
                      } else if (text.includes('```html')) {
                        cleanText = text.replace(/```html/g, '').replace(/```/g, '').trim()
                      }
                      
                      const blob = new Blob([cleanText], { type: 'text/html' })
                      const blobUrl = window.URL.createObjectURL(blob)
                      
                      const a = document.createElement('a')
                      a.href = blobUrl
                      a.download = `${record.id}_Quotation.html`
                      a.click()
                      
                      window.URL.revokeObjectURL(blobUrl)
                    } catch (error) {
                      const a = document.createElement('a')
                      a.href = record.pdf_url
                      a.download = `${record.id}_Quotation.pdf`
                      a.click()
                    }
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

  const filteredQuotes = filterStatus && filterStatus !== 'all' ? quotations.filter(q => q.status === filterStatus) : quotations

  const addQuotationLocally = useStore(state => state.addQuotationLocally)
  const removeQuotationLocally = useStore(state => state.removeQuotationLocally)

  const handleSubmit = async (values) => {
    // 1. Create a temporary quotation with "Generating..." status
    const tempId = `QT-TEMP-${Date.now()}`
    const tempQuote = {
      id: tempId,
      customer: values.customer,
      email: values.email,
      phone: values.phone,
      product: values.product,
      date: new Date().toISOString().split('T')[0],
      amount: Number(values.quantity) * Number(values.unit_price),
      gst: Math.round(Number(values.quantity) * Number(values.unit_price) * 0.18),
      status: 'Generating...',
      pdf_url: null
    }

    // 2. Add it to the local store list immediately
    addQuotationLocally(tempQuote)

    // 3. Close the modal and reset form fields so the user sees it in the list immediately
    setIsModalOpen(false)
    form.resetFields()
    message.info('Generating and sending quotation in background...')

    // 4. Run the webhook in the background asynchronously
    fetch(WEBHOOK_URL, {
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
      .then(async (response) => {
        if (response.ok) {
          message.success(`Quotation generated and sent to ${values.customer}!`)
          // Fetch updated data from Google Sheets to replace the temp entry with the real one
          await syncData()
        } else {
          message.error(`Failed to generate quotation for ${values.customer}.`)
          removeQuotationLocally(tempId)
        }
      })
      .catch((error) => {
        message.error(`Error generating quotation for ${values.customer}.`)
        console.error(error)
        removeQuotationLocally(tempId)
      })
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
              { value: 'all', label: 'All Statuses' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Sent', label: 'Sent' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />
          <Button type="primary" icon={<Plus className="w-4 h-4" />} onClick={() => {
            form.resetFields()
            setIsModalOpen(true)
          }}>
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
        <QuickPresets type="quotations" form={form} />
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
