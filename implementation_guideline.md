# Marketing Management System - Implementation Guide

## 📋 Overview

This Marketing Management System is designed for Indian MSMEs to solve:
- **PP7:** Social Media Inconsistency
- **PP11:** No ROI Tracking  
- **PP13:** Festive Campaign Planning Issues

The system uses a **WhatsApp-first approach** with Google Sheets as the backend and Pucho AI Studio for automation.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REACT DASHBOARD (Frontend)                    │
│  Campaign Manager │ Content Calendar │ Leads Tracker │ ROI      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Webhook Triggers
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PUCHO AUTOMATION WORKFLOWS (7 Total)           │
│  WF1: Campaign │ WF2: Leads │ WF3: ROI │ WF4: Content          │
│  WF5: Broadcast │ WF6: Notifications │ WF7: Data Sync          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS (Backend)                       │
│  Campaigns │ Leads │ Content_Calendar │ ROI_Tracker │ Broadcasts│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Pucho AI Studio account
- Google Account (for Google Sheets)

### Step 1: Install Dependencies

```bash
cd "Marketing Dashboard"
npm install
```

### Step 2: Create Google Sheet

1. Create a new Google Sheet
2. Create 6 tabs with exact names:
   - `Campaigns`
   - `Leads`
   - `Content_Calendar`
   - `ROI_Tracker`
   - `Broadcasts`
   - `Settings`

3. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```

4. Set sharing to "Anyone with the link can edit"

### Step 3: Import Workflows to Pucho

1. Open Pucho AI Studio
2. Import each workflow JSON from `workflows/` folder:
   - `WF1_Campaign_Management.json`
   - `WF2_Lead_Tracking.json`
   - `WF3_ROI_Calculator.json`
   - `WF4_Content_Calendar.json`
   - `WF5_Broadcast.json`
   - `WF6_Notifications.json`
   - `WF7_Data_Sync.json`

### Step 4: Activate Webhooks

For each workflow (except WF6):
1. Open the workflow in Pucho
2. Activate the webhook trigger
3. Copy the webhook URL

For WF6 (Notifications):
- This uses a schedule trigger (runs daily)
- Set these secrets in Pucho:
  - `SPREADSHEET_ID`: Your Google Sheet ID
  - `NOTIFICATION_WEBHOOK_URL`: Your notification endpoint

### Step 5: Configure Dashboard

1. Open `src/hooks/useStore.js`
2. Update the webhook URLs:
   ```javascript
   const WEBHOOK_URLS = {
     campaignManagement: 'https://your-wf1-webhook-url',
     leadTracking: 'https://your-wf2-webhook-url',
     // ... etc
   }
   ```

3. Update the spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = 'your-google-sheet-id'
   ```

### Step 6: Run the Dashboard

```bash
npm run dev
```

Open http://localhost:3000

---

## 📊 Google Sheet Structure

### Sheet 1: Campaigns
| Column | Header | Type |
|--------|--------|------|
| A | campaign_id | Text |
| B | campaign_name | Text |
| C | campaign_type | Dropdown: festival/product/discount/branding |
| D | start_date | Date |
| E | end_date | Date |
| F | budget | Number |
| G | status | Dropdown: planned/active/completed/paused |
| H | channels | Text |
| I | target_audience | Text |
| J | created_date | Date |

### Sheet 2: Leads
| Column | Header | Type |
|--------|--------|------|
| A | lead_id | Text |
| B | name | Text |
| C | phone | Text |
| D | email | Text |
| E | source | Dropdown: WhatsApp/Instagram/Facebook/Google Ads |
| F | campaign_id | Text |
| G | status | Dropdown: new/contacted/qualified/converted/lost |
| H | created_date | Date |
| I | converted_date | Date |
| J | revenue | Number |

### Sheet 3: Content_Calendar
| Column | Header | Type |
|--------|--------|------|
| A | content_id | Text |
| B | title | Text |
| C | platform | Dropdown: WhatsApp/Instagram/Facebook/LinkedIn |
| D | content_type | Dropdown: text/image/video/story |
| E | scheduled_date | Date |
| F | scheduled_time | Time |
| G | status | Dropdown: draft/scheduled/posted/cancelled |
| H | campaign_id | Text |
| I | caption | Text |
| J | media_url | Text |

