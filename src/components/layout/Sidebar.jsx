import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dropdown } from 'antd'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Calendar,
  BarChart3,
  Radio,
  FileText,
  MapPin,
  Tag,
  ShieldCheck,
  UserCheck,
  Star,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Lock,
  Dna,
  Palette,
  Target,
  Image,
  History,
  ChevronDown,
} from 'lucide-react'
import logo from '../../assests/logo.png'
import mascot1 from '../../assets/mascot_1.png'

const menuItems = [
  { id: '/', name: 'Dashboard', icon: LayoutDashboard },
  { id: '/campaigns', name: 'Campaigns', icon: Megaphone },
  { id: '/leads', name: 'Leads', icon: Users },
  { id: '/content', name: 'Content Calendar', icon: Calendar },
  { id: '/roi', name: 'ROI Analytics', icon: BarChart3 },
  { id: '/broadcast', name: 'Broadcast', icon: Radio },
  { id: '/quotations', name: 'Quotations', icon: FileText },
  { id: '/field-sales', name: 'Field Sales', icon: MapPin },
  { id: '/dealer-schemes', name: 'Dealer Schemes', icon: Tag },
  { id: '/amc', name: 'AMC', icon: ShieldCheck },
  { id: '/onboarding', name: 'Onboarding', icon: UserCheck },
  { id: '/testimonials', name: 'Testimonials', icon: Star },
  { id: '/brand-dna', name: 'Brand DNA', icon: Dna },
  { id: '/settings', name: 'Admin Panel', icon: SettingsIcon },
]

const brandDnaSubItems = [
  { id: '/brand-dna', name: 'DNA Hub', icon: Dna },
  { id: '/brand-dna/ideas', name: 'Campaign Ideas', icon: Megaphone },
  { id: '/brand-dna/creatives', name: 'Creative Gen', icon: Palette },
  { id: '/brand-dna/competitor', name: 'Competitor Analysis', icon: Target },
  { id: '/brand-dna/image-resizer', name: 'Image Resizer', icon: Image },
  { id: '/brand-dna/resizer-history', name: 'Resizer History', icon: History },
]

