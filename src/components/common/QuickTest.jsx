import React from 'react';
import { Button, Tooltip, Space } from 'antd';
import { Zap, Send, Play } from 'lucide-react';

const QuickTest = ({ type, onTest }) => {
  const getSamples = () => {
    switch (type) {
      case 'campaign':
        return [
          { label: 'Sale Test', data: { campaign_name: 'Summer Sale 2024', campaign_type: 'product', start_date: '2024-06-01', end_date: '2024-06-30', budget: 50000, channels: ['Instagram', 'Facebook'], target_audience: 'Fashion enthusiasts' } },
          { label: 'Brand Test', data: { campaign_name: 'Brand Awareness Q3', campaign_type: 'branding', start_date: '2024-07-01', end_date: '2024-09-30', budget: 100000, channels: ['Google Ads', 'YouTube'], target_audience: 'New customers' } },
          { label: 'Holiday Test', data: { campaign_name: 'Diwali Special', campaign_type: 'product', start_date: '2024-10-20', end_date: '2024-11-15', budget: 200000, channels: ['WhatsApp', 'Instagram'], target_audience: 'Existing customers' } }
        ];
      case 'lead':
        return [
          { label: 'Retail Lead', data: { full_name: 'Anil Kumar', email: 'anil@example.com', phone: '+91 98765 43210', source: 'Instagram', status: 'new', revenue: 0 } },
          { label: 'B2B Lead', data: { full_name: 'Suresh Traders', email: 'suresh@traders.com', phone: '+91 91234 56789', source: 'Google Ads', status: 'qualified', revenue: 50000 } },
          { label: 'Wholesale Lead', data: { full_name: 'Global Exports', email: 'info@global.com', phone: '+91 88888 77777', source: 'WhatsApp', status: 'negotiation', revenue: 200000 } }
        ];
      case 'content':
        return [
          { label: 'Insta Post', data: { title: 'Product Showcase', platform: 'Instagram', content_type: 'image', scheduled_date: '2024-05-20', scheduled_time: '18:00', caption: 'Check out our latest collection! 🌟 #NewArrivals' } },
          { label: 'FB Video', data: { title: 'Behind the Scenes', platform: 'Facebook', content_type: 'video', scheduled_date: '2024-05-21', scheduled_time: '12:00', caption: 'How we make our products... 🛠️ #Craftsmanship' } },
          { label: 'WA Update', data: { title: 'Flash Sale Alert', platform: 'WhatsApp', content_type: 'image', scheduled_date: '2024-05-19', scheduled_time: '10:00', caption: 'Flash Sale starts now! ⚡ Shop here: link' } }
        ];
      case 'broadcast':
        return [
          { label: 'Promo BC', data: { name: 'Weekend Discount', audience: 'All Customers', template_name: 'weekend_sale', status: 'scheduled', scheduled_date: '2024-05-25', scheduled_time: '09:00' } },
          { label: 'New Arrival BC', data: { name: 'New Inventory Launch', audience: 'VIP Customers', template_name: 'new_launch', status: 'scheduled', scheduled_date: '2024-05-22', scheduled_time: '11:00' } },
          { label: 'Reminder BC', data: { name: 'Follow-up Reminder', audience: 'Leads', template_name: 'lead_followup', status: 'scheduled', scheduled_date: '2024-05-18', scheduled_time: '15:00' } }
        ];
      default:
        return [];
    }
  };

  const samples = getSamples();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-xl border border-purple-100 shadow-sm">
      <div className="flex items-center gap-2 mr-2">
        <Zap className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Test Data:</span>
      </div>
      <Space size={8}>
        {samples.map((sample, idx) => (
          <Tooltip key={idx} title={`Submit ${sample.label}`}>
            <Button
              size="small"
              type="primary"
              className="bg-purple-600 hover:bg-purple-700 text-[10px] h-7 px-3 rounded-lg flex items-center gap-1.5 border-none shadow-sm"
              onClick={() => onTest(sample.data)}
            >
              <Send className="w-3 h-3" />
              {sample.label}
            </Button>
          </Tooltip>
        ))}
      </Space>
    </div>
  );
};

export default QuickTest;
