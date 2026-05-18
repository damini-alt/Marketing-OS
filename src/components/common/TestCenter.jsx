import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Megaphone, Users, TrendingUp, Calendar, Radio, RefreshCw, X, Play } from 'lucide-react';
import { Button, message, Tooltip } from 'antd';
import { useStore } from '../../hooks/useStore';

export default function TestCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const store = useStore.getState();

  const testOptions = [
    { id: 'campaign', name: 'WF1: Campaign', icon: Megaphone, color: 'purple', action: () => store.addCampaign({ campaign_name: 'Winter Festive Sale 2024', campaign_type: 'product', budget: 75000, start_date: new Date().toISOString().split('T')[0], end_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] }) },
    { id: 'lead', name: 'WF2: Lead', icon: Users, color: 'blue', action: () => store.addLead({ name: 'Rahul Sharma (Enquiry)', phone: '9812345678', email: 'rahul.s@outlook.com', source: 'WhatsApp' }) },
    { id: 'roi', name: 'WF3: ROI', icon: TrendingUp, color: 'green', action: () => store.calculateROI() },
    { id: 'content', name: 'WF4: Content', icon: Calendar, color: 'orange', action: () => store.addContent({ title: 'New Collection Post', platform: 'Instagram', content_type: 'image', scheduled_date: new Date().toISOString().split('T')[0] }) },
    { id: 'broadcast', name: 'WF5: Broadcast', icon: Radio, color: 'indigo', action: () => store.sendBroadcast({ segment: 'VIP Segment', message: 'Special Offer just for you!' }) },
    { id: 'sync', name: 'WF7: Sync', icon: RefreshCw, color: 'pink', action: () => store.syncData() },
  ];

  const handleRunTest = async (option) => {
    setLoading(true);
    try {
      const result = await option.action();
      if (result.success) {
        message.success(`${option.name} triggered successfully!`);
      } else {
        message.error(`${option.name} failed. Check settings.`);
      }
    } catch (error) {
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 w-64 mb-2"
          >
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Flow Testing Center</span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {testOptions.map((opt) => (
                <button
                  key={opt.id}
                  disabled={loading}
                  onClick={() => handleRunTest(opt)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-left group`}
                >
                  <div className={`p-2 rounded-lg bg-${opt.color}-50 text-${opt.color}-600 group-hover:scale-110 transition-transform`}>
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800 leading-none mb-1">{opt.name}</p>
                    <p className="text-[10px] text-gray-400">Run Pucho Automation</p>
                  </div>
                  <Play className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tooltip title={isOpen ? "Close Test Center" : "Open Flow Test Center"} placement="left">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isOpen ? 'bg-gray-800 rotate-90' : 'bg-purple-600 hover:bg-purple-700 hover:scale-110 shadow-purple-500/40'
          }`}
        >
          {isOpen ? <X className="w-6 h-6 text-white" /> : <Bug className="w-6 h-6 text-white" />}
        </button>
      </Tooltip>
    </div>
  );
}
