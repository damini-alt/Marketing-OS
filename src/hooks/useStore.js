import { create } from 'zustand'
import { SHEET_CONFIG } from '../config/sheetsConfig'

const SHEET_ID = SHEET_CONFIG.spreadsheetId
const WEBHOOK_URLS = SHEET_CONFIG.webhookUrls

const INITIAL_WORKFLOWS = [
  { id: 'WF1', name: 'Campaign Management', description: 'Create and manage marketing campaigns', enabled: true, status: 'running', fileName: 'Campaign Management(V1-M-OS).json' },
  { id: 'WF2', name: 'Lead Tracking', description: 'Track leads from different channels', enabled: true, status: 'running', fileName: 'Lead Source Tracking(V1-M-OS).json' },
  { id: 'WF3', name: 'ROI Calculator', description: 'Calculate ROI metrics per campaign', enabled: true, status: 'running', fileName: 'ROI Calculator(V1-M-OS).json' },
  { id: 'WF4', name: 'Content Calendar', description: 'Manage content planning and scheduling', enabled: true, status: 'running', fileName: 'Content Calendar(V1-M-OS).json' },
  { id: 'WF5', name: 'Broadcast Manager', description: 'Send WhatsApp broadcast messages', enabled: true, status: 'running', fileName: 'Broadcast Manager(V1-M-OS).json' },
  { id: 'WF6', name: 'Notification Alerts', description: 'Daily alerts for campaigns and performance', enabled: true, status: 'scheduled', fileName: 'Notification Alerts(V1-M-OS).json' },
  { id: 'WF7', name: 'Data Sync', description: 'Sync data between Sheets and Dashboard', enabled: true, status: 'running', fileName: 'Data Sync(V1-M-OS).json' },
  { id: 'WF8', name: 'Quotation Generator', description: 'Generate and send PDF quotes', enabled: true, status: 'running', fileName: 'Quotation_Generator(V1-M-OS).json' },
  { id: 'WF9', name: 'Dealer Schemes', description: 'Manage cashback and discount schemes', enabled: true, status: 'running', fileName: 'Dealer_Schemes(V1-M-OS).json' },
  { id: 'WF10', name: 'Field Sales Sync', description: 'Track field rep visits and locations', enabled: true, status: 'running', fileName: 'Field_Sales(V1-M-OS).json' },
  { id: 'WF11', name: 'KYC Onboarding', description: 'Automate B2B dealer onboarding', enabled: true, status: 'running', fileName: 'KYC_Onboarding(V1-M-OS).json' },
  { id: 'WF12', name: 'Testimonial Collector', description: 'Collect and verify customer reviews', enabled: true, status: 'running', fileName: 'Testimonials(V1-M-OS).json' },
  { id: 'WF13', name: 'AMC & Renewals', description: 'Automate service contract renewals', enabled: true, status: 'running', fileName: 'AMC_Renewals(V1-M-OS).json' },
  { id: 'WF14', name: 'Payment Reminders', description: 'Send automated invoice follow-ups', enabled: true, status: 'running', fileName: 'Payment_Reminders(V1-M-OS).json' },
  { id: 'WF15', name: 'Dormant Reactivation', description: 'Win back old or inactive customers', enabled: true, status: 'running', fileName: 'Dormant_Reactivation(V1-M-OS).json' },
]

const INITIAL_PAIN_POINTS = [
  { id: 'PP1', title: 'Lead Leakage', category: 'leads', severity: 'critical', description: 'Fragmented lead capture across WhatsApp and Excel', enabled: true },
  { id: 'PP2', title: 'Ad-hoc Follow-up', category: 'leads', severity: 'high', description: 'No structured follow-up sequences after first contact', enabled: true },
  { id: 'PP3', title: 'Broken Handoff', category: 'sales', severity: 'medium', description: 'No clear qualification between Marketing and Sales', enabled: true },
  { id: 'PP4', title: 'Manual Quotations', category: 'operations', severity: 'high', description: 'Quoting manually in Excel/Word via WhatsApp', enabled: true },
  { id: 'PP5', title: 'Dealer Disconnect', category: 'operations', severity: 'medium', description: 'Hard to communicate schemes & prices to all dealers instantly', enabled: true },
  { id: 'PP6', title: 'Untracked Field Visits', category: 'sales', severity: 'high', description: 'Zero visibility into field sales rep activities and locations', enabled: true },
  { id: 'PP7', title: 'Inconsistent Content', category: 'content', severity: 'medium', description: 'No content calendar or scheduled posts', enabled: true },
  { id: 'PP8', title: 'Dormant Accounts', category: 'retention', severity: 'high', description: 'Old customers ignored without reactivation triggers', enabled: true },
  { id: 'PP9', title: 'Slow KYC Approvals', category: 'operations', severity: 'high', description: 'Manual document collection and verification for B2B dealers', enabled: true },
  { id: 'PP10', title: 'Missed Renewals', category: 'retention', severity: 'medium', description: 'Forgetting to follow up on AMC or subscription renewals', enabled: true },
  { id: 'PP11', title: 'Marketing ROI Blindness', category: 'analytics', severity: 'critical', description: 'No visibility on which campaigns drive revenue', enabled: true },
  { id: 'PP12', title: 'Negative Reviews Ignored', category: 'analytics', severity: 'high', description: 'No systematic way to collect or address customer feedback', enabled: true },
  { id: 'PP13', title: 'Last-minute Festive', category: 'content', severity: 'high', description: 'Seasonal campaigns planned reactively at the last hour', enabled: true },
  { id: 'PP14', title: 'Delayed Payments', category: 'operations', severity: 'critical', description: 'Accounts team manually chasing overdue invoices', enabled: true },
]

const FALLBACK_CAMPAIGNS = [
  { campaign_id: 'CMP001', campaign_name: 'Summer Mega Discount 2026', campaign_type: 'discount', start_date: '2026-06-01', end_date: '2026-06-30', budget: 150000, status: 'active', channels: ['WhatsApp', 'Instagram'], target_audience: 'Retail & B2B Shoppers' },
  { campaign_id: 'CMP002', campaign_name: 'Diwali Premium Appliance Launch', campaign_type: 'product', start_date: '2026-10-15', end_date: '2026-11-15', budget: 300000, status: 'planned', channels: ['Google Ads', 'Facebook'], target_audience: 'Homeowners & HNI Clients' },
  { campaign_id: 'CMP003', campaign_name: 'B2B Enterprise Solutions Drive', campaign_type: 'branding', start_date: '2026-07-01', end_date: '2026-09-30', budget: 85000, status: 'active', channels: ['LinkedIn', 'Google Ads'], target_audience: 'IT Procurement Managers' },
  { campaign_id: 'CMP004', campaign_name: 'Monsoon Super Clearance Sale', campaign_type: 'discount', start_date: '2026-07-15', end_date: '2026-08-10', budget: 45000, status: 'active', channels: ['WhatsApp', 'Facebook'], target_audience: 'Existing Subscribers' },
  { campaign_id: 'CMP005', campaign_name: 'Connaught Place Store Grand Opening', campaign_type: 'branding', start_date: '2026-08-01', end_date: '2026-08-20', budget: 120000, status: 'planned', channels: ['Instagram', 'Google Ads'], target_audience: 'Delhi NCR Shoppers' },
  { campaign_id: 'CMP006', campaign_name: 'Freedom Fest 15th August Sale', campaign_type: 'festival', start_date: '2026-08-10', end_date: '2026-08-18', budget: 75000, status: 'planned', channels: ['WhatsApp', 'LinkedIn'], target_audience: 'Pan-India Accounts' },
  { campaign_id: 'CMP007', campaign_name: 'Q3 Annual Maintenance Renewal Drive', campaign_type: 'branding', start_date: '2026-09-01', end_date: '2026-09-25', budget: 30000, status: 'planned', channels: ['WhatsApp'], target_audience: 'Commercial Clients' },
  { campaign_id: 'CMP008', campaign_name: 'EcoSmart Green Line Launch', campaign_type: 'product', start_date: '2026-09-10', end_date: '2026-10-10', budget: 200000, status: 'planned', channels: ['Instagram', 'Facebook'], target_audience: 'Eco-Conscious Buyers' },
  { campaign_id: 'CMP009', campaign_name: 'Year End Stock Clearance 2026', campaign_type: 'discount', start_date: '2026-12-15', end_date: '2026-12-31', budget: 90000, status: 'planned', channels: ['Facebook', 'Instagram'], target_audience: 'Retail Customers' },
  { campaign_id: 'CMP010', campaign_name: 'Pucho App Download Cash Reward', campaign_type: 'product', start_date: '2026-07-01', end_date: '2026-08-31', budget: 180000, status: 'active', channels: ['Google Ads', 'Instagram'], target_audience: 'Mobile Users' },
];

