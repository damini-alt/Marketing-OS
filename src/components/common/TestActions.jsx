import { Button, Tooltip, message } from 'antd';
import { Megaphone, Users, TrendingUp, Calendar, Radio, RefreshCw } from 'lucide-react';
import { useStore } from '../../hooks/useStore';

export default function TestActions() {
  const store = useStore.getState();

  const handleTestFlow = async (type) => {
    message.loading({ content: `Triggering WF: ${type}...`, key: 'testFlow' });
    let result = { success: false };
    
    try {
      switch (type) {
        case 'WF1': result = await store.addCampaign({ campaign_name: 'Winter Festive Sale 2024', campaign_type: 'product', budget: 75000, start_date: new Date().toISOString().split('T')[0], end_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0] }); break;
        case 'WF2': result = await store.addLead({ name: 'Rahul Sharma (Business Enquiry)', phone: '9812345678', email: 'rahul.s@outlook.com', source: 'WhatsApp' }); break;
        case 'WF3': result = await store.calculateROI(); break;
        case 'WF4': result = await store.addContent({ title: 'New Arrival Instagram Reel', platform: 'Instagram', content_type: 'video', scheduled_date: new Date().toISOString().split('T')[0] }); break;
        case 'WF5': result = await store.sendBroadcast({ segment: 'VIP Customers', message: 'Hello! Exclusive 20% discount for you. Use code VIP20 at checkout.' }); break;
        case 'WF7': result = await store.syncData(); break;
      }
      if (result.success) message.success({ content: `WF: ${type} successful!`, key: 'testFlow' });
      else message.error({ content: `WF: ${type} failed.`, key: 'testFlow' });
    } catch (e) { 
      message.error({ content: `Error: ${e.message}`, key: 'testFlow' }); 
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100 mr-2">
      <Tooltip title="Test Campaign (WF1)"><Button size="small" className="text-[10px] h-8 px-2 flex items-center gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50" onClick={() => handleTestFlow('WF1')}><Megaphone className="w-3.5 h-3.5" />WF1</Button></Tooltip>
      <Tooltip title="Test Lead (WF2)"><Button size="small" className="text-[10px] h-8 px-2 flex items-center gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleTestFlow('WF2')}><Users className="w-3.5 h-3.5" />WF2</Button></Tooltip>
      <Tooltip title="Test ROI (WF3)"><Button size="small" className="text-[10px] h-8 px-2 flex items-center gap-1.5 border-green-200 text-green-600 hover:bg-green-50" onClick={() => handleTestFlow('WF3')}><TrendingUp className="w-3.5 h-3.5" />WF3</Button></Tooltip>
      <Tooltip title="Test Content (WF4)"><Button size="small" className="text-[10px] h-8 px-2 flex items-center gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => handleTestFlow('WF4')}><Calendar className="w-3.5 h-3.5" />WF4</Button></Tooltip>
      <Tooltip title="Test Broadcast (WF5)"><Button size="small" className="text-[10px] h-8 px-2 flex items-center gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50" onClick={() => handleTestFlow('WF5')}><Radio className="w-3.5 h-3.5" />WF5</Button></Tooltip>
      <Tooltip title="Force Sync (WF7)"><Button size="small" className="text-[10px] h-8 px-2 flex items-center gap-1.5 border-pink-200 text-pink-600 hover:bg-pink-50" onClick={() => handleTestFlow('WF7')}><RefreshCw className="w-3.5 h-3.5" />WF7</Button></Tooltip>
    </div>
  );
}
