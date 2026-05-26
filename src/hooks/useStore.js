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

const FALLBACK_CAMPAIGNS = [];
const FALLBACK_LEADS = [];
const FALLBACK_CONTENT = [];
const FALLBACK_ROI = [];
const FALLBACK_BROADCASTS = [];
const FALLBACK_QUOTATIONS = [];
const FALLBACK_DEALERSCHEMES = [];
const FALLBACK_FIELDSALES = [];
const FALLBACK_ONBOARDING = [];
const FALLBACK_TESTIMONIALS = [];

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
    spreadsheetId: SHEET_ID,
    webhookUrls: WEBHOOK_URLS,
    notificationWebhook: 'YOUR_NOTIFICATION_WEBHOOK_URL',
  },

  profile: {
    name: localStorage.getItem('adminName') || 'Admin',
    email: localStorage.getItem('adminEmail') || 'admin@pucho.ai',
    phone: localStorage.getItem('adminPhone') || '9988776655',
  },

  updateProfile: (updates) => {
    set((state) => {
      const newProfile = { ...state.profile, ...updates }
      if (updates.name) localStorage.setItem('adminName', updates.name)
      if (updates.email) localStorage.setItem('adminEmail', updates.email)
      if (updates.phone) localStorage.setItem('adminPhone', updates.phone)
      return { profile: newProfile }
    })
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
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }))
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
      setTimeout(() => get().syncData(), 1500);
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
        spreadsheet_id: SHEET_CONFIG.editSpreadsheetId
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
      setTimeout(() => get().syncData(), 1500);

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
          spreadsheet_id: SHEET_CONFIG.editSpreadsheetId
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
        spreadsheet_id: SHEET_CONFIG.editSpreadsheetId
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
      setTimeout(() => get().syncData(), 1500);

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
          spreadsheet_id: SHEET_CONFIG.editSpreadsheetId
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
      setTimeout(() => get().syncData(), 1500);
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
      setTimeout(() => get().syncData(), 1500);
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
      setTimeout(() => get().syncData(), 1500);
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
      // ALWAYS use the public 2PACX- published ID from SHEET_CONFIG for reading (never the private edit ID)
      const currentSheetId = SHEET_CONFIG.spreadsheetId;
      
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
               const key = h.toLowerCase().replace(/ /g, '_');
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
          
          // Deduplicate rows safely - use ID + Row Number to ensure all sheet entries are shown
          const uniqueRows = [];
          const seenUniqueKeys = new Set();
          
          finalRows.forEach(row => {
            const id = row.campaign_id || row.lead_id || row.content_id || row.broadcast_id || row.roi_id || 'no-id';
            const uniqueKey = `${id}-${row.row_number}`;
            
            if (!seenUniqueKeys.has(uniqueKey)) {
              seenUniqueKeys.add(uniqueKey);
              uniqueRows.push(row);
            }
          });

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
      const campaigns = rawCampaigns.length > 0 ? rawCampaigns.map(c => ({
        ...c, budget: c.budget ? parseFloat(c.budget) : 0,
        status: c.status ? c.status.toLowerCase() : 'planned'
      })) : FALLBACK_CAMPAIGNS;

      const rawLeads = leadsText ? parseCSV(leadsText) : [];
      const leads = rawLeads.length > 0 ? rawLeads.map(l => ({
        ...l, revenue: l.revenue ? parseFloat(l.revenue) : 0,
        status: l.status ? l.status.toLowerCase() : 'new'
      })) : FALLBACK_LEADS;

      const rawContent = contentText ? parseCSV(contentText) : [];
      const content = rawContent.length > 0 ? rawContent.map(c => ({
        ...c, status: c.status ? c.status.toLowerCase() : 'draft'
      })) : FALLBACK_CONTENT;

      const rawRoi = roiText ? parseCSV(roiText) : [];
      const roi = rawRoi.length > 0 ? rawRoi.map(r => ({
        ...r, 
        total_cost: parseFloat(r.total_cost || 0),
        total_revenue: parseFloat(r.total_revenue || 0),
        leads_generated: parseInt(r.leads_generated || 0),
        leads_converted: parseInt(r.leads_converted || 0),
        roi_percentage: parseFloat(r['roi_%'] || r.roi_percentage || 0)
      })) : FALLBACK_ROI;

      const rawBroadcasts = broadText ? parseCSV(broadText) : [];
      const broadcasts = rawBroadcasts.length > 0 ? rawBroadcasts.map(b => ({
        ...b,
        total_sent: parseInt(b.total_sent) || 0,
        delivered: parseInt(b.delivered) || 0,
        responses: parseInt(b.responses) || 0
      })) : FALLBACK_BROADCASTS;

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
      }) : FALLBACK_QUOTATIONS;

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
      }) : FALLBACK_DEALERSCHEMES;

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
      }) : FALLBACK_FIELDSALES;

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
        const status = getVal(['status']);
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
      }) : FALLBACK_ONBOARDING;

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
      }) : FALLBACK_TESTIMONIALS;

      const notifications = [];

      const stats = {
        total_campaigns: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length,
        total_leads: leads.length,
        new_leads: leads.filter(l => l.status === 'new').length,
        converted_leads: leads.filter(l => l.status === 'converted').length,
        total_revenue: leads.reduce((sum, l) => sum + (parseFloat(l.revenue) || 0), 0),
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
}))

export { useStore }