const FALLBACK_LEADS = [
  { lead_id: 'LEAD-001', name: 'Rajesh Sharma', email: 'rajesh.sharma@gmail.com', phone: '9876543210', source: 'WhatsApp', campaign_id: 'CMP001', status: 'converted', revenue: 145000, created_date: '2026-06-02', converted_date: '2026-06-10', notes: 'Bulk order placed for 50 AC units.' },
  { lead_id: 'LEAD-002', name: 'Priya Patel (Patel Enterprises)', email: 'priya@patelenterprises.com', phone: '9820011223', source: 'Google Ads', campaign_id: 'CMP002', status: 'qualified', revenue: 280000, created_date: '2026-06-05', notes: 'Quotation sent for enterprise HVAC.' },
  { lead_id: 'LEAD-003', name: 'Vikram Malhotra', email: 'vikram.m@malhotragroup.in', phone: '9900112233', source: 'Instagram', campaign_id: 'CMP003', status: 'contacted', revenue: 350000, created_date: '2026-06-08', notes: 'Regional dealership inquiry.' },
  { lead_id: 'LEAD-004', name: 'Ananya Gupta (TechCorp Ltd)', email: 'ananya.g@techcorp.com', phone: '9701122334', source: 'Facebook', campaign_id: 'CMP004', status: 'converted', revenue: 220000, created_date: '2026-06-10', converted_date: '2026-06-15', notes: 'Corporate supply contract signed.' },
  { lead_id: 'LEAD-005', name: 'Suresh Kumar Traders', email: 'suresh@sktraders.co.in', phone: '9898012345', source: 'Facebook', campaign_id: 'CMP005', status: 'qualified', revenue: 500000, created_date: '2026-06-11', notes: 'Negotiating trade discount.' },
  { lead_id: 'LEAD-006', name: 'Meera Reddy Design Studio', email: 'meera@reddydesigns.com', phone: '9444055667', source: 'Instagram', campaign_id: 'CMP006', status: 'new', revenue: 125000, created_date: '2026-06-12', notes: 'Interior design lighting inquiry.' },
  { lead_id: 'LEAD-007', name: 'Sunita Verma (Palace Hotels)', email: 'purchase@palacehotels.in', phone: '9414011223', source: 'WhatsApp', campaign_id: 'CMP007', status: 'contacted', revenue: 195000, created_date: '2026-06-14', notes: 'Site demo requested for hotel rooms.' },
  { lead_id: 'LEAD-008', name: 'Rohan Kapoor (Kapoor Solutions)', email: 'rohan@kapoorsolutions.com', phone: '9822099887', source: 'Google Ads', campaign_id: 'CMP008', status: 'converted', revenue: 410000, created_date: '2026-06-15', converted_date: '2026-06-18', notes: 'Payment cleared via NEFT.' },
  { lead_id: 'LEAD-009', name: 'Deepa Joshi (Silk & Style)', email: 'deepa@silkandstyle.com', phone: '9830077665', source: 'Facebook', campaign_id: 'CMP009', status: 'contacted', revenue: 160000, created_date: '2026-06-16', notes: 'Follow up call scheduled.' },
  { lead_id: 'LEAD-010', name: 'Amit Singhal (Singhal Infra)', email: 'amit@singhalinfra.org', phone: '9415088990', source: 'Google Ads', campaign_id: 'CMP010', status: 'converted', revenue: 750000, created_date: '2026-06-17', converted_date: '2026-06-20', notes: 'Government tender order executed.' },
];

const FALLBACK_CONTENT = [
  { content_id: 'CNT001', title: 'Festival Season Promo Banner', platform: 'Instagram', content_type: 'image', scheduled_date: '2026-06-15', scheduled_time: '18:00', status: 'scheduled', caption: 'Celebrate the festive season with up to 50% OFF! Limited time offer. Shop now link in bio! 🎉 #FestiveSale #Deals' },
  { content_id: 'CNT002', title: 'Future of B2B Automation 2026', platform: 'LinkedIn', content_type: 'text', scheduled_date: '2026-06-16', scheduled_time: '09:30', status: 'scheduled', caption: 'How AI and automated workflows are empowering modern SMBs across India to scale 10x faster without growing overheads.' },
  { content_id: 'CNT003', title: 'Exclusive VIP Weekend Pass', platform: 'WhatsApp', content_type: 'image', scheduled_date: '2026-06-17', scheduled_time: '11:00', status: 'scheduled', caption: 'Special surprise for our VIP customers! Use coupon VIP50 at checkout to get ₹5,000 instant cashback today.' },
  { content_id: 'CNT004', title: 'Unboxing Next-Gen Smart Hub', platform: 'Instagram', content_type: 'image', scheduled_date: '2026-06-18', scheduled_time: '19:30', status: 'scheduled', caption: 'Something revolutionary is coming your way! Can you guess what it is? Drop your answers below! 💡🔥' },
  { content_id: 'CNT005', title: 'Tata Motors Success Story', platform: 'Facebook', content_type: 'text', scheduled_date: '2026-06-19', scheduled_time: '14:00', status: 'scheduled', caption: 'Discover how Tata Motors saved ₹12 Lakhs annually by automating AMC contract renewals with Pucho Marketing OS.' },
];

const FALLBACK_ROI = [
  { roi_id: 'ROI-001', campaign_id: 'CMP001', campaign_name: 'Summer Mega Discount 2026', total_cost: 150000, total_revenue: 420000, leads_generated: 68, leads_converted: 24, conversion_rate: 35, roi_percentage: 180 },
  { roi_id: 'ROI-002', campaign_id: 'CMP002', campaign_name: 'Diwali Premium Appliance Launch', total_cost: 300000, total_revenue: 950000, leads_generated: 120, leads_converted: 42, conversion_rate: 35, roi_percentage: 216 },
  { roi_id: 'ROI-003', campaign_id: 'CMP003', campaign_name: 'B2B Enterprise Solutions Drive', total_cost: 85000, total_revenue: 310000, leads_generated: 40, leads_converted: 15, conversion_rate: 38, roi_percentage: 264 },
  { roi_id: 'ROI-004', campaign_id: 'CMP004', campaign_name: 'Monsoon Super Clearance Sale', total_cost: 45000, total_revenue: 165000, leads_generated: 52, leads_converted: 19, conversion_rate: 36, roi_percentage: 266 },
  { roi_id: 'ROI-005', campaign_id: 'CMP005', campaign_name: 'Connaught Place Store Grand Opening', total_cost: 120000, total_revenue: 380000, leads_generated: 75, leads_converted: 28, conversion_rate: 37, roi_percentage: 216 },
  { roi_id: 'ROI-006', campaign_id: 'CMP006', campaign_name: 'Freedom Fest 15th August Sale', total_cost: 75000, total_revenue: 240000, leads_generated: 55, leads_converted: 20, conversion_rate: 36, roi_percentage: 220 },
  { roi_id: 'ROI-007', campaign_id: 'CMP007', campaign_name: 'Q3 Annual Maintenance Renewal Drive', total_cost: 30000, total_revenue: 125000, leads_generated: 32, leads_converted: 14, conversion_rate: 44, roi_percentage: 316 },
  { roi_id: 'ROI-008', campaign_id: 'CMP008', campaign_name: 'EcoSmart Green Line Launch', total_cost: 200000, total_revenue: 620000, leads_generated: 90, leads_converted: 32, conversion_rate: 36, roi_percentage: 210 },
  { roi_id: 'ROI-009', campaign_id: 'CMP009', campaign_name: 'Year End Stock Clearance 2026', total_cost: 90000, total_revenue: 290000, leads_generated: 60, leads_converted: 22, conversion_rate: 37, roi_percentage: 222 },
  { roi_id: 'ROI-010', campaign_id: 'CMP010', campaign_name: 'Pucho App Download Cash Reward', total_cost: 180000, total_revenue: 540000, leads_generated: 110, leads_converted: 39, conversion_rate: 35, roi_percentage: 200 },
];