### Sheet 4: ROI_Tracker
| Column | Header | Type |
|--------|--------|------|
| A | roi_id | Text |
| B | campaign_id | Text |
| C | campaign_name | Text |
| D | total_cost | Number |
| E | total_revenue | Number |
| F | leads_generated | Number |
| G | leads_converted | Number |
| H | roi_percentage | Number |
| I | conversion_rate | Number |
| J | cost_per_lead | Number |
| K | revenue_per_lead | Number |
| L | updated_date | Date |

### Sheet 5: Broadcasts
| Column | Header | Type |
|--------|--------|------|
| A | broadcast_id | Text |
| B | campaign_id | Text |
| C | segment | Dropdown: new_leads/existing_customers/inactive_users/all |
| D | message | Text |
| E | scheduled_date | Date |
| F | scheduled_time | Time |
| G | total_sent | Number |
| H | delivered | Number |
| I | responses | Number |
| J | status | Dropdown: draft/scheduled/sent/failed |

---

## 🔄 Workflow Details

### WF1: Campaign Management
- **Trigger:** Webhook
- **Purpose:** Create and manage campaigns
- **Input:** campaign_name, campaign_type, start_date, end_date, budget, channels, target_audience

### WF2: Lead Tracking
- **Trigger:** Webhook
- **Purpose:** Add leads from marketing channels
- **Input:** name, phone, email, source, campaign_id

### WF3: ROI Calculator
- **Trigger:** Webhook
- **Purpose:** Calculate ROI metrics for campaigns
- **Input:** spreadsheet_id, campaign_id (optional)

### WF4: Content Calendar
- **Trigger:** Webhook
- **Purpose:** Schedule and manage content
- **Input:** title, platform, content_type, scheduled_date, scheduled_time, caption, media_url

### WF5: Broadcast
- **Trigger:** Webhook
- **Purpose:** Send broadcast messages via webhook
- **Input:** segment, message, scheduled_date, scheduled_time, phones, webhook_url

### WF6: Notifications
- **Trigger:** Schedule (Daily at 9 AM IST)
- **Purpose:** Send alerts for campaigns, content, and performance
- **Alerts:**
  - Campaign starting tomorrow
  - Campaign ending in 3 days
  - Content scheduled for today
  - Low ROI alert (< 20%)

### WF7: Data Sync
- **Trigger:** Webhook
- **Purpose:** Sync all data from Google Sheets to dashboard
- **Input:** spreadsheet_id

---

## 📱 Dashboard Features

### Pages

1. **Dashboard** - Overview with stats, charts, and recent activity
2. **Campaigns** - Create, edit, manage campaigns
3. **Leads** - Track leads from all channels
4. **Content Calendar** - Schedule and manage content
5. **ROI Analytics** - Track campaign performance
6. **Broadcast** - Send WhatsApp broadcasts
7. **Settings** - Configure webhooks and preferences

### Mobile Responsive
- Desktop: Full sidebar + multi-column layout
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation + single column

---

## 🔧 Troubleshooting

### Common Issues

1. **Webhook not working**
   - Check if the webhook URL is correct
   - Ensure the workflow is activated in Pucho
   - Verify the request payload format

2. **Data not syncing**
   - Check Google Sheet sharing permissions
   - Verify spreadsheet_id is correct
   - Check browser console for errors

3. **Charts not displaying**
   - Ensure data is loaded
   - Check data format matches expected structure

---

## 📞 Support

For issues with:
- **Pucho Workflows:** Contact Pucho AI Studio support
- **Dashboard:** Check console logs and network tab
- **Google Sheets:** Verify sharing permissions

---

## 🎯 Next Steps

1. Add sample data to Google Sheets
2. Test each workflow individually
3. Configure notification webhook (WF6)
4. Customize dashboard colors and branding
5. Add additional features as needed

---

**Built with:**
- React 18 + Vite
- HeroUI + Ant Design
- Recharts
- Tailwind CSS
- Framer Motion
- Pucho AI Studio
