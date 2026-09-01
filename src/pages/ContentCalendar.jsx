import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Calendar, Clock, Instagram, Facebook, MessageCircle, Linkedin, Eye, Download, LayoutGrid, List, EyeIcon, MousePointerClick, Share2, MessageSquareText } from 'lucide-react'
import { Button, message, Card, Input, Select, Form, DatePicker, TimePicker, Popconfirm, Avatar, Tooltip, Modal as AntModal, Switch } from 'antd'
import dayjs from 'dayjs'
import StatCard from '../components/common/StatCard'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import { useStore } from '../hooks/useStore'
import { downloadImage } from '../utils/downloadUtils'
import QuickPresets from '../components/common/QuickPresets'

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
  const { content, campaigns, addContent, updateContent, deleteContent, loading, initialLoading } = useStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [selectedDateContent, setSelectedDateContent] = useState(null)
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
    const fields = { ...item }
    if (item.scheduled_date) {
      fields.scheduled_date = dayjs(item.scheduled_date)
    }
    if (item.scheduled_time) {
      fields.scheduled_time = dayjs(item.scheduled_time, 'HH:mm')
    }
    form.setFieldsValue(fields)
    setIsModalOpen(true)
  }

  const handleSubmit = async (values) => {
    let finalValues = { ...values }
    if (finalValues.scheduled_date && dayjs.isDayjs(finalValues.scheduled_date)) {
      finalValues.scheduled_date = finalValues.scheduled_date.format('YYYY-MM-DD')
    }
    if (finalValues.scheduled_time && dayjs.isDayjs(finalValues.scheduled_time)) {
      finalValues.scheduled_time = finalValues.scheduled_time.format('HH:mm')
    }
    
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
            style={{ width: 160 }}
            options={[
              { value: 'list', label: <span className="flex items-center gap-2"><List className="w-4 h-4" />List View</span> },
              { value: 'grid', label: <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" />Grid View</span> },
              { value: 'calendar', label: <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />Calendar View</span> },
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

      {/* Content List / Grid / Calendar */}
      {initialLoading ? (
        <Skeleton variant="table" />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedDates.map((date) =>
            groupedContent[date].map((item) => {
              const PlatformIcon = platformIcons[item.platform]?.icon || MessageCircle
              return (
                <motion.div
                  key={item.content_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  {item.media_url ? (
                    <div
                      className="relative h-40 bg-gray-100 cursor-pointer overflow-hidden"
                      onClick={() => { setPreviewImage(item.media_url); setIsPreviewOpen(true) }}
                    >
                      <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${item.status === 'posted' ? 'bg-green-500/90 text-white' : item.status === 'scheduled' ? 'bg-purple-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <div className={`p-4 rounded-full ${platformIcons[item.platform]?.color}`}>
                        <PlatformIcon className="w-8 h-8" />
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${platformIcons[item.platform]?.color}`}>
                        {item.platform}
                      </div>
                      <span className="text-[10px] text-gray-400">{item.scheduled_time}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{item.title}</h4>
                    {item.caption && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{item.caption}</p>
                    )}
                    {item.description && (
                      <Tooltip title={item.description}>
                        <p className="text-[10px] text-gray-400 line-clamp-1 mb-3 italic">{item.description}</p>
                      </Tooltip>
                    )}
                    {(item.views || item.clicks || item.shares || item.comments) && (
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3 flex-wrap">
                        <Tooltip title="Views"><span className="flex items-center gap-0.5"><EyeIcon className="w-3 h-3" />{item.views || 0}</span></Tooltip>
                        <Tooltip title="Clicks"><span className="flex items-center gap-0.5"><MousePointerClick className="w-3 h-3" />{item.clicks || 0}</span></Tooltip>
                        <Tooltip title="Shares"><span className="flex items-center gap-0.5"><Share2 className="w-3 h-3" />{item.shares || 0}</span></Tooltip>
                        <Tooltip title="Comments"><span className="flex items-center gap-0.5"><MessageSquareText className="w-3 h-3" />{item.comments || 0}</span></Tooltip>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <div className="flex gap-1.5">
                        {item.media_url && (
                          <button onClick={() => downloadImage(item.media_url, `${item.title}-content.jpg`)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleEdit(item)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-purple-600 transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <Popconfirm title="Delete this content?" onConfirm={() => handleDelete(item.content_id, item.row_number)} okText="Yes" cancelText="No">
                          <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Calendar Header with DatePicker Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              {calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <DatePicker
                value={dayjs(calendarMonth)}
                onChange={(val) => {
                  if (val) setCalendarMonth(val.toDate())
                }}
                size="small"
                className="rounded-lg flex-1 sm:flex-none"
                allowClear={false}
                format="DD/MM/YYYY"
                placeholder="Pick a date"
              />
              <Button
                size="small"
                onClick={() => setCalendarMonth(new Date())}
                className="rounded-lg"
              >
                Today
              </Button>
            </div>
          </div>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 bg-gray-50 rounded-lg">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {(() => {
              const year = calendarMonth.getFullYear()
              const month = calendarMonth.getMonth()
              const firstDay = new Date(year, month, 1).getDay()
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              const today = new Date().toISOString().split('T')[0]
              const cells = []

              for (let i = 0; i < firstDay; i++) {
                cells.push(<div key={`empty-${i}`} className="min-h-[90px] md:min-h-[110px] p-1 rounded-lg border border-transparent" />)
              }

              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day)
                const dateStr = date.toISOString().split('T')[0]
                const dayContent = content.filter((c) => c.scheduled_date === dateStr)
                const isToday = dateStr === today

                cells.push(
                  <div
                    key={day}
                    className={`min-h-[90px] md:min-h-[110px] p-2 rounded-lg border cursor-pointer transition-all ${
                      isToday
                        ? 'border-purple-400 bg-purple-50 hover:bg-purple-100'
                        : dayContent.length > 0
                          ? 'border-blue-200 bg-blue-50/60 hover:bg-blue-100'
                          : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => dayContent.length > 0 && setSelectedDateContent({ date: dateStr, items: dayContent })}
                  >
                    <span className={`text-xs font-medium flex items-center gap-1 ${
                      isToday ? 'text-purple-600 font-bold' : dayContent.length > 0 ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {dayContent.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />}
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayContent.slice(0, 3).map((c) => (
                        <Tooltip key={c.content_id} title={c.title}>
                          <div
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer ${
                              c.platform === 'WhatsApp' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              c.platform === 'Instagram' ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' :
                              c.platform === 'Facebook' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                              'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            }`}
                          >
                            {c.scheduled_time ? `${c.scheduled_time.slice(0, 5)} ` : ''}{c.title}
                          </div>
                        </Tooltip>
                      ))}
                      {dayContent.length > 3 && (
                        <span className="text-[10px] text-gray-400 block text-center">+{dayContent.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )
              }
              return cells
            })()}
          </div>
        </div>
      ) : (
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

                      {item.description && (
                        <Tooltip title={item.description}>
                          <p className="text-xs text-gray-400 line-clamp-1 mb-3 italic">{item.description}</p>
                        </Tooltip>
                      )}

                      {(item.views || item.clicks || item.shares || item.comments) && (
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3 flex-wrap">
                          <Tooltip title="Views">
                            <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3" />{(item.views || 0).toLocaleString()}</span>
                          </Tooltip>
                          <Tooltip title="Clicks">
                            <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" />{(item.clicks || 0).toLocaleString()}</span>
                          </Tooltip>
                          <Tooltip title="Shares">
                            <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{(item.shares || 0).toLocaleString()}</span>
                          </Tooltip>
                          <Tooltip title="Comments">
                            <span className="flex items-center gap-1"><MessageSquareText className="w-3 h-3" />{(item.comments || 0).toLocaleString()}</span>
                          </Tooltip>
                        </div>
                      )}

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
      )}

      {/* Calendar Date Detail Modal */}
      <Modal
        isOpen={!!selectedDateContent}
        onClose={() => setSelectedDateContent(null)}
        title={selectedDateContent ? `Content for ${new Date(selectedDateContent.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
        size="lg"
      >
        <div className="space-y-3">
          {selectedDateContent?.items.map((item) => (
            <div key={item.content_id} className={`bg-white border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all ${platformColors[item.platform] ? `border-l-4 ${platformColors[item.platform]}` : ''}`}>
              {item.media_url ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => { setPreviewImage(item.media_url); setIsPreviewOpen(true); setSelectedDateContent(null) }}>
                  <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center ${platformIcons[item.platform]?.color}`}>
                  {(() => { const PI = platformIcons[item.platform]?.icon || MessageCircle; return <PI className="w-6 h-6" /> })()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  <Badge status={item.status} size="sm" />
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-1">{item.caption}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.scheduled_time}</span>
                  <span>{item.platform}</span>
                  {item.content_type && <span>{item.content_type}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="small" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => { setPreviewImage(item.media_url); setIsPreviewOpen(true); setSelectedDateContent(null) }} disabled={!item.media_url} />
                <Button size="small" icon={<Edit className="w-3.5 h-3.5" />} onClick={() => { handleEdit(item); setSelectedDateContent(null) }} />
              </div>
            </div>
          ))}
          {(!selectedDateContent || selectedDateContent.items.length === 0) && (
            <p className="text-center text-gray-400 py-8">No content scheduled for this date</p>
          )}
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContent ? 'Edit Content' : 'Schedule New Content'}
        size="lg"
      >
        <QuickPresets type="content" form={form} />
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
              <DatePicker
                size="large"
                className="w-full rounded-xl"
                placeholder="Select date"
                format="DD/MM/YYYY"
              />
            </Form.Item>
            <Form.Item
              name="scheduled_time"
              label="Scheduled Time"
              rules={[{ required: true, message: 'Please select time' }]}
            >
              <TimePicker
                size="large"
                className="w-full rounded-xl"
                placeholder="Select time"
                format="HH:mm"
                minuteStep={15}
              />
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
            name="description"
            label="Description"
          >
            <Input.TextArea
              placeholder="Add detailed description, notes, or objectives for this content..."
              rows={2}
              showCount
              maxLength={300}
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
              <Select.Option value="posted">Posted</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="auto_publish"
            label="Auto Publish"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch
              checkedChildren="Auto-publish enabled"
              unCheckedChildren="Manual publish"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4">
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