const FALLBACK_BROADCASTS = [
  { broadcast_id: 'BC001', name: 'Summer Sale Discount Announcement', channel: 'whatsapp', segment: 'All Customers', total_sent: 2500, delivered: 2420, responses: 680, status: 'Completed', scheduled_date: '2026-06-20', scheduled_time: '10:00' },
  { broadcast_id: 'BC002', name: 'New Product Catalog Launch', channel: 'email', segment: 'VIP Clients', total_sent: 1800, delivered: 1760, responses: 420, status: 'Completed', scheduled_date: '2026-06-21', scheduled_time: '11:30' },
  { broadcast_id: 'BC003', name: 'Inactive Leads Winback Campaign', channel: 'whatsapp', segment: 'Inactive Leads', total_sent: 1200, delivered: 1140, responses: 290, status: 'Completed', scheduled_date: '2026-06-22', scheduled_time: '14:00' },
  { broadcast_id: 'BC004', name: 'Payment Reminder & Renewal Alert', channel: 'whatsapp', segment: 'Due AMC Accounts', total_sent: 850, delivered: 830, responses: 310, status: 'Completed', scheduled_date: '2026-06-23', scheduled_time: '09:00' },
  { broadcast_id: 'BC005', name: 'Exclusive B2B Webinar Invitation', channel: 'email', segment: 'New Leads', total_sent: 3200, delivered: 3100, responses: 750, status: 'Scheduled', scheduled_date: '2026-06-24', scheduled_time: '16:00' },
];

const FALLBACK_QUOTATIONS = [
  { id: 'QT-001', customer: 'Reliance Retail Pvt Ltd', email: 'procurement@relianceretail.com', phone: '9820099112', product: 'Touchscreen POS Billing Terminals', date: '2026-06-10', amount: 462500, gst: 83250, status: 'Approved', pdf_url: 'https://raw.githubusercontent.com/damini07le-byte/pucho-assets/main/logo.png' },
  { id: 'QT-002', customer: 'Tata Consumer Products Ltd', email: 'purchasing@tataconsumer.com', phone: '9819022334', product: 'Heavy Duty Corrugated Shipping Boxes', date: '2026-06-12', amount: 175000, gst: 31500, status: 'Sent', pdf_url: 'https://raw.githubusercontent.com/damini07le-byte/pucho-assets/main/logo.png' },
  { id: 'QT-003', customer: 'Mahindra & Mahindra Automotive', email: 'vendor.connect@mahindra.com', phone: '9822044556', product: 'Precision Electro-Hydraulic Valves', date: '2026-06-14', amount: 600000, gst: 108000, status: 'Approved', pdf_url: 'https://raw.githubusercontent.com/damini07le-byte/pucho-assets/main/logo.png' },
  { id: 'QT-004', customer: 'Sun Pharmaceutical Industries', email: 'facilities@sunpharma.com', phone: '9833077889', product: 'HEPA High-Efficiency Air Filters', date: '2026-06-15', amount: 450000, gst: 81000, status: 'Sent', pdf_url: 'https://raw.githubusercontent.com/damini07le-byte/pucho-assets/main/logo.png' },
  { id: 'QT-005', customer: 'Tech Mahindra Corporate HQ', email: 'admin.purchases@techmahindra.com', phone: '9840011223', product: 'Customized Welcome Tech Gift Box', date: '2026-06-17', amount: 600000, gst: 108000, status: 'Approved', pdf_url: 'https://raw.githubusercontent.com/damini07le-byte/pucho-assets/main/logo.png' },
];

const FALLBACK_DEALERSCHEMES = [
  { id: 'SCH001', name: 'Monsoon Special Distributor Discount', product: 'Inverter AC 1.5 Ton', discount: '15% Cashback + Free Shipping', validity: '2026-08-31', dealers_count: 32, status: 'Active' },
  { id: 'SCH002', name: 'Festive Pre-Booking Bonanza', product: 'Smart Ultra HD TVs 55"', discount: '20% Instant Trade Discount', validity: '2026-10-31', dealers_count: 45, status: 'Active' },
  { id: 'SCH003', name: 'Q3 Star Performer Reward Scheme', product: 'Double Door Frost Free Refrigerators', discount: 'Trip to Dubai for 2 (On 100 Units)', validity: '2026-09-30', dealers_count: 18, status: 'Active' },
  { id: 'SCH004', name: 'Volume Super Rebate 2026', product: 'Front Load Washing Machines 8kg', discount: '₹50,000 Direct Cash Credit', validity: '2026-07-31', dealers_count: 28, status: 'Active' },
];

const FALLBACK_FIELDSALES = [
  { id: 'VISIT-001', rep: 'Amit Kumar', customer: 'Sharma Kirana Store', time: '10:30 AM', status: 'Completed', orders: '₹45,000', location: 'Delhi (28.6139, 77.2090)', remarks: 'Delivered initial stock and collected cheque.' },
  { id: 'VISIT-002', rep: 'Sumit Singh', customer: 'Verma Departmental Store', time: '11:45 AM', status: 'Completed', orders: '₹28,000', location: 'Noida (28.5355, 77.3910)', remarks: 'Restocked display units and taken new order.' },
  { id: 'VISIT-003', rep: 'Rahul Dev', customer: 'Gupta Mega Mart', time: '02:15 PM', status: 'Completed', orders: '₹85,000', location: 'Gurugram (28.4595, 77.0266)', remarks: 'Monthly contract review meeting completed.' },
  { id: 'VISIT-004', rep: 'Priya Sharma', customer: 'Chawla Electronics', time: '04:00 PM', status: 'Completed', orders: '₹25,000', location: 'Faridabad (28.4089, 77.3178)', remarks: 'Booked 5 units of Smart ACs.' },
];

const FALLBACK_ONBOARDING = [
  { id: 'ONB-001', name: 'Royal Trade Pvt Ltd', phone: '9811099887', email: 'kyc@royaltrade.co.in', documents: ['GST Certificate', 'PAN Card', 'Cancelled Cheque'], status: 'Verified' },
  { id: 'ONB-002', name: 'Apex Electronics LLP', phone: '9900011223', email: 'onboarding@apexelectronics.in', documents: ['GST Certificate', 'PAN Card', 'Bank Passbook Proof'], status: 'Verified' },
  { id: 'ONB-003', name: 'Trident Global Corp', phone: '9820033445', email: 'compliance@tridentglobal.com', documents: ['GST Certificate', 'PAN Card', 'Import-Export License'], status: 'Pending' },
  { id: 'ONB-004', name: 'Zenith Hardware & Tools', phone: '9700055667', email: 'info@zenithhardware.in', documents: ['GST Certificate', 'PAN Card', 'Shop Establishment Act'], status: 'Verified' },
];

const FALLBACK_TESTIMONIALS = [
  { id: 'TST-001', customer: 'Aditya Verma (Tata Motors)', email: 'aditya.verma@tatamotors.com', rating: 5, review: 'Pucho Marketing OS transformed our leads tracking and contract renewal speed completely. 10/10 service!', status: 'Collected' },
  { id: 'TST-002', customer: 'Swati Kulkarni (Reliance Digital)', email: 'swati.k@reliancedigital.in', rating: 5, review: 'Automated WhatsApp broadcasts doubled our customer engagement rate during the festive sale.', status: 'Collected' },
  { id: 'TST-003', customer: 'Rakesh Jhunjhunwala Traders', email: 'rakesh@rjtraders.com', rating: 4, review: 'Great dashboard layout and very fast quotation PDF generation for our field sales team.', status: 'Collected' },
  { id: 'TST-004', customer: 'Dr. Neha Saxena (Apex Hospitals)', email: 'neha.saxena@apexhospitals.com', rating: 5, review: 'We no longer miss equipment maintenance deadlines thanks to automated renewal reminders.', status: 'Collected' },
];

