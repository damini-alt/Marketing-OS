import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Bell, RefreshCw, User } from 'lucide-react'
import { useStore } from '../../hooks/useStore'

const pageTitles = {
  '/': { title: 'Dashboard', description: 'Marketing overview & analytics' },
  '/campaigns': { title: 'Campaigns', description: 'Manage your marketing campaigns' },
  '/leads': { title: 'Leads', description: 'Track leads from all channels' },
  '/content': { title: 'Content Calendar', description: 'Plan & schedule content' },
  '/roi': { title: 'ROI Analytics', description: 'Track campaign performance' },
  '/broadcast': { title: 'Broadcast', description: 'Send WhatsApp broadcasts' },
  '/quotations': { title: 'Quotations', description: 'Generate & manage quotes' },
  '/field-sales': { title: 'Field Sales', description: 'Track rep visits & locations' },
  '/dealer-schemes': { title: 'Dealer Schemes', description: 'Manage cashback & discounts' },
  '/amc': { title: 'AMC & Renewals', description: 'Service contract renewals' },
  '/onboarding': { title: 'KYC Onboarding', description: 'B2B dealer onboarding' },
  '/testimonials': { title: 'Testimonials', description: 'Customer reviews & feedback' },
  '/settings': { title: 'Settings', description: 'Configure your dashboard' },
}

function Header() {
  const [isFocused, setIsFocused] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const location = useLocation()
  const { syncData, loading, notifications, markAsRead, markAllAsRead, profile } = useStore()
  const unreadNotifications = notifications.filter(n => !n.read)
  const currentPage = pageTitles[location.pathname] || { title: 'Dashboard', description: '' }

  const handleSync = async () => {
    await syncData(true)
  }

  return (
    <header className="sticky top-0 z-20 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between pl-5 py-4 pr-4 md:pr-8">
      {/* Title */}
      <div className="flex flex-col justify-center">
        <motion.h1
          key={currentPage.title}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-slate-900 leading-none mb-1"
        >
          {currentPage.title}
        </motion.h1>
        <p className="text-sm text-slate-500 font-medium leading-none hidden md:block">
          {currentPage.description}
        </p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={loading}
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary-50 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync</span>
        </button>

        {/* Search Bar - Desktop */}
        <div
          className={`hidden md:flex items-center gap-2.5 bg-slate-50 rounded-xl transition-all border ${
            isFocused
              ? 'w-80 border-primary-200 ring-4 ring-primary-50 bg-white'
              : 'w-64 border-transparent hover:border-slate-200'
          } h-10 px-3`}
        >
          <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-primary' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-sm"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-xl hover:bg-slate-50 transition-all text-slate-600 hover:text-primary"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            )}
          </button>

          {isNotificationOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <span className="text-xs font-bold text-primary bg-primary-50 px-2.5 py-1 rounded-full">
                  {unreadNotifications.length} New
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {unreadNotifications.length > 0 ? (
                  unreadNotifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                          n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                          n.type === 'error' ? 'bg-rose-50 text-rose-600' :
                          'bg-primary-50 text-primary'
                        }`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 mb-0.5">{n.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{n.time}</p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-500">All caught up!</p>
                  </div>
                )}
              </div>
              {unreadNotifications.length > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="w-full p-4 text-center text-xs font-bold text-primary hover:bg-primary-50 transition-colors border-t border-slate-50"
                >
                  Mark All as Read
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* User Avatar */}
        <Link to="/settings" className="flex items-center gap-3 pl-3 border-l border-slate-100 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center border border-primary-200">
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-bold text-slate-900">{profile.name}</p>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Marketing</p>
          </div>
        </Link>
      </div>
    </header>
  )
}

export default Header
