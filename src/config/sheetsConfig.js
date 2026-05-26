export const SHEET_CONFIG = {
  // Public published Spreadsheet ID starting with 2PACX- (Used for reading data in React UI without CORS block)
  spreadsheetId: '2PACX-1vTSM9XPl-Ti4Fz9Hr2BMk8dwzw5nP8KUjPxO2gySHigPsDNzolfSNxiqlWnK16cKlBN_aiXKexnE79E',

  // Private Spreadsheet ID (Used for writing data to your Google Sheet via Pucho Studio webhooks)
  editSpreadsheetId: '1n6EHTmx5hgFXC9vgPVgHGMDo660_N-uIXIBPIoQtl7I',

  // GIDs (Sub-sheet IDs) for all tabs
  gids: {
    campaigns: '0',
    leads: '570407358',
    content: '942763469',
    roi: '974136326',
    broadcasts: '522078397',
    quotations: '1657575300',
    dealerSchemes: '236984820',
    fieldSales: '1949005463',
    onboarding: '248917198',
    testimonials: '1948341797',
    customer: '706168239',
  },

  // Webhook URLs for Pucho Studio
  webhookUrls: {
    campaignManagement: 'https://studio.pucho.ai/api/v1/webhooks/38BRtwRgT0lJ08s761dLg',
    leadTracking: 'https://studio.pucho.ai/api/v1/webhooks/NqbXFa7tn8yRPdvZozbIH',
    roiCalculator: 'https://studio.pucho.ai/api/v1/webhooks/g0UxcutY8vPpywv5GMkEx/sync',
    contentCalendar: 'https://studio.pucho.ai/api/v1/webhooks/jOKr4P866GGD9DuldyAU2',
    broadcast: 'https://studio.pucho.ai/api/v1/webhooks/iF9d6XBIlCU15ihehCQmi',
    dataSync: 'https://studio.pucho.ai/api/v1/webhooks/KycbWCDvwVgdMlcm7rGso',
    onboarding: 'https://studio.pucho.ai/api/v1/webhooks/6VuHiijlvnPWfqDry83nT',
    testimonials: 'https://studio.pucho.ai/api/v1/webhooks/tB5LQsNRxZXdTg7Ojmn3f',
  }
};
