import { SHEET_CONFIG } from '../config/sheetsConfig'

const WEBHOOK_URLS = SHEET_CONFIG.webhookUrls

const SPREADSHEET_ID = SHEET_CONFIG.editSpreadsheetId

export const triggerWebhook = async (webhookUrl, payload) => {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Webhook error:', error)
    throw error
  }
}

export const createCampaign = async (campaignData) => {
  return triggerWebhook(WEBHOOK_URLS.campaignManagement, {
    ...campaignData,
    spreadsheet_id: SPREADSHEET_ID,
  })
}

export const addLead = async (leadData) => {
  return triggerWebhook(WEBHOOK_URLS.leadTracking, {
    ...leadData,
    spreadsheet_id: SPREADSHEET_ID,
  })
}

export const calculateROI = async (campaignId = null) => {
  return triggerWebhook(WEBHOOK_URLS.roiCalculator, {
    spreadsheet_id: SPREADSHEET_ID,
    campaign_id: campaignId,
  })
}

export const scheduleContent = async (contentData) => {
  return triggerWebhook(WEBHOOK_URLS.contentCalendar, {
    ...contentData,
    spreadsheet_id: SPREADSHEET_ID,
  })
}

export const sendBroadcast = async (broadcastData) => {
  return triggerWebhook(WEBHOOK_URLS.broadcast, {
    ...broadcastData,
    spreadsheet_id: SPREADSHEET_ID,
  })
}

export const syncData = async () => {
  return triggerWebhook(WEBHOOK_URLS.dataSync, {
    spreadsheet_id: SPREADSHEET_ID,
  })
}

export { WEBHOOK_URLS, SPREADSHEET_ID }
