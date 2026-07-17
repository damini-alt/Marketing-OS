import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileCheck, Users, Clock, AlertCircle, Send, CheckCircle2, XCircle, Eye, ExternalLink, ShieldCheck } from 'lucide-react'
import { Button, message, Tag, Space, Select, Input, Form, Divider, Tooltip, Modal as AntModal } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import { useStore } from '../hooks/useStore'

const ONBOARDING_WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/6VuHiijlvnPWfqDry83nT'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function Onboarding() {
  const dealers = useStore(state => state.onboarding)
  const addOnboarding = useStore(state => state.addOnboarding)
  const updateOnboardingStatus = useStore(state => state.updateOnboardingStatus)
  const syncData = useStore(state => state.syncData)
  const storeLoading = useStore(state => state.loading)

  const [filterStatus, setFilterStatus] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [remarkModal, setRemarkModal] = useState({ visible: false, type: '', id: '', loading: false })
  const [remarkForm] = Form.useForm()

  useEffect(() => {
    syncData()
  }, [])

  const handleAddDealer = async (values) => {
    setLoading(true)
    const result = await addOnboarding({
      name: values.name,
      phone: values.phone || '9000012345',
      email: values.email || 'info@company.com',
      documents: values.documents || ['GST', 'PAN']
    })
    setIsModalOpen(false)
    form.resetFields()
    setLoading(false)

    if (result.success) {
      message.success('Dealer KYC Onboarding request generated and webhook triggered successfully!')
    } else {
      message.warning('Dealer request created locally! (Webhook did not respond, check if flow is active/listening in Pucho Studio)')
    }
  }

  const handleSendKYCLink = async (record) => {
    const hideLoading = message.loading(`Sending secure document collection link to ${record.name}...`, 0)
    try {
      const response = await fetch(ONBOARDING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_id: record.id,
          name: record.name,
          phone: record.phone,
          email: record.email,
          required_docs: record.documents,
          action: 'send_kyc_reminder'
        })
      })
      hideLoading()
      if (response.ok) {
        message.success(`KYC Upload link successfully sent to ${record.name}!`)
      } else {
        message.warning(`KYC Upload link simulated for ${record.name}! (Flow is inactive in Studio)`)
      }
    } catch (e) {
      hideLoading()
      message.warning(`KYC Upload link simulated for ${record.name}! (Webhook offline)`)
    }
  }

  const handleQuickVerify = async (id) => {
    setRemarkModal({ visible: true, type: 'Verified', id, loading: false })
    remarkForm.setFieldsValue({ remarks: '' })
  }

  const handleReject = async (id) => {
    setRemarkModal({ visible: true, type: 'Rejected', id, loading: false })
    remarkForm.setFieldsValue({ remarks: '' })
  }

  const handleRemarkSubmit = async (values) => {
    setRemarkModal(prev => ({ ...prev, loading: true }))
    try {
      let finalRemarks = values.remarks?.trim()
      if (!finalRemarks) {
        finalRemarks = remarkModal.type === 'Verified' 
          ? 'Documents verified and account activated successfully.'
          : 'Verification failed by reviewer'
      }
      
      await updateOnboardingStatus(remarkModal.id, remarkModal.type, finalRemarks)
      
      if (remarkModal.type === 'Verified') {
        message.success(`Dealer KYC status updated to Verified! Note: ${finalRemarks}`)
      } else {
        message.error(`Dealer KYC status marked as Rejected. Reason: ${finalRemarks}`)
      }
      
      setRemarkModal({ visible: false, type: '', id: '', loading: false })
      remarkForm.resetFields()
    } catch (e) {
      message.error('Failed to update status')
      setRemarkModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleFillDummy = () => {
    form.setFieldsValue({
      name: 'Krishna Machinery Store',
      phone: '9345678901',
      email: 'krishna.machinery@rediffmail.com',
      documents: ['GST', 'PAN', 'Cheque']
    })
  }

  const columns = [
    { title: 'Onboarding ID', dataIndex: 'id', key: 'id', render: (text) => <span className="font-mono text-xs text-slate-600">{text}</span> },
    { 
      title: 'Dealer Details', 
      key: 'details',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{record.name}</span>
          <span className="text-xs text-slate-500">{record.email} | {record.phone}</span>
        </div>
      )
    },
    { 
      title: 'Required Documents', 
      dataIndex: 'documents', 
      key: 'documents',
      render: (docs) => (
        <Space size={[0, 4]} wrap>
          {docs.map(doc => <Tag key={doc} color="blue">{doc}</Tag>)}
        </Space>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status, record) => (
        <Tooltip title={record.remarks || ''}>
          <Tag color={status === 'Verified' ? 'green' : status === 'Pending' ? 'orange' : 'red'}>{status}</Tag>
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Send KYC Document Upload Link">
            <Button 
              type="text" 
              size="small" 
              icon={<Send className="w-3.5 h-3.5 text-blue-600" />}
              onClick={() => handleSendKYCLink(record)}
            />
          </Tooltip>
          
          {record.status === 'Pending' && (
            <>
              <Tooltip title="Approve & Verify">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                  onClick={() => handleQuickVerify(record.id)}
                />
              </Tooltip>
              <Tooltip title="Reject Documents">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<XCircle className="w-3.5 h-3.5 text-red-600" />}
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  const filteredDealers = filterStatus && filterStatus !== 'all' ? dealers.filter(d => d.status === filterStatus) : dealers

  // Stats calculation
  const totalRequests = dealers.length
  const pendingCount = dealers.filter(d => d.status === 'Pending').length
  const verifiedCount = dealers.filter(d => d.status === 'Verified').length
  const rejectedCount = dealers.filter(d => d.status === 'Rejected').length

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Requests" value={totalRequests} gradient="purple" />
        <StatCard icon={Clock} label="Pending verification" value={pendingCount} gradient="orange" />
        <StatCard icon={FileCheck} label="Verified Dealers" value={verifiedCount} gradient="green" />
        <StatCard icon={AlertCircle} label="Rejected Submissions" value={rejectedCount} gradient="maroon" />
      </div>

      {/* KYC AI Pipeline Flow Banner */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-6 rounded-2xl border border-blue-100/80">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-blue-100 rounded-lg text-blue-700"><ShieldCheck className="w-5 h-5" /></span>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Pucho AI B2B KYC Verification Flow</h3>
            <p className="text-xs text-slate-500 font-medium">How dealer onboarding, document upload reminders, and OCR parsing run automatically</p>
          </div>
        </div>
        <Divider className="my-3 border-blue-200/50" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 1</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-blue-50 rounded-lg"><Send className="w-4 h-4 text-blue-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Send Document Link</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When a new dealer request is generated, Pucho automatically sends a WhatsApp/SMS alert containing a secure document upload page link.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 2</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-blue-50 rounded-lg"><Eye className="w-4 h-4 text-blue-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Upload & AI OCR Scan</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dealer uploads PAN & GST documents. The Pucho AI Vision/OCR node extracts GSTIN/PAN numbers and verifies them against central records.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 3</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-blue-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-blue-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Log & Approve</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once AI checks are complete, results are written back to Google Sheets. The manager is alerted to give the final click approval.
            </p>
          </div>
        </div>
      </div>

      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">B2B KYC Onboarding Requests</h2>
          <p className="text-sm text-slate-500 font-medium">Verify documents, request uploads, and manage new B2B distributor registrations</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Select
            placeholder="Filter Status"
            style={{ width: 150 }}
            allowClear
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Verified', label: 'Verified' },
              { value: 'Pending', label: 'Pending Verification' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />
          <Button 
            type="primary" 
            icon={<Plus className="w-4 h-4" />} 
            onClick={() => {
              form.setFieldsValue({
                name: 'Krishna Machinery Store',
                phone: '9345678901',
                email: 'krishna.machinery@rediffmail.com',
                documents: ['GST', 'PAN', 'Cheque']
              })
              setIsModalOpen(true)
            }}
          >
            New Onboarding Request
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <DataTable columns={columns} data={filteredDealers} rowKey="id" />
      </div>

      {/* Add Request Modal */}
      <Modal title="Create Dealer KYC Collection Request" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form form={form} layout="vertical" onFinish={handleAddDealer}>
          <Form.Item name="name" label="Dealer / Distributor Business Name" rules={[{ required: true, message: 'Please enter business name' }]}>
            <Input placeholder="e.g. Krishna Machinery Store" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="phone" label="Registered WhatsApp / Mobile" rules={[{ required: true, message: 'Please enter phone' }]}>
              <Input placeholder="e.g. 9988776655" />
            </Form.Item>
            <Form.Item name="email" label="Dealer Email Address" rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}>
              <Input placeholder="e.g. partner@business.com" />
            </Form.Item>
          </div>
          <Form.Item name="documents" label="Required Documents for Upload" rules={[{ required: true, message: 'Select at least one document' }]}>
            <Select mode="multiple" placeholder="Select documents" style={{ width: '100%' }}>
              <Select.Option value="GST">GST Registration Certificate (GSTIN)</Select.Option>
              <Select.Option value="PAN">PAN Card</Select.Option>
              <Select.Option value="Cheque">Cancelled Bank Cheque</Select.Option>
            </Select>
          </Form.Item>
          
          <div className="flex justify-between items-center pt-4">
            <Button type="dashed" onClick={handleFillDummy}>Fill Dummy Request</Button>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Request KYC</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Remark Modal for Approve/Reject */}
      <AntModal
        title={remarkModal.type === 'Verified' ? 'Verify KYC Onboarding' : 'Reject KYC Onboarding'}
        open={remarkModal.visible}
        onCancel={() => setRemarkModal({ visible: false, type: '', id: '', loading: false })}
        footer={null}
      >
        <Form form={remarkForm} layout="vertical" onFinish={handleRemarkSubmit} className="mt-4">
          <Form.Item 
            name="remarks" 
            label={remarkModal.type === 'Verified' ? 'Verification Note (Optional)' : 'Rejection Reason'}
            rules={[{ required: remarkModal.type === 'Rejected', message: 'Rejection reason is required' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder={remarkModal.type === 'Verified' 
                ? 'e.g. Approved with credit terms of 30 days...' 
                : 'e.g. GST certificate is blurry and unreadable...'} 
            />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setRemarkModal({ visible: false, type: '', id: '', loading: false })}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={remarkModal.loading} danger={remarkModal.type === 'Rejected'}>
              {remarkModal.type === 'Verified' ? 'Approve & Verify' : 'Reject Onboarding'}
            </Button>
          </div>
        </Form>
      </AntModal>
    </motion.div>
  )
}

export default Onboarding
