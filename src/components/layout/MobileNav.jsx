import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Calendar,
  TrendingUp,
  Radio,
  Settings,
} from 'lucide-react'

const mobileNavItems = [
  { id: '/', name: 'Home', icon: LayoutDashboard },
  { id: '/campaigns', name: 'Campaigns', icon: Megaphone },
  { id: '/leads', name: 'Leads', icon: Users },
  { id: '/content', name: 'Content', icon: Calendar },
  { id: '/roi', name: 'ROI', icon: TrendingUp },
  { id: '/broadcast', name: 'Broadcast', icon: Radio },
  { id: '/settings', name: 'Settings', icon: Settings },
]

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around py-2 px-1">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.id}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-2 rounded-lg transition-all ${
                isActive
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : ''}`} />
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"
                    />
                  )}
                </motion.div>
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default MobileNav
