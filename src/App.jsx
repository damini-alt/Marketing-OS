import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import MobileNav from './components/layout/MobileNav'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import Leads from './pages/Leads'
import ContentCalendar from './pages/ContentCalendar'
import ROI from './pages/ROI'
import Broadcast from './pages/Broadcast'
import Settings from './pages/Settings'
import Login from './pages/Login'
import DealerSchemes from './pages/DealerSchemes'
import Quotations from './pages/Quotations'
import FieldSales from './pages/FieldSales'
import AMC from './pages/AMC'
import Onboarding from './pages/Onboarding'
import Testimonials from './pages/Testimonials'
import CardsGrid from './pages/brand-dna/CardsGrid'
import DNADetailView from './pages/brand-dna/DNADetailView'
import CampaignIdeas from './pages/brand-dna/CampaignIdeas'
import GenerateCreatives from './pages/brand-dna/GenerateCreatives'
import BrandDNALayout from './pages/brand-dna/BrandDNALayout'
import CompetitorAnalysis from './pages/brand-dna/CompetitorAnalysis'
import SmartImageResizzer from './pages/brand-dna/SmartImageResizzer'
import MyHistory from './pages/brand-dna/MyHistory'
import AccessDenied from './pages/AccessDenied'
import { BrandProvider } from './context/BrandContext'
import { useStore } from './hooks/useStore'

// Access Route Guard
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem('userRole') || 'admin';
  if (role === 'executive') {
    return <AccessDenied />;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuth') === 'true')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { initializeData, syncData, processAutoPublish } = useStore()

  useEffect(() => {
    if (isAuthenticated) {
      initializeData()
    }
  }, [initializeData, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return

    // Background polling: sync data from Google Sheets every 10 seconds silently
    const intervalId = setInterval(() => {
      syncData(false, true).catch(err => console.error("Auto-sync error:", err))
    }, 10000)

    // Auto-publish check every 30 seconds
    const publishInterval = setInterval(() => {
      processAutoPublish().catch(err => console.error("Auto-publish error:", err))
    }, 30000)

    return () => {
      clearInterval(intervalId)
      clearInterval(publishInterval)
    }
  }, [isAuthenticated, syncData, processAutoPublish])

  return (
    <BrandProvider>
      {!isAuthenticated ? (
        <Login onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
          </div>

          {/* Main Content */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
            {/* Header */}
            <Header />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/content" element={<AdminRoute><ContentCalendar /></AdminRoute>} />
                  <Route path="/roi" element={<AdminRoute><ROI /></AdminRoute>} />
                  <Route path="/broadcast" element={<AdminRoute><Broadcast /></AdminRoute>} />
                  <Route path="/quotations" element={<AdminRoute><Quotations /></AdminRoute>} />
                  <Route path="/field-sales" element={<AdminRoute><FieldSales /></AdminRoute>} />
                  <Route path="/dealer-schemes" element={<AdminRoute><DealerSchemes /></AdminRoute>} />
                  <Route path="/amc" element={<AdminRoute><AMC /></AdminRoute>} />
                  <Route path="/onboarding" element={<AdminRoute><Onboarding /></AdminRoute>} />
                  <Route path="/testimonials" element={<AdminRoute><Testimonials /></AdminRoute>} />
                  <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />

                  {/* Brand DNA Hub Routes */}
                  <Route path="/brand-dna" element={<AdminRoute><BrandDNALayout /></AdminRoute>}>
                    <Route index element={<CardsGrid />} />
                    <Route path="ideas" element={<CampaignIdeas />} />
                    <Route path="creatives" element={<GenerateCreatives />} />
                    <Route path="competitor" element={<CompetitorAnalysis />} />
                    <Route path="image-resizer" element={<SmartImageResizzer />} />
                    <Route path="resizer-history" element={<MyHistory />} />
                  </Route>
                  <Route path="/brand-dna/dna/:brandName" element={<AdminRoute><DNADetailView /></AdminRoute>} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      )}

      {/* Global Powered By Badge */}
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none select-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-2 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(139,92,246,0.15)] border border-white/50"
        >
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
            Powered By
          </span>
          <img 
            src="https://cdn.prod.website-files.com/690ec911550adb97c4a56495/69399fa4c6253325791cd9ce_pucho%20logo.webp" 
            alt="Pucho.ai" 
            className="h-4 w-auto object-contain"
          />
        </motion.div>
      </div>
    </BrandProvider>
  )
}

export default App
