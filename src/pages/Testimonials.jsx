import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Star, MessageSquare, CheckCircle2, Clock, Send, Award, Trash2, HeartHandshake } from 'lucide-react'
import { Button, message, Tag, Space, Select, Input, Form, Divider, Tooltip, Rate } from 'antd'
import StatCard from '../components/common/StatCard'
import DataTable from '../components/common/DataTable'
import Modal from '../components/common/Modal'
import { useStore } from '../hooks/useStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function Testimonials() {
  const reviews = useStore(state => state.testimonials)
  const addTestimonial = useStore(state => state.addTestimonial)
  const updateTestimonial = useStore(state => state.updateTestimonial)
  const syncData = useStore(state => state.syncData)

  const [filterStatus, setFilterStatus] = useState(null)


  useEffect(() => {
    syncData()
  }, [])



  const columns = [
    { title: 'Review ID', dataIndex: 'id', key: 'id', render: (text) => <span className="font-mono text-xs text-slate-600">{text}</span> },
    { title: 'Customer / Client', dataIndex: 'customer', key: 'customer', render: (text) => <span className="font-bold text-slate-900">{text}</span> },
    { title: 'Email ID', dataIndex: 'email', key: 'email', render: (text) => <span className="text-slate-500 text-sm">{text || '-'}</span> },
    { 
      title: 'Rating', 
      dataIndex: 'rating', 
      key: 'rating',
      render: (rating) => (
        <Space>
          {rating > 0 ? (
            <Rate disabled value={Number(rating)} style={{ fontSize: 13, color: '#fadb14' }} />
          ) : (
            <span className="text-slate-400 text-xs italic font-medium">Pending Feedback</span>
          )}
        </Space>
      )
    },
    { 
      title: 'Feedback Message', 
      dataIndex: 'review', 
      key: 'review',
      render: (text) => <span className="text-slate-600 text-sm max-w-[280px] truncate block">{text}</span> 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Collected' ? 'green' : 'orange'}>{status}</Tag>
      )
    },
  ]

  const filteredReviews = filterStatus && filterStatus !== 'all' ? reviews.filter(r => r.status === filterStatus) : reviews

  // Stats calculation
  const totalRequests = reviews.length
  const collectedCount = reviews.filter(r => r.status === 'Collected').length
  const pendingCount = reviews.filter(r => r.status === 'Pending').length
  const averageRating = (reviews.filter(r => r.rating > 0).reduce((sum, r) => sum + r.rating, 0) / collectedCount || 0).toFixed(1)

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8 space-y-6"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Total Requests" value={totalRequests} gradient="purple" />
        <StatCard icon={CheckCircle2} label="Collected Testimonials" value={collectedCount} gradient="green" />
        <StatCard icon={Clock} label="Pending Reviews" value={pendingCount} gradient="orange" />
        <StatCard icon={Star} label="Average Rating" value={`${averageRating} ⭐`} gradient="maroon" />
      </div>

      {/* Review Automation Flow Diagram Banner */}
      <div className="bg-gradient-to-r from-purple-50/70 to-pink-50/70 p-6 rounded-2xl border border-purple-100/80">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-2 bg-purple-100 rounded-lg text-purple-700"><HeartHandshake className="w-5 h-5" /></span>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Pucho AI Social Proof Review Generator</h3>
            <p className="text-xs text-slate-500 font-medium">How review requests, rating loops, and website testimonial showcases sync automatically</p>
          </div>
        </div>
        <Divider className="my-3 border-purple-200/50" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 1</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-purple-50 rounded-lg"><Send className="w-4 h-4 text-purple-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Send Review Link</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              When an order or contract is completed, Pucho triggers a review request via WhatsApp/Email with a custom link to the feedback portal.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 2</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-purple-50 rounded-lg"><Star className="w-4 h-4 text-purple-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Review & Sentiment Scan</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customer submits their rating & review. Pucho's AI Sentiment Analysis evaluates the feedback text (positive reviews are highlighted).
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm relative">
            <div className="absolute top-3 right-3 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">Step 3</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-purple-50 rounded-lg"><Award className="w-4 h-4 text-purple-700" /></span>
              <h4 className="font-bold text-slate-900 text-sm">Publish Social Proof</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Positive testimonials are appended to Google Sheets and auto-published to your website's reviews showcase instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Testimonials & Social Proof</h2>
          <p className="text-sm text-slate-500 font-medium">Request client reviews, perform sentiment analysis, and highlight your best ratings</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <Select
            placeholder="Filter Status"
            style={{ width: 150 }}
            allowClear
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'Collected', label: 'Collected' },
              { value: 'Pending', label: 'Pending Request' },
            ]}
          />

        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
        <DataTable columns={columns} data={filteredReviews} rowKey="id" />
      </div>


    </motion.div>
  )
}

export default Testimonials