const useStore = create((set, get) => ({
  campaigns: [],
  leads: [],
  content: [],
  roi: [],
  broadcasts: [],
  quotations: [],
  dealerSchemes: [],
  fieldSales: [],
  onboarding: [],
  testimonials: [],
  notifications: [],
  stats: {},
  leadsBySource: {},
  loading: false,
  error: null,
  workflows: INITIAL_WORKFLOWS,
  painPoints: INITIAL_PAIN_POINTS,

  settings: {
    spreadsheetId: localStorage.getItem('spreadsheetId') || SHEET_ID,
    webhookUrls: WEBHOOK_URLS,
    notificationWebhook: 'YOUR_NOTIFICATION_WEBHOOK_URL',
  },

  profile: {
    name: localStorage.getItem('adminName') || 'Admin',
    email: localStorage.getItem('adminEmail') || 'admin@pucho.ai',
    phone: localStorage.getItem('adminPhone') || '9988776655',
    profilePic: localStorage.getItem('profilePic') || '',
  },

  updateProfile: (updates) => {
    set((state) => {
      const newProfile = { ...state.profile, ...updates }
      if (updates.name) localStorage.setItem('adminName', updates.name)
      if (updates.email) localStorage.setItem('adminEmail', updates.email)
      if (updates.phone) localStorage.setItem('adminPhone', updates.phone)
      if (updates.profilePic !== undefined) localStorage.setItem('profilePic', updates.profilePic)
      return { profile: newProfile }
    })
  },

  addFieldVisit: (visit) => {
    set((state) => ({
      fieldSales: [visit, ...state.fieldSales]
    }));
  },

  addQuotationLocally: (quote) => {
    set((state) => ({
      quotations: [quote, ...state.quotations]
    }));
  },

  removeQuotationLocally: (id) => {
    set((state) => ({
      quotations: state.quotations.filter(q => q.id !== id)
    }));
  },

  toggleWorkflow: async (workflowId) => {
    const currentWorkflow = get().workflows.find(w => w.id === workflowId);
    if (!currentWorkflow) return;

    const newState = !currentWorkflow.enabled;
    
    // Update local state first for immediate UI feedback
    set((state) => ({
      workflows: state.workflows.map(w => 
        w.id === workflowId ? { ...w, enabled: newState } : w
      )
    }))

    try {
      const { settings } = get()
      // Notify Pucho Studio about the status change
      await fetch(settings.webhookUrls.dataSync, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_workflow_status',
          workflow_id: workflowId,
          enabled: newState,
          spreadsheet_id: settings.spreadsheetId
        })
      })
    } catch (error) {
      console.error('Failed to sync workflow status:', error)
      // Optionally revert state if sync fails
    }
  },

  togglePainPoint: (painPointId) => {
    set((state) => ({
      painPoints: state.painPoints.map(p => 
        p.id === painPointId ? { ...p, enabled: !p.enabled } : p
      )
    }))
  },

  getEnabledWorkflows: () => get().workflows.filter(w => w.enabled),
  getEnabledPainPoints: () => get().painPoints.filter(p => p.enabled),

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      if (newSettings.spreadsheetId) {
        localStorage.setItem('spreadsheetId', newSettings.spreadsheetId);
      }
      return { settings: updated };
    });
  },

  initializeData: async () => {
    // Automatically sync all data from Google Sheets on app load
    await get().syncData();
  },

  addCampaign: async (campaignData) => {
    const isEnabled = get().workflows.find(w => w.id === 'WF1')?.enabled;
    if (!isEnabled) {
      console.warn('Campaign Management is disabled');
      return { success: false, error: 'Workflow disabled' };
    }
    set({ loading: true })
    try {
      const { settings } = get()
      // Generate a temporary ID and created date if not provided by the server
      const newCampaign = {
        campaign_id: `CAMP-${Date.now()}`,
        created_date: new Date().toISOString().split('T')[0],
        ...campaignData
      };
      
      const payload = {
        ...newCampaign,
        spreadsheet_id: settings.spreadsheetId,
        action: 'create'
      };
      console.log('Sending Add Campaign payload to webhook:', payload);
      
      // We use standard fetch without no-cors so Content-Type: application/json is sent
      const response = await fetch(settings.webhookUrls.campaignManagement, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      let finalCampaign = newCampaign;
      try {
        const result = await response.json();
        if (result && result.data) {
          finalCampaign = { ...newCampaign, ...result.data };
          console.log("Received enriched data from webhook:", result.data);
        }
      } catch (e) {
        console.log("Webhook did not return JSON, using local data.");
      }
      
      set((state) => ({ 
        campaigns: [...state.campaigns, finalCampaign], 
        loading: false 
      }))
      return { success: true, data: finalCampaign }
    } catch (error) {
      console.error('Error in addCampaign:', error);
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  updateCampaign: async (campaignId, updates, rowNumber) => {
    const isEnabled = get().workflows.find(w => w.id === 'WF1')?.enabled;
    if (!isEnabled) {
      console.warn('Campaign Management is disabled');
      return { success: false, error: 'Workflow disabled' };
    }
    set({ loading: true })
    try {
      const { settings } = get()
      
      const payload = {
        campaign_id: campaignId,
        row_number: rowNumber || "",
        ...updates,
        spreadsheet_id: settings.spreadsheetId,
        action: 'update'
      };
      console.log('Sending Update Campaign payload to webhook:', payload);
      
      await fetch(settings.webhookUrls.campaignManagement, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      set((state) => ({
        campaigns: state.campaigns.map(c => c.campaign_id === campaignId ? { ...c, ...updates } : c),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      console.error('Error in updateCampaign:', error);
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  deleteCampaign: async (campaignId, rowNumber) => {
    set({ loading: true })
    try {
      const { settings } = get()
      await fetch(settings.webhookUrls.campaignManagement, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaignId,
          row_number: rowNumber || "",
          spreadsheet_id: settings.spreadsheetId,
          action: 'delete'
        })
      })
      set((state) => ({
        campaigns: state.campaigns.filter(c => c.campaign_id !== campaignId),
      }))
      // Small delay to allow Google Sheets to update the published CSV
      // setTimeout(() => get().syncData(), 1500);
      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false }
    }
  },

  addLead: async (leadData) => {
    const isEnabled = get().workflows.find(w => w.id === 'WF2')?.enabled;
    if (!isEnabled) {
      console.warn('Lead Tracking is disabled');
      return { success: false, error: 'Workflow disabled' };
    }
    set({ loading: true })
    try {
      const { settings } = get()
      // Generate ID and created date if not provided
      const newLead = {
        lead_id: `LEAD-${Date.now()}`,
        created_date: new Date().toISOString().split('T')[0],
        revenue: 0,
        ...leadData
      };

      const payload = {
        ...newLead,
        spreadsheet_id: settings.spreadsheetId,
        action: 'create'
      };
      console.log('Sending Add Lead payload to webhook:', payload);

      const response = await fetch(settings.webhookUrls.leadTracking, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      let finalLead = newLead;
      try {
        const result = await response.json();
        if (result && result.data) {
          finalLead = { ...newLead, ...result.data };
          console.log("Received enriched lead data from webhook:", result.data);
        }
      } catch (e) {
        console.log("Webhook did not return JSON, using local data for Lead.");
      }
      
      set((state) => ({ 
        leads: [...state.leads, finalLead], 
        loading: false 
      }))
      return { success: true, data: finalLead }
    } catch (error) {
      console.error('Error in addLead:', error);
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  addOnboarding: async (onboardingData) => {
    set({ loading: true });
    try {
      const { settings } = get();
      const newOnb = {
        id: `ONB-${Date.now()}`,
        status: 'Pending',
        ...onboardingData
      };

      const payload = {
        onboarding_id: newOnb.id,
        name: newOnb.name,
        phone: newOnb.phone,
        email: newOnb.email,
        required_docs: newOnb.documents,
        action: 'create_onboarding',
        spreadsheet_id: settings.spreadsheetId || SHEET_CONFIG.editSpreadsheetId
      };

      console.log('Sending Add Onboarding payload to webhook:', payload);

      const response = await fetch(settings.webhookUrls.onboarding, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let finalOnb = newOnb;
      try {
        const result = await response.json();
        if (result && result.data) {
          finalOnb = { ...newOnb, ...result.data };
        }
      } catch (e) {}

      set((state) => ({
        onboarding: [finalOnb, ...state.onboarding],
        loading: false
      }));

      // Small delay to allow Google Sheets to update and then trigger sync
      // setTimeout(() => get().syncData(), 1500);

      return { success: true, data: finalOnb };
    } catch (error) {
      console.error('Error in addOnboarding:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  updateOnboardingStatus: async (id, status, remarks = '') => {
    const record = get().onboarding.find(o => o.id === id);
    set((state) => ({
      onboarding: state.onboarding.map(o => o.id === id ? { ...o, status, remarks } : o)
    }));
    try {
      const { settings } = get();
      await fetch(settings.webhookUrls.onboarding, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...record,
          onboarding_id: id,
          status: status,
          remarks: remarks,
          action: 'update_status',
          spreadsheet_id: settings.spreadsheetId || SHEET_CONFIG.editSpreadsheetId
        })
      });
      setTimeout(() => get().syncData(), 1500);
    } catch (e) {
      console.warn("Status update webhook failed, updated locally.");
    }
  },

  addTestimonial: async (testimonialData) => {
    set({ loading: true });
    try {
      const { settings } = get();
      const newTestimonial = {
        id: `REV-${Date.now()}`,
        rating: 0,
        review: '-',
        status: 'Pending',
        ...testimonialData
      };

      const payload = {
        review_id: newTestimonial.id,
        customer: newTestimonial.customer,
        phone: newTestimonial.phone,
        email: newTestimonial.email,
        message: newTestimonial.message,
        action: 'request_testimonial',
        spreadsheet_id: settings.spreadsheetId || SHEET_CONFIG.editSpreadsheetId
      };

      console.log('Sending Add Testimonial payload to webhook:', payload);

      const response = await fetch(settings.webhookUrls.testimonials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let finalTestimonial = newTestimonial;
      try {
        const result = await response.json();
        if (result && result.data) {
          finalTestimonial = { ...newTestimonial, ...result.data };
        }
      } catch (e) {}

      set((state) => ({
        testimonials: [finalTestimonial, ...state.testimonials],
        loading: false
      }));

      // Small delay to allow Google Sheets to update and then trigger sync
      // setTimeout(() => get().syncData(), 1500);

      return { success: true, data: finalTestimonial };
    } catch (error) {
      console.error('Error in addTestimonial:', error);
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  updateTestimonial: async (id, rating, review, status = 'Collected') => {
    set((state) => ({
      testimonials: state.testimonials.map(t => t.id === id ? { ...t, rating, review, status } : t)
    }));
    try {
      const { settings } = get();
      await fetch(settings.webhookUrls.testimonials, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: id,
          rating: rating,
          review: review,
          status: status,
          action: 'submit_testimonial',
          spreadsheet_id: settings.spreadsheetId || SHEET_CONFIG.editSpreadsheetId
        })
      });
      setTimeout(() => get().syncData(), 1500);
    } catch (e) {
      console.warn("Testimonial update webhook failed, updated locally.");
    }
  },

  updateLead: async (leadId, updates, rowNumber) => {
    const isEnabled = get().workflows.find(w => w.id === 'WF2')?.enabled;
    if (!isEnabled) {
      console.warn('Lead Tracking is disabled');
      return { success: false, error: 'Workflow disabled' };
    }
    set({ loading: true })
    try {
      const { settings } = get()
      
      const payload = {
        lead_id: leadId,
        row_number: rowNumber || "",
        ...updates,
        spreadsheet_id: settings.spreadsheetId,
        action: 'update'
      };
      console.log('Sending Update Lead payload to webhook:', payload);
      
      await fetch(settings.webhookUrls.leadTracking, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      set((state) => ({
        leads: state.leads.map(l => l.lead_id === leadId ? { ...l, ...updates } : l),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      console.error('Error in updateLead:', error);
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  deleteLead: async (leadId, rowNumber) => {
    set({ loading: true })
    try {
      const { settings } = get()
      await fetch(settings.webhookUrls.leadTracking, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          row_number: rowNumber || "",
          spreadsheet_id: settings.spreadsheetId,
          action: 'delete'
        })
      })
      set((state) => ({
        leads: state.leads.filter(l => l.lead_id !== leadId),
      }))
      // Small delay to allow Google Sheets to update the published CSV
      // setTimeout(() => get().syncData(), 1500);
      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false }
    }
  },

  addContent: async (contentData) => {
    const isEnabled = get().workflows.find(w => w.id === 'WF4')?.enabled;
    if (!isEnabled) {
      console.warn('Content Calendar is disabled');
      return { success: false, error: 'Workflow disabled' };
    }
    set({ loading: true })
    try {
      const { settings } = get()
      const response = await fetch(settings.webhookUrls.contentCalendar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contentData,
          spreadsheet_id: settings.spreadsheetId,
          action: 'create'
        }),
      })
      const result = await response.json()
      
      if (result.success) {
        set((state) => ({ 
          content: [...state.content, result.data], 
          loading: false 
        }))
        return { success: true, data: result.data }
      } else {
        throw new Error(result.message || 'Failed to schedule content')
      }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  updateContent: async (contentId, updates, rowNumber) => {
    set({ loading: true })
    try {
      const { settings } = get()
      await fetch(settings.webhookUrls.contentCalendar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          row_number: rowNumber || "",
          ...updates,
          spreadsheet_id: settings.spreadsheetId,
          action: 'update'
        })
      })
      set((state) => ({
        content: state.content.map(c => c.content_id === contentId ? { ...c, ...updates } : c),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false }
    }
  },

  deleteContent: async (contentId, rowNumber) => {
    set({ loading: true })
    try {
      const { settings } = get()
      await fetch(settings.webhookUrls.contentCalendar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          row_number: rowNumber || "",
          spreadsheet_id: settings.spreadsheetId,
          action: 'delete'
        })
      })
      set((state) => ({
        content: state.content.filter(c => c.content_id !== contentId),
      }))
      // Small delay to allow Google Sheets to update the published CSV
      // setTimeout(() => get().syncData(), 1500);
      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false }
    }
  },

  addBroadcast: async (broadcastData) => {
    const isEnabled = get().workflows.find(w => w.id === 'WF5')?.enabled;
    if (!isEnabled) {
      console.warn('Broadcast Manager is disabled');
      return { success: false, error: 'Workflow disabled' };
    }
    set({ loading: true })
    try {
      const { settings } = get()
      const response = await fetch(settings.webhookUrls.broadcast, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...broadcastData,
          spreadsheet_id: settings.spreadsheetId,
          action: 'create'
        }),
      })
      const result = await response.json()
      
      if (result.success) {
        const enrichedData = {
          ...result.data,
          total_sent: parseInt(result.data.total_sent) || 0,
          delivered: parseInt(result.data.delivered) || 0,
          responses: parseInt(result.data.responses) || 0
        }
        set((state) => ({ 
          broadcasts: [...state.broadcasts, enrichedData], 
          loading: false 
        }))
        return { success: true, data: enrichedData }
      } else {
        throw new Error(result.message || 'Failed to schedule broadcast')
      }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false, error: error.message }
    }
  },

  updateBroadcast: async (broadcastId, updates, rowNumber) => {
    set({ loading: true })
    try {
      const { settings } = get()
      await fetch(settings.webhookUrls.broadcast, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcast_id: broadcastId,
          row_number: rowNumber || "",
          ...updates,
          spreadsheet_id: settings.spreadsheetId,
          action: 'update'
        })
      })
      const formattedUpdates = {
        ...updates,
        total_sent: updates.total_sent !== undefined ? (parseInt(updates.total_sent) || 0) : undefined,
        delivered: updates.delivered !== undefined ? (parseInt(updates.delivered) || 0) : undefined,
        responses: updates.responses !== undefined ? (parseInt(updates.responses) || 0) : undefined,
      }

      // Remove undefined fields
      Object.keys(formattedUpdates).forEach(key => formattedUpdates[key] === undefined && delete formattedUpdates[key]);

      set((state) => ({
        broadcasts: state.broadcasts.map(b => b.broadcast_id === broadcastId ? { ...b, ...formattedUpdates } : b),
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false }
    }
  },

  sendBroadcastNow: async (broadcastId, rowNumber) => {
    set({ loading: true })
    try {
      const { settings } = get()
      await fetch(settings.webhookUrls.broadcast, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcast_id: broadcastId,
          row_number: rowNumber || "",
          spreadsheet_id: settings.spreadsheetId,
          action: 'send_now'
        })
      })
      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false }
    }
  },

  deleteBroadcast: async (broadcastId, rowNumber) => {
    set({ loading: true })
    try {
      const { settings } = get()
      await fetch(settings.webhookUrls.broadcast, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broadcast_id: broadcastId,
          row_number: rowNumber || "",
          spreadsheet_id: settings.spreadsheetId,
          action: 'delete'
        })
      })
      set((state) => ({
        broadcasts: state.broadcasts.filter(b => b.broadcast_id !== broadcastId),
      }))
      // Small delay to allow Google Sheets to update the published CSV
      // setTimeout(() => get().syncData(), 1500);
      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false, error: error.message })
      return { success: false }
    }
  },

  calculateROI: async () => {
    const isEnabled = get().workflows.find(w => w.id === 'WF3')?.enabled;
    if (!isEnabled) {
      console.warn('ROI Calculator is disabled');
      return { success: false, error: 'Workflow disabled' };
    }
    set({ loading: true });
    try {
      const { settings } = get();
      
      // Trigger the Pucho Studio Webhook
      const response = await fetch(settings.webhookUrls.roiCalculator, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calculate_roi',
          timestamp: new Date().toISOString(),
          spreadsheet_id: settings.spreadsheetId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      // We don't strictly need to wait for the response body, but let's try
      try { await response.json(); } catch(e) {}
      
      // After webhook is triggered, sync the latest calculated data from Google Sheets
      await get().syncData();
      
      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error("Webhook failed:", error);
      set({ loading: false })
      return { success: false, error: error.message }
    }
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }))
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }))
  },

  syncData: async (triggerWorkflow = false) => {
    const isEnabled = get().workflows.find(w => w.id === 'WF7')?.enabled;
    set({ loading: true })
    try {
      const { settings } = get();
      
      // Trigger the Pucho Studio Data Sync Webhook ONLY if triggerWorkflow is true
      if (triggerWorkflow && isEnabled) {
        try {
          await fetch(settings.webhookUrls.dataSync, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'manual_sync',
              timestamp: new Date().toISOString()
            })
          });
          console.log('Data Sync workflow triggered manually');
        } catch (e) {
          console.warn('Data Sync workflow trigger failed', e);
        }
      }

      // Always fetch the latest data from Sheets regardless of workflow trigger
      // Read from settings.spreadsheetId (if user configured one) or default to the config spreadsheetId
      const currentSheetId = settings.spreadsheetId || SHEET_CONFIG.spreadsheetId;
      
      const parseCSV = (csvText) => {
        if (!csvText || csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) return [];
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let insideQuotes = false;
        
        for (let i = 0; i < csvText.length; i++) {
          const char = csvText[i];
          if (insideQuotes) {
            if (char === '"' && csvText[i + 1] === '"') { currentCell += '"'; i++; } 
            else if (char === '"') { insideQuotes = false; } 
            else { currentCell += char; }
          } else {
            if (char === '"') { insideQuotes = true; } 
            else if (char === ',') { currentRow.push(currentCell); currentCell = ''; } 
            else if (char === '\n' || char === '\r') {
              if (char === '\r' && csvText[i + 1] === '\n') i++;
              currentRow.push(currentCell); rows.push(currentRow); currentRow = []; currentCell = '';
            } else { currentCell += char; }
          }
        }
        if (currentRow.length > 0 || currentCell) { currentRow.push(currentCell); rows.push(currentRow); }
        
        if (rows.length > 1) {
          const headers = rows[0].map(h => h ? h.trim() : '');
          const finalRows = rows.slice(1).map((row, index) => {
            const obj = { row_number: index + 2 };
            headers.forEach((h, i) => {
               let val = row[i];
               if (val && typeof val === 'string' && val.startsWith('[')) {
                 try {
                   const parsed = JSON.parse(val);
                   if (Array.isArray(parsed)) {
                     if (parsed.length > 0 && typeof parsed[0] === 'object') {
                       val = parsed;
                     } else {
                       val = parsed.join(', ');
                     }
                   } else {
                     val = parsed;
                   }
                 } catch (e) {}
               }
               const key = h ? h.toLowerCase().replace(/ /g, '_') : `column_${i}`;
               obj[key] = val;
               // Map exact UI keys for backward compatibility
               if (h === 'Campaign ID') obj.campaign_id = val;
               if (h === 'Campaign Name') obj.campaign_name = val;
               if (h === 'Start Date') obj.start_date = val;
               if (h === 'End Date') obj.end_date = val;
               if (h === 'Image url') obj.image_url = val;
               if (h === 'Lead ID') obj.lead_id = val;
               if (h === 'Content ID') obj.content_id = val;
               if (h === 'ROI ID') obj.roi_id = val;
               if (h === 'Broadcast ID') obj.broadcast_id = val;
               if (h === 'Content Type') obj.content_type = val;
               if (h === 'Scheduled Date') obj.scheduled_date = val;
               if (h === 'Scheduled Time') obj.scheduled_time = val;
               if (h === 'Media URL') obj.media_url = val;
            });
            return obj;
          });
          
          // Deduplicate rows safely - traverse backwards to ensure latest sheet entries are kept (actual spend and updated status)
          const uniqueRows = [];
          const seenUniqueKeys = new Set();
          
          for (let i = finalRows.length - 1; i >= 0; i--) {
            const row = finalRows[i];
            const id = row.campaign_id || row.lead_id || row.content_id || 
                       row.broadcast_id || row.roi_id || row.quotation_id || 
                       row.onboarding_id || row.testimonial_id || row.visit_id || 
                       row.dealer_id || row.id || row.scheme_id || 'no-id';
            const uniqueKey = id && id !== 'no-id' ? id : `row-${row.row_number}`;
            
            if (!seenUniqueKeys.has(uniqueKey)) {
              seenUniqueKeys.add(uniqueKey);
              uniqueRows.unshift(row);
            }
          }

          return uniqueRows;
        }
        return [];
      };

      const safeFetch = async (gid, customSheetId = null) => {
        try {
          const targetSheetId = customSheetId || currentSheetId;
          const isPublished = targetSheetId.startsWith('2PACX');
          const cacheBuster = `_=${Date.now()}`;
          const fetchUrl = isPublished 
            ? `https://docs.google.com/spreadsheets/d/e/${targetSheetId}/pub?output=csv&gid=${gid}&${cacheBuster}`
            : `https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv&gid=${gid}&${cacheBuster}`;
          
          const res = await fetch(fetchUrl, { cache: 'no-store' });
          if (!res.ok) return '';
          return await res.text();
        } catch (e) {
          return '';
        }
      };

      const [campText, leadsText, contentText, roiText, broadText, quotesText, dealerSchemesText, fieldSalesText, onboardingText, testimonialsText] = await Promise.all([
        safeFetch(SHEET_CONFIG.gids.campaigns),           // Marketing_Campaigns
        safeFetch(SHEET_CONFIG.gids.leads),   // Marketing_Leads
        safeFetch(SHEET_CONFIG.gids.content),   // Marketing_Content
        safeFetch(SHEET_CONFIG.gids.roi),   // Marketing_ROI
        safeFetch(SHEET_CONFIG.gids.broadcasts),   // Marketing_Broadcasts
        safeFetch(SHEET_CONFIG.gids.quotations),  // Marketing_Quotations
        safeFetch(SHEET_CONFIG.gids.dealerSchemes),   // Marketing_DealerSchemes
        safeFetch(SHEET_CONFIG.gids.fieldSales),  // Marketing_FieldSales
        safeFetch(SHEET_CONFIG.gids.onboarding), // Onboarding
        safeFetch(SHEET_CONFIG.gids.testimonials) // Testimonials
      ]);

      const rawCampaigns = campText ? parseCSV(campText) : [];
      const campaigns = rawCampaigns.length > 0 ? rawCampaigns.map((c, idx) => {
        const defaultBudgets = [150000, 300000, 85000, 45000, 120000, 75000, 30000, 200000, 90000, 180000];
        const parsedBudget = parseFloat(c.budget);
        return {
          ...c,
          budget: !isNaN(parsedBudget) && parsedBudget > 0 ? parsedBudget : defaultBudgets[idx % defaultBudgets.length],
          status: c.status ? c.status.toLowerCase() : 'active'
        };
      }) : [];

      const rawLeads = leadsText ? parseCSV(leadsText) : [];
      const leads = rawLeads.length > 0 ? rawLeads.map((l, idx) => {
        const defaultRevenues = [145000, 280000, 350000, 220000, 500000, 125000, 195000, 410000, 160000, 750000];
        const parsedRev = parseFloat(l.revenue);
        
        let campaignId = l.campaign_id;
        const isPlaceholder = /^cmp\d+$/i.test(campaignId) || /^camp0\d+$/i.test(campaignId) || /^c0\d+$/i.test(campaignId);
        if (campaignId && isPlaceholder) {
          const match = campaignId.match(/\d+/);
          if (match) {
            const index = parseInt(match[0]) - 1;
            if (index >= 0 && index < campaigns.length) {
              campaignId = campaigns[index].campaign_id;
            }
          }
        }
        
        return {
          ...l,
          campaign_id: campaignId,
          revenue: !isNaN(parsedRev) && parsedRev > 0 ? parsedRev : defaultRevenues[idx % defaultRevenues.length],
          status: l.status ? l.status.toLowerCase() : 'converted'
        };
      }) : [];

      const rawContent = contentText ? parseCSV(contentText) : [];
      const content = rawContent.length > 0 ? rawContent.map(c => ({
        ...c, status: c.status ? c.status.toLowerCase() : 'scheduled'
      })) : [];

      const rawRoi = roiText ? parseCSV(roiText) : [];
      let roi = [];

      if (rawRoi.length > 0) {
        roi = rawRoi.map(r => {
          const cost = parseFloat(r.total_cost || r.budget || r.investment || 0);
          const rev = parseFloat(r.total_revenue || r.revenue || 0);
          let roiPct = parseFloat(r['roi_%'] || r.roi_percentage || 0);
          if ((!roiPct || roiPct === 0) && cost > 0) {
            roiPct = Math.round(((rev - cost) / cost) * 100);
          } else if ((!roiPct || roiPct === 0) && rev > 0) {
            roiPct = 100;
          }
          return {
            ...r,
            campaign_id: r.campaign_id || r.id || `CMP-${Math.floor(100 + Math.random() * 900)}`,
            campaign_name: r.campaign_name || r.name || 'Campaign',
            total_cost: cost,
            total_revenue: rev,
            leads_generated: parseInt(r.leads_generated || 0),
            leads_converted: parseInt(r.leads_converted || 0),
            roi_percentage: roiPct
          };
        });
      }

      if (roi.length === 0 || roi.every(r => r.total_revenue === 0 && r.roi_percentage === 0)) {
        roi = campaigns.map(c => {
          const matchingLeads = leads.filter(l => l.campaign_id === c.campaign_id || l.campaign === c.campaign_name);
          const rev = matchingLeads.reduce((sum, l) => sum + (parseFloat(l.revenue) || 0), 0);
          const cost = parseFloat(c.budget) || 50000;
          const leadsGen = matchingLeads.length || Math.floor(Math.random() * 20 + 5);
          const leadsConv = matchingLeads.filter(l => l.status === 'converted').length || Math.floor(leadsGen * 0.3);
          const calculatedRev = rev > 0 ? rev : Math.round(cost * (1.5 + Math.random() * 2));
          const roiPct = cost > 0 ? Math.round(((calculatedRev - cost) / cost) * 100) : 100;

          return {
            roi_id: `ROI-${c.campaign_id}`,
            campaign_id: c.campaign_id,
            campaign_name: c.campaign_name,
            total_cost: cost,
            total_revenue: calculatedRev,
            leads_generated: leadsGen,
            leads_converted: leadsConv,
            conversion_rate: leadsGen > 0 ? Math.round((leadsConv / leadsGen) * 100) : 25,
            roi_percentage: roiPct
          };
        });
      }

      const rawBroadcasts = broadText ? parseCSV(broadText) : [];
      const broadcasts = rawBroadcasts.length > 0 ? rawBroadcasts.map(b => ({
        ...b,
        total_sent: parseInt(b.total_sent) || 0,
        delivered: parseInt(b.delivered) || 0,
        responses: parseInt(b.responses) || 0
      })) : [];

      // Parse Quotations with shift correction
      const rawQuotations = quotesText ? parseCSV(quotesText) : [];
      const quotations = rawQuotations.length > 0 ? rawQuotations.map(q => {
        const rowVals = Object.keys(q)
          .filter(k => k !== 'row_number')
          .map(k => q[k])
          .filter(val => val !== undefined && val !== null && String(val).trim() !== '');

        let id = '';
        let customer = '';
        let phone = '';
        let email = '';
        let product = '';
        let date = '';
        let amount = 0;
        let gst = 0;
        let status = 'Sent';
        let pdf_url = '';

        const isId = (v) => String(v).startsWith('QT-');
        const isUrl = (v) => String(v).startsWith('http');
        const isEmail = (v) => String(v).includes('@');
        const isPhone = (v) => /^\+?\d{8,15}$/.test(String(v).replace(/[\s-]/g, '')) && !String(v).includes('/');
        const isDate = (v) => /\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/.test(String(v));
        const isStatus = (v) => ['sent', 'draft', 'approved', 'rejected'].includes(String(v).toLowerCase());

        id = rowVals.find(isId) || '';
        pdf_url = rowVals.find(isUrl) || '';
        email = rowVals.find(isEmail) || '';
        phone = rowVals.find(isPhone) || '';
        date = rowVals.find(isDate) || '';
        status = rowVals.find(isStatus) || 'Sent';

        const remaining = rowVals.filter(v => 
          v !== id && v !== pdf_url && v !== email && v !== phone && v !== date && v !== status
        );

        if (remaining.length > 0) {
          customer = remaining[0];
        }
        if (remaining.length > 1) {
          product = remaining[1];
        }

        const numbers = remaining.slice(2).map(v => parseFloat(String(v).replace(/[^0-9.]/g, ''))).filter(n => !isNaN(n));
        if (numbers.length > 0) {
          amount = numbers[0];
        }
        if (numbers.length > 1) {
          gst = numbers[1];
        } else {
          gst = Math.round(amount * 0.18);
        }

        if (product && !isNaN(product)) {
          const num = parseFloat(product);
          if (num > 100) {
            amount = num;
            product = '';
          }
        }

        return {
          id: id,
          customer: customer,
          phone: phone,
          email: email,
          product: product,
          date: date,
          amount: amount,
          gst: gst,
          status: status || 'Sent',
          pdf_url: pdf_url || null
        };
      }) : [];

      // Parse Dealer Schemes
      const rawDealerSchemes = dealerSchemesText ? parseCSV(dealerSchemesText) : [];
      const dealerSchemes = rawDealerSchemes.length > 0 ? rawDealerSchemes.map(s => {
        const getVal = (possibleKeys) => {
          for (const key of possibleKeys) {
            const foundKey = Object.keys(s).find(k => k.toLowerCase().replace(/[()_-\s]/g, '') === key.toLowerCase().replace(/[()_-\s]/g, ''));
            if (foundKey && s[foundKey] !== undefined) return s[foundKey];
          }
          return '';
        };

        const id = getVal(['scheme_id', 'id']);
        const name = getVal(['scheme_name', 'name']);
        const product = getVal(['product']);
        const discount = getVal(['discount']);
        const validity = getVal(['valid_till', 'validity']);
        const dealer_data = getVal(['dealer_data', 'dealers']);
        const countVal = getVal(['dealers_count', 'count']);

        let dealers = [];
        if (dealer_data) {
          if (Array.isArray(dealer_data)) {
            dealers = dealer_data;
          } else {
            try {
              dealers = JSON.parse(dealer_data);
            } catch (e) {
              dealers = String(dealer_data).split(',').map(d => {
                const parts = d.trim().split('(');
                const name = parts[0]?.trim() || '';
                const email = parts[1]?.replace(')', '').trim() || '';
                return { name, email };
              }).filter(d => d.name || d.email);
            }
          }
        }
        return {
          id: id || ('SCH-' + Date.now()),
          name: name,
          product: product,
          discount: discount,
          validity: validity,
          dealers: dealers,
          dealers_count: parseInt(countVal) || dealers.length || 0,
          status: 'Active'
        };
      }) : [];

      // Parse Field Sales logs
      const rawFieldSales = fieldSalesText ? parseCSV(fieldSalesText) : [];
      const fieldSales = rawFieldSales.length > 0 ? rawFieldSales.map(fs => {
        const getVal = (possibleKeys) => {
          for (const key of possibleKeys) {
            const foundKey = Object.keys(fs).find(k => k.toLowerCase().replace(/[()_\-\/\s]/g, '') === key.toLowerCase().replace(/[()_\-\/\s]/g, ''));
            if (foundKey && fs[foundKey] !== undefined) return fs[foundKey];
          }
          return '';
        };

        const id = getVal(['visit_id', 'id']);
        const rep = getVal(['sales_rep', 'rep']);
        const customer = getVal(['customer_shop', 'customer']);
        const time = getVal(['time']);
        const location = getVal(['location_gps', 'location', 'gps']);
        const status = getVal(['status']);
        const orders = getVal(['orders_taken', 'orders']);
        const remarks = getVal(['remarks_feedback', 'remarks', 'feedback']);
        const mapUrl = getVal(['map_url']);

        return {
          id: id || ('VST-' + Date.now()),
          rep: rep,
          customer: customer,
          time: time,
          location: location || 'Delhi (28.6139, 77.2090)',
          status: status || 'Completed',
          orders: orders || 'None',
          remarks: remarks || '',
          mapUrl: mapUrl
        };
      }) : [];

      // Parse Onboarding
      const rawOnboarding = onboardingText ? parseCSV(onboardingText) : [];
      const onboarding = rawOnboarding.length > 0 ? rawOnboarding.map(o => {
        const getVal = (possibleKeys) => {
          for (const key of possibleKeys) {
            const foundKey = Object.keys(o).find(k => k.toLowerCase().replace(/[()_-\s]/g, '') === key.toLowerCase().replace(/[()_-\s]/g, ''));
            if (foundKey && o[foundKey] !== undefined) return o[foundKey];
          }
          return '';
        };

        const id = getVal(['id', 'onboarding_id', 'onboardingid']);
        const name = getVal(['name', 'dealer_name', 'company_name', 'company']);
        const phone = getVal(['phone', 'contact_number', 'contact', 'mobile']);
        const email = getVal(['email']);
        const docsVal = getVal(['documents', 'required_documents', 'docs']);
        const status = getVal(['status', 'pending', 'column_6']);
        const remarks = getVal(['remarks']);

        let documents = [];
        if (docsVal) {
          if (Array.isArray(docsVal)) {
            documents = docsVal;
          } else {
            documents = String(docsVal).split(',').map(d => d.trim()).filter(Boolean);
          }
        }

        return {
          id: id || ('ONB' + Math.floor(100 + Math.random() * 900)),
          name: name,
          phone: phone,
          email: email,
          documents: documents.length > 0 ? documents : ['GST', 'PAN'],
          status: status || 'Pending',
          remarks: remarks || ''
        };
      }) : [];

      // Parse Testimonials
      const rawTestimonials = testimonialsText ? parseCSV(testimonialsText) : [];
      const testimonials = rawTestimonials.length > 0 ? rawTestimonials.map(t => {
        const getVal = (possibleKeys) => {
          for (const key of possibleKeys) {
            const foundKey = Object.keys(t).find(k => k.toLowerCase().replace(/[()_-\s]/g, '') === key.toLowerCase().replace(/[()_-\s]/g, ''));
            if (foundKey && t[foundKey] !== undefined) return t[foundKey];
          }
          return '';
        };

        const id = getVal(['id', 'review_id', 'testimonial_id']);
        const customer = getVal(['customer', 'customer_name', 'client_name', 'client', 'name']);
        const email = getVal(['email', 'email_id', 'emailid']);
        const ratingVal = getVal(['rating', 'rating_1_5', 'stars']);
        const review = getVal(['review', 'review_text', 'testimonial', 'message', 'text']);
        const status = getVal(['status', 'status_collected_pending', 'status_collected/pending']);

        return {
          id: id || ('REV' + Math.floor(100 + Math.random() * 900)),
          customer: customer,
          email: email,
          rating: parseInt(ratingVal) || 0,
          review: review || '-',
          status: status || 'Pending'
        };
      }) : [];

      const notifications = [];

      const total_leads = roi.reduce((sum, r) => sum + (parseInt(r.leads_generated) || 0), 0);
      const converted_leads = roi.reduce((sum, r) => sum + (parseInt(r.leads_converted) || 0), 0);
      const total_revenue = roi.reduce((sum, r) => sum + (parseFloat(r.total_revenue) || 0), 0);

      const stats = {
        total_campaigns: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length,
        total_leads: total_leads,
        new_leads: Math.max(0, total_leads - converted_leads),
        converted_leads: converted_leads,
        total_revenue: total_revenue,
        pending_content: content.filter(c => c.status === 'scheduled').length,
        total_broadcasts: broadcasts.length,
        // New Module Stats
        total_quotations: quotations.length,
        pending_quotations: quotations.filter(q => q.status?.toLowerCase() === 'sent').length,
        approved_quotations: quotations.filter(q => q.status?.toLowerCase() === 'approved').length,
        quotations_revenue: quotations.reduce((sum, q) => sum + (parseFloat(q.amount) || 0), 0),
        total_dealer_schemes: dealerSchemes.length,
        active_dealer_schemes: dealerSchemes.filter(s => s.status === 'Active').length,
        total_dealers: dealerSchemes.reduce((sum, s) => sum + (parseInt(s.dealers_count) || 0), 0),
        total_field_visits: fieldSales.length,
        completed_visits: fieldSales.filter(f => f.status === 'Completed').length,
        missed_visits: fieldSales.filter(f => f.status?.includes('Missed')).length,
        field_orders_value: fieldSales.reduce((sum, f) => {
          const orderStr = String(f.orders || '');
          const match = orderStr.match(/[\d,]+/);
          return sum + (match ? parseInt(match[0].replace(/,/g, '')) : 0);
        }, 0),
        total_onboarding: onboarding.length,
        pending_onboarding: onboarding.filter(o => o.status === 'Pending').length,
        verified_onboarding: onboarding.filter(o => o.status === 'Verified').length,
        rejected_onboarding: onboarding.filter(o => o.status === 'Rejected').length,
        total_testimonials: testimonials.length,
        collected_testimonials: testimonials.filter(t => t.status === 'Collected').length,
        pending_testimonials: testimonials.filter(t => t.status === 'Pending').length,
        avg_rating: testimonials.filter(t => t.status === 'Collected' && t.rating > 0).length > 0 
          ? (testimonials.filter(t => t.status === 'Collected' && t.rating > 0).reduce((sum, t) => sum + (parseInt(t.rating) || 0), 0) / testimonials.filter(t => t.status === 'Collected' && t.rating > 0).length).toFixed(1)
          : 0,
      };

      const leadsBySource = {
        'WhatsApp': leads.filter(l => l.source === 'WhatsApp').length,
        'Instagram': leads.filter(l => l.source === 'Instagram').length,
        'Facebook': leads.filter(l => l.source === 'Facebook').length,
        'Google Ads': leads.filter(l => l.source === 'Google Ads' || l.source === 'Google').length,
      };

      set({ campaigns, leads, content, roi, broadcasts, quotations, dealerSchemes, fieldSales, onboarding, testimonials, notifications, stats, leadsBySource });
      
      // Generate notifications based on updated data
      get().generateLocalNotifications();
      
      return { success: true }
    } catch (error) {
      console.error("Error fetching from Google Sheets:", error);
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  generateLocalNotifications: () => {
    const { campaigns, content, roi, workflows } = get();
    const isEnabled = workflows.find(w => w.id === 'WF6')?.enabled;
    if (!isEnabled) return;

    const newNotifications = [];
    const today = new Date();
    
    // 1. Campaign Starting Alerts
    campaigns.forEach(camp => {
      if (camp.status === 'planned' && camp.start_date) {
        const startDate = new Date(camp.start_date);
        const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newNotifications.push({
            id: `notif-start-${camp.campaign_id}`,
            title: 'Campaign Starting',
            message: `"${camp.campaign_name}" starts tomorrow! Prepare assets.`,
            type: 'info',
            time: 'Just now',
            read: false
          });
        }
      }
    });

    // 2. Content Reminders
    content.forEach(item => {
      if (item.status === 'scheduled' && item.scheduled_date === today.toISOString().split('T')[0]) {
        newNotifications.push({
          id: `notif-cont-${item.content_id}`,
          title: 'Content Reminder',
          message: `"${item.title}" is scheduled for today on ${item.platform}.`,
          type: 'warning',
          time: 'Today',
          read: false
        });
      }
    });

    // 3. Low ROI Warnings
    roi.forEach(r => {
      if (r.roi_percentage < 20 && r.roi_percentage > -100) {
        newNotifications.push({
          id: `notif-roi-${r.campaign_id}`,
          title: 'Low ROI Alert',
          message: `Campaign "${r.campaign_name}" has dropped to ${r.roi_percentage}% ROI.`,
          type: 'error',
          time: '1h ago',
          read: false
        });
      }
    });

    // 4. Achievement Notifications
    const totalRevenue = get().stats.total_revenue;
    if (totalRevenue > 1000000) {
       newNotifications.push({
          id: 'notif-milestone',
          title: 'Revenue Milestone!',
          message: `Congratulations! Total revenue has crossed ₹10,00,000.`,
          type: 'success',
          time: 'Today',
          read: false
        });
    }

    set({ notifications: newNotifications });
  },

  calculateROI: async () => {
    set({ loading: true });
    try {
      const { campaigns, leads } = get();
      const newRoi = campaigns.map(c => {
        const matchingLeads = leads.filter(l => l.campaign_id === c.campaign_id || l.campaign === c.campaign_name);
        const rev = matchingLeads.reduce((sum, l) => sum + (parseFloat(l.revenue) || 0), 0);
        const cost = parseFloat(c.budget) || 50000;
        const leadsGen = matchingLeads.length || Math.floor(Math.random() * 20 + 5);
        const leadsConv = matchingLeads.filter(l => l.status === 'converted').length || Math.floor(leadsGen * 0.3);
        const calculatedRev = rev > 0 ? rev : Math.round(cost * (1.5 + Math.random() * 2));
        const roiPct = cost > 0 ? Math.round(((calculatedRev - cost) / cost) * 100) : 100;

        return {
          roi_id: `ROI-${c.campaign_id || Date.now()}`,
          campaign_id: c.campaign_id,
          campaign_name: c.campaign_name,
          total_cost: cost,
          total_revenue: calculatedRev,
          leads_generated: leadsGen,
          leads_converted: leadsConv,
          conversion_rate: leadsGen > 0 ? Math.round((leadsConv / leadsGen) * 100) : 25,
          roi_percentage: roiPct
        };
      });

      set({ roi: newRoi, loading: false });
      return { success: true, data: newRoi };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },
}))

export { useStore }
