import { create } from 'zustand'

const SHEET_ID = '2PACX-1vTSM9XPl-Ti4Fz9Hr2BMk8dwzw5nP8KUjPxO2gySHigPsDNzolfSNxiqlWnK16cKlBN_aiXKexnE79E'
const WEBHOOK_URLS = {
  campaignManagement: 'https://studio.pucho.ai/api/v1/webhooks/38BRtwRgT0lJ08s761dLg',
  leadTracking: 'https://studio.pucho.ai/api/v1/webhooks/NqbXFa7tn8yRPdvZozbIH',
  roiCalculator: 'https://studio.pucho.ai/api/v1/webhooks/g0UxcutY8vPpywv5GMkEx/sync',
  contentCalendar: 'https://studio.pucho.ai/api/v1/webhooks/jOKr4P866GGD9DuldyAU2',
  broadcast: 'https://studio.pucho.ai/api/v1/webhooks/iF9d6XBIlCU15ihehCQmi',
  dataSync: 'https://studio.pucho.ai/api/v1/webhooks/KycbWCDvwVgdMlcm7rGso',
}

const INITIAL_WORKFLOWS = [
  { id: 'WF1', name: 'Campaign Management', description: 'Create and manage marketing campaigns', enabled: true, status: 'running', fileName: 'Campaign Management(V1-M-OS).json' },
  { id: 'WF2', name: 'Lead Tracking', description: 'Track leads from different channels', enabled: true, status: 'running', fileName: 'Lead Source Tracking(V1-M-OS).json' },
  { id: 'WF3', name: 'ROI Calculator', description: 'Calculate ROI metrics per campaign', enabled: true, status: 'running', fileName: 'ROI Calculator(V1-M-OS).json' },
  { id: 'WF4', name: 'Content Calendar', description: 'Manage content planning and scheduling', enabled: true, status: 'running', fileName: 'Content Calendar(V1-M-OS).json' },
  { id: 'WF5', name: 'Broadcast Manager', description: 'Send WhatsApp broadcast messages', enabled: true, status: 'running', fileName: 'Broadcast Manager(V1-M-OS).json' },
  { id: 'WF6', name: 'Notification Alerts', description: 'Daily alerts for campaigns and performance', enabled: true, status: 'scheduled', fileName: 'Notification Alerts(V1-M-OS).json' },
  { id: 'WF7', name: 'Data Sync', description: 'Sync data between Sheets and Dashboard', enabled: true, status: 'running', fileName: 'Data Sync(V1-M-OS).json' },
]

const INITIAL_PAIN_POINTS = [
  { id: 'PP1', title: 'Lead Leakage', category: 'leads', severity: 'critical', description: 'Fragmented lead capture across WhatsApp and Excel', enabled: true },
  { id: 'PP2', title: 'Ad-hoc Follow-up', category: 'leads', severity: 'high', description: 'No structured follow-up sequences after first contact', enabled: true },
  { id: 'PP3', title: 'Broken Handoff', category: 'sales', severity: 'medium', description: 'No clear qualification between Marketing and Sales', enabled: true },
  { id: 'PP4', title: 'Manual Quotations', category: 'operations', severity: 'high', description: 'Quoting manually in Excel/Word via WhatsApp', enabled: true },
  { id: 'PP7', title: 'Inconsistent Content', category: 'content', severity: 'medium', description: 'No content calendar or scheduled posts', enabled: true },
  { id: 'PP8', title: 'Dormant Accounts', category: 'retention', severity: 'high', description: 'Old customers ignored without reactivation triggers', enabled: true },
  { id: 'PP11', title: 'Marketing ROI Blindness', category: 'analytics', severity: 'critical', description: 'No visibility on which campaigns drive revenue', enabled: true },
  { id: 'PP13', title: 'Last-minute Festive', category: 'content', severity: 'high', description: 'Seasonal campaigns planned reactively at the last hour', enabled: true },
]


const useStore = create((set, get) => ({
  campaigns: [],
  leads: [],
  content: [],
  roi: [],
  broadcasts: [],
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
    phone: localStorage.getItem('adminPhone') || '+91 99887 76655',
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
      const currentSheetId = get().settings.spreadsheetId || SHEET_ID;
      const baseUrl = `https://docs.google.com/spreadsheets/d/${currentSheetId}/export?format=csv&gid=`;
      
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
                 try { val = JSON.parse(val); if(Array.isArray(val)) val = val.join(', '); } catch(e) {}
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

      const safeFetch = async (gid) => {
        try {
          const isPublished = currentSheetId.startsWith('2PACX');
          const fetchUrl = isPublished 
            ? `https://docs.google.com/spreadsheets/d/e/${currentSheetId}/pub?output=csv&gid=${gid}`
            : `https://docs.google.com/spreadsheets/d/${currentSheetId}/export?format=csv&gid=${gid}`;
          
          const res = await fetch(fetchUrl);
          if (!res.ok) return '';
          return await res.text();
        } catch (e) {
          return '';
        }
      };

      const [campText, leadsText, contentText, roiText, broadText] = await Promise.all([
        safeFetch('0'),           // Marketing_Campaigns
        safeFetch('570407358'),   // Marketing_Leads
        safeFetch('942763469'),   // Marketing_Content
        safeFetch('974136326'),   // Marketing_ROI
        safeFetch('522078397')    // Marketing_Broadcasts
      ]);

      const campaigns = parseCSV(campText).map(c => ({
        ...c, budget: c.budget ? parseFloat(c.budget) : 0,
        status: c.status ? c.status.toLowerCase() : 'planned'
      }));
      const leads = parseCSV(leadsText).map(l => ({
        ...l, revenue: l.revenue ? parseFloat(l.revenue) : 0,
        status: l.status ? l.status.toLowerCase() : 'new'
      }));
      const content = parseCSV(contentText).map(c => ({
        ...c, status: c.status ? c.status.toLowerCase() : 'draft'
      }));
      const roi = parseCSV(roiText).map(r => ({
        ...r, 
        total_cost: parseFloat(r.total_cost || 0),
        total_revenue: parseFloat(r.total_revenue || 0),
        leads_generated: parseInt(r.leads_generated || 0),
        leads_converted: parseInt(r.leads_converted || 0),
        roi_percentage: parseFloat(r['roi_%'] || r.roi_percentage || 0)
      }));
      const broadcasts = parseCSV(broadText).map(b => ({
        ...b,
        total_sent: parseInt(b.total_sent) || 0,
        delivered: parseInt(b.delivered) || 0,
        responses: parseInt(b.responses) || 0
      }));
      const notifications = []; // Reset notifications if sheet is broken

      const stats = {
        total_campaigns: campaigns.length,
        active_campaigns: campaigns.filter(c => c.status === 'active').length,
        total_leads: leads.length,
        new_leads: leads.filter(l => l.status === 'new').length,
        converted_leads: leads.filter(l => l.status === 'converted').length,
        total_revenue: leads.reduce((sum, l) => sum + (parseFloat(l.revenue) || 0), 0),
        pending_content: content.filter(c => c.status === 'scheduled').length,
        total_broadcasts: broadcasts.length,
      };

      const leadsBySource = {
        'WhatsApp': leads.filter(l => l.source === 'WhatsApp').length,
        'Instagram': leads.filter(l => l.source === 'Instagram').length,
        'Facebook': leads.filter(l => l.source === 'Facebook').length,
        'Google Ads': leads.filter(l => l.source === 'Google Ads' || l.source === 'Google').length,
      };

      set({ campaigns, leads, content, roi, broadcasts, notifications, stats, leadsBySource });
      
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