function Sidebar({ collapsed, onCollapse }) {
  const location = useLocation()
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole') || 'admin'
  const userEmail = localStorage.getItem('adminEmail') || 'admin@pucho.ai'

  const [brandDnaOpen, setBrandDnaOpen] = useState(location.pathname.startsWith('/brand-dna'))

  useEffect(() => {
    if (location.pathname.startsWith('/brand-dna')) {
      setBrandDnaOpen(true)
    }
  }, [location.pathname])

  const handleDropdownClick = ({ key }) => {
    const paths = {
      'dna-hub': '/brand-dna',
      'ideas': '/brand-dna/ideas',
      'creatives': '/brand-dna/creatives',
      'competitor': '/brand-dna/competitor',
      'image-resizer': '/brand-dna/image-resizer',
      'resizer-history': '/brand-dna/resizer-history',
    };
    const targetPath = paths[key];
    if (targetPath) {
      navigate(targetPath);
    }
  };

  const brandDnaDropdownItems = [
    { key: 'dna-hub', label: <Link to="/brand-dna" className="font-semibold text-slate-700 hover:text-[#7C4DFF] block px-1 py-0.5">DNA Hub</Link>, icon: <Dna className="w-4 h-4 text-[#7C4DFF]" /> },
    { key: 'ideas', label: <Link to="/brand-dna/ideas" className="font-semibold text-slate-700 hover:text-[#7C4DFF] block px-1 py-0.5">Campaign Ideas</Link>, icon: <Megaphone className="w-4 h-4 text-[#7C4DFF]" /> },
    { key: 'creatives', label: <Link to="/brand-dna/creatives" className="font-semibold text-slate-700 hover:text-[#7C4DFF] block px-1 py-0.5">Creative Gen</Link>, icon: <Palette className="w-4 h-4 text-[#7C4DFF]" /> },
    { key: 'competitor', label: <Link to="/brand-dna/competitor" className="font-semibold text-slate-700 hover:text-[#7C4DFF] block px-1 py-0.5">Competitor Analysis</Link>, icon: <Target className="w-4 h-4 text-[#7C4DFF]" /> },
    { key: 'image-resizer', label: <Link to="/brand-dna/image-resizer" className="font-semibold text-slate-700 hover:text-[#7C4DFF] block px-1 py-0.5">Image Resizer</Link>, icon: <Image className="w-4 h-4 text-[#7C4DFF]" /> },
    { key: 'resizer-history', label: <Link to="/brand-dna/resizer-history" className="font-semibold text-slate-700 hover:text-[#7C4DFF] block px-1 py-0.5">Resizer History</Link>, icon: <History className="w-4 h-4 text-[#7C4DFF]" /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100/80 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`h-16 flex items-center border-b border-gray-100/50 overflow-hidden ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src={logo} alt="Logo" className={`object-contain transition-all duration-300 ${collapsed ? 'w-12 h-8' : 'h-8'}`} />
          {!collapsed && (
            <div className="flex flex-col text-slate-900 font-bold leading-[1.1] text-xs">
              <span className="text-sm font-semibold tracking-tight text-slate-800">Marketing</span>
              <span className="text-sm font-semibold tracking-tight text-slate-800">OS</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-3 px-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.id || 
            (item.id === '/brand-dna' && location.pathname.startsWith('/brand-dna'))
          const isRestricted = userRole === 'executive' && item.id !== '/leads' && item.id !== '/campaigns'
          
          const navLinkContent = (
            <>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #6B3FE8 100%)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={`w-[18px] h-[18px] relative z-10 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              {!collapsed && <span className="relative z-10 truncate">{item.name}</span>}
              {isActive && item.badge && !collapsed && (
                <span className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
              {isRestricted && !collapsed && <Lock className="w-3.5 h-3.5 text-slate-300 ml-auto relative z-10" />}
            </>
          )

          if (item.id === '/brand-dna') {
            if (collapsed) {
              return (
                <Dropdown
                  key={item.id}
                  menu={{ 
                    items: brandDnaDropdownItems,
                    onClick: handleDropdownClick
                  }}
                  trigger={['hover', 'click']}
                  placement="rightStart"
                  overlayClassName="brand-dna-sidebar-dropdown"
                >
                  <div
                    className={`relative flex items-center justify-center h-11 rounded-xl px-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-white shadow-[0_8px_24px_-8px_rgba(124,77,255,0.6)]'
                        : isRestricted
                        ? 'text-slate-400/70 hover:text-slate-500 hover:bg-slate-50/50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #7C4DFF 0%, #6B3FE8 100%)' } : {}}
                  >
                    <item.icon className={`w-[18px] h-[18px] relative z-10 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                  </div>
                </Dropdown>
              )
            }

            return (
              <div key={item.id} className="flex flex-col">
                <div
                  onClick={() => {
                    if (!brandDnaOpen) {
                      navigate('/brand-dna')
                    }
                    setBrandDnaOpen(!brandDnaOpen)
                  }}
                  className={`relative flex items-center justify-between h-11 rounded-xl px-4 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white shadow-[0_8px_24px_-8px_rgba(124,77,255,0.6)]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  style={isActive ? { background: 'linear-gradient(135deg, #7C4DFF 0%, #6B3FE8 100%)' } : {}}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #7C4DFF 0%, #6B3FE8 100%)' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="flex items-center gap-3 relative z-10 min-w-0">
                    <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 relative z-10 transition-transform duration-200 ${
                      brandDnaOpen ? 'rotate-180' : ''
                    } ${isActive ? 'text-white' : 'text-slate-400'}`}
                  />
                </div>

                <AnimatePresence initial={false}>
                  {brandDnaOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-4 pl-3 border-l-2 border-purple-100 space-y-1 my-1.5 overflow-hidden"
                    >
                      {brandDnaSubItems.map((subItem) => {
                        const isSubActive = location.pathname === subItem.id
                        return (
                          <NavLink
                            key={subItem.id}
                            to={subItem.id}
                            className={`flex items-center gap-2.5 h-9 rounded-lg px-3 text-xs font-medium transition-all duration-150 ${
                              isSubActive
                                ? 'text-[#7C4DFF] bg-purple-50 font-semibold border border-purple-100/80 shadow-xs'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                          >
                            <subItem.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSubActive ? 'text-[#7C4DFF]' : 'text-slate-400'}`} />
                            <span className="truncate">{subItem.name}</span>
                          </NavLink>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          }

          return (
            <NavLink
              key={item.id}
              to={item.id}
              className={`relative flex items-center gap-3 h-11 rounded-xl px-4 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white shadow-[0_8px_24px_-8px_rgba(124,77,255,0.6)]'
                  : isRestricted
                  ? 'text-slate-400/70 hover:text-slate-500 hover:bg-slate-50/50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, #7C4DFF 0%, #6B3FE8 100%)' } : {}}
            >
              {navLinkContent}
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col mt-auto pb-4 px-4 space-y-1.5">
        {/* Collapse Button */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className={`h-10 rounded-xl flex items-center gap-3 text-slate-400 hover:text-slate-600 transition-all ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
          title="Collapse"
        >
          {collapsed ? (
            <ChevronsRight className="w-5 h-5 text-slate-400" />
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500 font-medium">Collapse</span>
            </>
          )}
        </button>

        {/* Log out Button */}
        <button
          onClick={() => {
            localStorage.removeItem('isAuth');
            localStorage.removeItem('userRole');
            localStorage.removeItem('adminName');
            localStorage.removeItem('adminEmail');
            window.location.reload();
          }}
          className={`h-12 rounded-xl flex items-center gap-3 text-red-600 hover:text-red-700 hover:bg-red-50/50 transition-all font-medium text-sm ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
          title="Log out"
        >
          <LogOut className="w-5 h-5 flex-shrink-0 text-red-600" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        {/* Divider */}
        <div className="border-t border-slate-100 my-2" />

        {/* Profile */}
        <div
          className={`flex items-center gap-3 py-1 ${
            collapsed ? 'justify-center px-0' : 'px-4'
          }`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-purple-100 bg-purple-50">
            <img
              src={mascot1}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 truncate">Super Admin</span>
              <span className="text-xs text-slate-400 truncate">{userEmail}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
