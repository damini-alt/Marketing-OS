import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Calendar, Clock, Instagram, Facebook, MessageCircle, Linkedin, Eye, Download } from 'lucide-react'
import { Button, message, Card, Input, Select, Form, DatePicker, TimePicker, Popconfirm, Avatar } from 'antd'
import StatCard from '../components/common/StatCard'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import { useStore } from '../hooks/useStore'
import { downloadImage } from '../utils/downloadUtils'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const platformIcons = {
  WhatsApp: { icon: MessageCircle, color: 'text-green-600 bg-green-50' },
  Instagram: { icon: Instagram, color: 'text-pink-600 bg-pink-50' },
  Facebook: { icon: Facebook, color: 'text-blue-600 bg-blue-50' },
  LinkedIn: { icon: Linkedin, color: 'text-blue-700 bg-blue-50' },
}

const platformColors = {
  WhatsApp: 'border-l-green-500',
  Instagram: 'border-l-pink-500',
  Facebook: 'border-l-blue-500',
  LinkedIn: 'border-l-blue-700',
}

function ContentCalendar() {
  const { content, campaigns, addContent, updateContent, deleteContent, loading } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [form] = Form.useForm()

  const stats = {
    total: content.length,
    scheduled: content.filter((c) => c.status === 'scheduled').length,
    posted: content.filter((c) => c.status === 'posted').length,
    draft: content.filter((c) => c.status === 'draft').length,
  }

  const handleAdd = () => {
    setEditingContent(null)
    form.resetFields()
    setIsModalOpen(true)
  }



  const handleEdit = (item) => {
    setEditingContent(item)
    form.setFieldsValue(item)
    setIsModalOpen(true)
  }

  const handleSubmit = async (values) => {
    let finalValues = { ...values }
    
    // Add AI generation logic parameters if a campaign is selected
    if (values.campaign_id) {
      const selectedCampaign = campaigns.find(c => c.campaign_id === values.campaign_id)
      if (selectedCampaign) {
        finalValues.campaign_name = selectedCampaign.campaign_name;
        finalValues.reference_image_url = selectedCampaign.image_url || '';
        
        finalValues.image_generation_prompt = `Design a highly engaging, high-resolution, and professional marketing social media image for an Indian MSME brand.

Input data :- {"displayText":"${selectedCampaign.campaign_name}","serverValue":"${selectedCampaign.campaign_id}","logoUrl":"https://cdn.pucho.ai/apps/code.svg","referenceUrl":"${selectedCampaign.image_url || ''}","platform":"${values.platform || 'Instagram'}"}

Please follow these parameters while generating the image:

1. Design Style:
   Make the design visually striking, modern, premium, and aesthetically pleasing.
* For festive themes, use vibrant, celebratory, and culturally relevant colors.
* For regular product or service campaigns, maintain a clean, elegant, and professional look.

2. Platform Awareness:
   Optimize the composition and layout according to the target platform:
* Instagram -> visually engaging and trendy
* LinkedIn -> professional and corporate
* WhatsApp -> clear, direct, and mobile-friendly

3. Text Rule:
   DO NOT generate or include any random text, alphabets, typography, watermarks, or unreadable characters in the image.
   Focus only on high-quality visuals, photography, product presentation, and creative composition.

4. Brand Consistency:
   If logoUrl is provided, use it naturally within the design while maintaining a premium appearance.

5. Campaign Reference Rule:
   If a campaign URL, reference image, or campaign asset URL is provided in the input, use it as a visual style and creative reference for:
* color palette
* layout inspiration
* product positioning
* background aesthetics
* lighting and composition

Do not copy the reference exactly. Create a fresh, unique, and high-quality design inspired by the reference style.`;
      }
    }

    if (editingContent) {
      await updateContent(editingContent.content_id, finalValues, editingContent.row_number)
      message.success('Content updated successfully')
    } else {
      await addContent(finalValues)
      message.success('Content scheduled successfully')
    }
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleDelete = async (contentId, rowNumber) => {
    const result = await deleteContent(contentId, rowNumber)
    if (result.success) {
      message.success('Content deleted successfully')
    } else {
      message.error('Failed to delete content')
    }
  }

  const handleCampaignChange = (campaignId) => {
    if (!campaignId) return;
    const selectedCampaign = campaigns.find(c => c.campaign_id === campaignId);
    if (selectedCampaign) {
      const currentValues = form.getFieldsValue();
      const updates = {};
      
      if (!currentValues.title) {
        updates.title = `${selectedCampaign.campaign_name} Promotion`;
      }
      if (!currentValues.caption) {
        updates.caption = `Exciting updates from our ${selectedCampaign.campaign_name} campaign! 🚀 #MSME #Marketing`;
      }
      if (!currentValues.media_url && selectedCampaign.image_url) {
        updates.media_url = selectedCampaign.image_url;
      }

      if (Object.keys(updates).length > 0) {
        form.setFieldsValue(updates);
      }
      message.info(`Linked to campaign: ${selectedCampaign.campaign_name}`);
    }
  }

  const groupedContent = content.reduce((acc, item) => {
    const date = item.scheduled_date
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  const sortedDates = Object.keys(groupedContent).sort((a, b) => new Date(a) - new Date(b))

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
          icon={Calendar}
          label="Total Content"
          value={stats.total}
          gradient="purple"
        />
        <StatCard
          icon={Clock}
          label="Scheduled"
          value={stats.scheduled}
          gradient="blue"
        />
        <StatCard
          icon={MessageCircle}
          label="Posted"
          value={stats.posted}
          gradient="green"
        />
        <StatCard
          icon={Edit}
          label="Drafts"
          value={stats.draft}
          gradient="slate"
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Content Calendar</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 120 }}
            options={[
              { value: 'list', label: 'List View' },
              { value: 'calendar', label: 'Calendar View' },
            ]}
          />
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
          >
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Content List/Calendar */}
      {loading ? (
        <Skeleton variant="table" />
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedContent[date].map((item) => {
                  const PlatformIcon = platformIcons[item.platform]?.icon || MessageCircle
                  return (
                    <motion.div
                      key={item.content_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-xl border-l-4 ${platformColors[item.platform]} p-4 shadow-sm hover:shadow-md transition-all group`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${platformIcons[item.platform]?.color}`}>
                          <PlatformIcon className="w-4 h-4" />
                        </div>
                        <Badge status={item.status} size="sm" />
                      </div>
                      
                      <div className="flex gap-3 mb-3">
                        {item.media_url && (
                          <div 
                            className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 cursor-pointer group/img"
                            onClick={() => {
                              setPreviewImage(item.media_url)
                              setIsPreviewOpen(true)
                            }}
                          >
                            <img 
                              src={item.media_url} 
                              alt={item.title} 
                              className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{item.caption}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.scheduled_time}</span>
                        </div>
                        <div className="flex gap-2.5">
                          {item.media_url && (
                            <button
                              onClick={() => downloadImage(item.media_url, `${item.title}-content.jpg`)}
                              className="hover:text-blue-600 transition-colors"
                              title="Download Media (JPEG)"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(item)}
                            className="hover:text-purple-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <Popconfirm
                            title="Delete this content?"
                            onConfirm={() => handleDelete(item.content_id, item.row_number)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <button className="hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Popconfirm>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-500 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - date.getDay() + i)
              const dateStr = date.toISOString().split('T')[0]
              const dayContent = content.filter((c) => c.scheduled_date === dateStr)
              const isToday = dateStr === new Date().toISOString().split('T')[0]

              return (
                <div
                  key={i}
                  className={`min-h-[80px] md:min-h-[100px] p-2 rounded-lg border ${
                    isToday ? 'border-purple-400 bg-purple-50' : 'border-gray-100'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'font-bold text-purple-600' : 'text-gray-400'}`}>
                    {date.getDate()}
                  </span>
                  {dayContent.slice(0, 2).map((c) => (
                    <div
                      key={c.content_id}
                      className={`mt-1 text-[10px] p-1 rounded truncate ${
                        c.platform === 'WhatsApp' ? 'bg-green-100 text-green-700' :
                        c.platform === 'Instagram' ? 'bg-pink-100 text-pink-700' :
                        'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {c.title}
                    </div>
                  ))}
                  {dayContent.length > 2 && (
                    <span className="text-[10px] text-gray-400">+{dayContent.length - 2} more</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContent ? 'Edit Content' : 'Schedule New Content'}
        size="lg"
      >
        <div className="mb-6 flex gap-2 flex-wrap">
          <p className="w-full text-xs text-gray-400 mb-1 uppercase font-bold">Quick Fill Test Templates:</p>
          <Button size="small" onClick={() => form.setFieldsValue({ title: 'New Arrival Instagram', platform: 'Instagram', content_type: 'image', scheduled_date: '2024-06-01', scheduled_time: '18:00', caption: 'Check out our latest arrivals! 😍 #NewArrival #Summer2024' })}>
            Insta Post
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ title: 'B2B LinkedIn Update', platform: 'LinkedIn', content_type: 'text', scheduled_date: '2024-06-02', scheduled_time: '09:00', caption: 'We are proud to announce our new partnership. Looking forward to driving growth together!' })}>
            LinkedIn Post
          </Button>
          <Button size="small" onClick={() => form.setFieldsValue({ title: 'WhatsApp Promo', platform: 'WhatsApp', content_type: 'image', scheduled_date: '2024-06-01', scheduled_time: '12:00', caption: 'Flash sale alert! Get 50% off for the next 2 hours only.' })}>
            WhatsApp Alert
          </Button>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-4"
        >
          <Form.Item
            name="title"
            label="Content Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="e.g., Diwali Offer Post" size="large" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="platform"
              label="Platform"
              rules={[{ required: true, message: 'Please select platform' }]}
            >
              <Select placeholder="Select platform" size="large">
                <Select.Option value="WhatsApp">WhatsApp</Select.Option>
                <Select.Option value="Instagram">Instagram</Select.Option>
                <Select.Option value="Facebook">Facebook</Select.Option>
                <Select.Option value="LinkedIn">LinkedIn</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="content_type"
              label="Content Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select placeholder="Select type" size="large">
                <Select.Option value="image">Photo / Image</Select.Option>
                <Select.Option value="text">Text Only</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="scheduled_date"
              label="Scheduled Date"
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <Input type="date" size="large" />
            </Form.Item>
            <Form.Item
              name="scheduled_time"
              label="Scheduled Time"
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <Input type="time" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="campaign_id"
            label="Link to Campaign"
          >
            <Select 
              placeholder="Select campaign (optional)" 
              size="large" 
              allowClear
            >
              {campaigns.map((c) => (
                <Select.Option key={c.campaign_id} value={c.campaign_id}>
                  {c.campaign_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="caption"
            label="Caption/Message"
          >
            <Input.TextArea
              placeholder="Write your caption or message..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="media_url"
            label="Media URL"
          >
            <Input placeholder="Link to image/video (optional)" size="large" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="draft"
          >
            <Select size="large">
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="scheduled">Scheduled</Select.Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingContent ? 'Update Content' : 'Schedule Content'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Content Media Preview"
        size="lg"
      >
        <div className="flex flex-col items-center">
          <img 
            src={previewImage} 
            alt="Content Media" 
            className="w-full h-auto rounded-xl shadow-lg border border-gray-100 mb-6"
          />
          <div className="flex justify-center">
            <Button 
              type="primary" 
              icon={<Download className="w-4 h-4" />}
              onClick={() => {
                downloadImage(previewImage, 'content-media.jpg')
                setIsPreviewOpen(false)
              }}
              size="large"
              className="px-8 h-12 rounded-xl"
            >
              Download & View JPEG
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default ContentCalendar
