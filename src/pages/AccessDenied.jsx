import React from 'react'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function AccessDenied() {
  const navigate = useNavigate()

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#f8f9fc]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-red-100 rounded-3xl p-8 shadow-[0_20px_50px_rgba(239,68,68,0.05)] text-center"
      >
        {/* Glow Lock Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <ShieldAlert className="w-8 h-8 text-red-500 relative z-10 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Access Required</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Your current role <strong>(Marketing Executive)</strong> does not have permission to access this module. Please contact your system administrator or switch to an administrator account.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all font-medium text-xs flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Leads
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem('isAuth');
              localStorage.removeItem('userRole');
              localStorage.removeItem('adminName');
              localStorage.removeItem('adminEmail');
              window.location.reload();
            }}
            className="flex-1 h-11 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-red-200"
          >
            <LogOut className="w-4 h-4" />
            Switch Account
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default AccessDenied
