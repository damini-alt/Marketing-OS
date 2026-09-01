import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Dropdown } from 'antd'
import { ChevronDown, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react'
import mascot1 from '../../assets/mascot_1.png'

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
  '/customer-analysis': { title: 'Sentiment Analysis', description: 'Positive, neutral & negative customer sentiment' },
}

function Header() {
  const location = useLocation()
  const currentPage = pageTitles[location.pathname] || { title: 'Dashboard', description: '' }
  const userName = localStorage.getItem('adminName') || 'Super Admin'
  const userEmail = localStorage.getItem('adminEmail') || 'admin@pucho.ai'

  const menuItems = [
    { key: 'profile', icon: UserIcon, label: 'Profile' },
    { key: 'settings', icon: SettingsIcon, label: 'Settings' },
    { type: 'divider' },
    { key: 'logout', icon: LogOut, label: 'Sign Out', danger: true },
  ]

  const dropdownItems = menuItems
    .filter((i) => !i.type)
    .map((item) => ({
      key: item.key,
      label: (
        <div className={`flex items-center gap-2 px-1 py-1 text-sm font-medium ${item.danger ? 'text-red-600' : 'text-slate-700'}`}>
          <item.icon className="w-4 h-4" />
          {item.label}
        </div>
      ),
    }))

  return (
    <header className="sticky top-0 z-20 w-full bg-white/85 backdrop-blur-xl border-b border-slate-100/80 flex items-center justify-between pl-5 py-3 pr-4 md:pr-6">
      {/* Title */}
      <div className="flex flex-col justify-center">
        <motion.h1
          key={currentPage.title}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-slate-900 leading-none mb-1.5"
        >
          {currentPage.title}
        </motion.h1>
        <p className="text-[13px] text-slate-500 font-medium leading-none hidden md:block">
          {currentPage.description}
        </p>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Live</span>
        </div>

        {/* Avatar Dropdown */}
        <Dropdown menu={{ items: dropdownItems }} trigger={['click']} placement="bottomRight">
          <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
            <img src={mascot1} alt={userName} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-[13px] font-semibold text-slate-800">{userName}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{userEmail}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>
        </Dropdown>
      </div>
    </header>
  )
}

export default Header
