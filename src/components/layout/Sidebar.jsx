import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Calendar,
  TrendingUp,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  FileText,
  MapPin,
  Award,
  Shield,
  Repeat,
  FileCheck,
  MessageSquare,
} from 'lucide-react'
import logo from '../../assests/logo.png'

const menuItems = [
  { id: '/', name: 'Dashboard', icon: LayoutDashboard },
  { id: '/campaigns', name: 'Campaigns', icon: Megaphone },
  { id: '/leads', name: 'Leads', icon: Users },
  { id: '/content', name: 'Content', icon: Calendar },
  { id: '/roi', name: 'ROI Analytics', icon: TrendingUp },
  { id: '/broadcast', name: 'Broadcast', icon: Radio },
  { id: '/quotations', name: 'Quotations', icon: FileText },
  { id: '/field-sales', name: 'Field Sales', icon: MapPin },
  { id: '/dealer-schemes', name: 'Dealer Schemes', icon: Award },
  { id: '/amc', name: 'AMC & Renewals', icon: Shield },
  { id: '/onboarding', name: 'Onboarding', icon: FileCheck },
  { id: '/testimonials', name: 'Testimonials', icon: MessageSquare },
  { id: '/settings', name: 'Settings', icon: Settings },
]

function Sidebar({ collapsed, onCollapse }) {
  const location = useLocation()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100/80 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-gray-100/50 overflow-hidden ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex items-center flex-shrink-0 h-8">
          <img src={logo} alt="Logo" className={`object-contain transition-all duration-300 ${collapsed ? 'w-12' : 'w-28'}`} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.id
          return (
            <NavLink
              key={item.id}
              to={item.id}
              className={`relative flex items-center gap-3 h-12 rounded-xl px-4 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white shadow-soft'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : ''}`} />
              {!collapsed && <span className="relative z-10 truncate">{item.name}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col mt-auto pb-4 px-4 space-y-1.5">
        <button
          onClick={() => onCollapse(!collapsed)}
          className="h-10 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all border border-slate-100"
          title="Collapse"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider font-semibold">Collapse</span>
            </>
          )}
        </button>

        <button
          onClick={() => { localStorage.removeItem('isAuth'); window.location.reload(); }}
          className={`h-12 rounded-xl flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium text-sm ${collapsed ? 'justify-center px-0' : 'px-4'}`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
