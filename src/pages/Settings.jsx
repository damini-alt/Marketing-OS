import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, RefreshCw, Link, Bell, Shield, Database, ExternalLink,
  Zap, AlertTriangle, Power, Play, Pause, FileSpreadsheet, User, Upload, FlaskConical, Bug, Download
} from 'lucide-react'
import { Button, Input, Form, message, Switch, Card } from 'antd'
import { useStore } from '../hooks/useStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const statusColors = {
  running: 'bg-green-500',
  scheduled: 'bg-primary-500',
  stopped: 'bg-gray-400',
  error: 'bg-red-500',
}



function Settings() {
  const { 
    settings, updateSettings, syncData, loading, 
    workflows, painPoints, toggleWorkflow, togglePainPoint,
    profile, updateProfile,
    integrationSettings, integrationLogs, updateIntegrationSettings, simulateWebhookLead
  } = useStore()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePic(reader.result)
        updateProfile({ profilePic: reader.result })
        message.success('Profile photo updated!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSave = (values) => {
    updateProfile(values)
    message.success('Profile details saved!')
  }

  const handleSave = async (values) => {
    setSaving(true)
    try {
      updateSettings(values)
      message.success('Settings saved successfully')
    } catch (error) {
      message.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async () => {
    const result = await syncData()
    if (result.success) {
      message.success('Data synced successfully')
    } else {
      message.error('Failed to sync data')
    }
  }



  const enabledWorkflows = workflows.filter(w => w.enabled).length
  const enabledPainPoints = painPoints.filter(p => p.enabled).length

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="p-4 md:p-6 lg:p-8"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure your marketing dashboard</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            activeTab === 'sheets'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Google Sheets (6)
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            activeTab === 'workflows'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Pucho Flows ({enabledWorkflows}/{workflows.length})
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            activeTab === 'webhooks'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Link className="w-4 h-4" />
          Webhooks
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            activeTab === 'integrations'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          Integrations Hub
        </button>
      </div>



      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-2xl shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-50 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Admin Profile</h3>
                <p className="text-sm text-gray-500">Manage your personal details and photo</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden relative group">
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-6 h-6 text-white mb-1" />
                    <span className="text-white text-xs font-medium">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <p className="text-xs text-gray-400">Click photo to update</p>
              </div>

              <div className="flex-1 w-full">
                <Form 
                  layout="vertical" 
                  onFinish={handleProfileSave}
                  initialValues={profile}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Form.Item name="name" label="Full Name">
                      <Input size="large" />
                    </Form.Item>
                    <Form.Item name="email" label="Email Address">
                      <Input type="email" size="large" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone Number">
                      <Input size="large" />
                    </Form.Item>
                    <Form.Item label="Role">
                      <Input defaultValue="Marketing Manager" disabled size="large" />
                    </Form.Item>
                  </div>
                  <Button type="primary" htmlType="submit" size="large" className="mt-2 shadow-soft">
                    Save Profile Details
                  </Button>
                </Form>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Google Sheets Tab */}
      {activeTab === 'sheets' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={settings}
          >
            <Card className="rounded-2xl shadow-sm mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Database className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Google Sheets Configuration</h3>
                  <p className="text-sm text-gray-500">Enter your Sheet ID (6 tabs: Campaigns, Leads, Content, ROI, Broadcasts, Settings)</p>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Your Sheet ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded font-mono">1l49Q9fcrgoIUbPF8GtfvAeAGuzTDGOne-wMUKrDdK9k</code>
                </p>
                <p className="text-xs text-primary mt-2">
                  From URL: https://docs.google.com/spreadsheets/d/<span className="font-bold">[SHEET_ID]</span>/edit
                </p>
              </div>

              <Form.Item
                  name="spreadsheetId"
                  label="Google Sheet ID"
                  rules={[{ required: true, message: 'Please enter Sheet ID' }]}
                >
                  <Input 
                    placeholder="Enter your Google Sheet ID..." 
                    size="large"
                    className="font-mono"
                    suffix={
                      <a
                        href="https://docs.google.com/spreadsheets/d/1l49Q9fcrgoIUbPF8GtfvAeAGuzTDGOne-wMUKrDdK9k/edit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-purple-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    }
                  />
                </Form.Item>

              <div className="flex justify-between gap-3 pt-4 border-t border-gray-100 mt-4">
                <Button
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={handleSync}
                  loading={loading}
                >
                  Sync All Data
                </Button>
                <Button type="primary" htmlType="submit" icon={<Save className="w-4 h-4" />} loading={saving}>
                  Save Sheet IDs
                </Button>
              </div>
            </Card>
          </Form>


        </motion.div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pucho Automation Workflows</h3>
                  <p className="text-sm text-gray-500">Toggle workflows on/off to control automation</p>
                </div>
              </div>
              {enabledWorkflows > 0 && (
                <Button 
                  type="primary" 
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    workflows.filter(w => w.enabled).forEach((w, i) => {
                      setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = `/workflows/${w.fileName}`;
                        link.download = w.fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, i * 500); // 500ms delay between downloads to prevent browser blocking
                    });
                  }}
                >
                  Export All Active ({enabledWorkflows})
                </Button>
              )}
            </div>

            <div className="divide-y divide-gray-50">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`p-4 flex items-center justify-between transition-all ${
                    !workflow.enabled ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      workflow.enabled ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                      {workflow.enabled ? (
                        <Play className="w-5 h-5 text-primary" />
                      ) : (
                        <Pause className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">{workflow.id}</span>
                        <span className={`w-2 h-2 rounded-full ${statusColors[workflow.enabled ? workflow.status : 'stopped']}`} />
                      </div>
                      <h4 className={`font-medium ${workflow.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {workflow.name}
                      </h4>
                      <p className="text-sm text-gray-500">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {workflow.enabled && (
                      <Button 
                        type="default" 
                        size="small" 
                        icon={<Download className="w-3 h-3" />}
                        href={`/workflows/${workflow.fileName}`}
                        download={workflow.fileName}
                        className="flex items-center"
                      >
                        Download JSON
                      </Button>
                    )}
                    <Switch
                      checked={workflow.enabled}
                      onChange={() => toggleWorkflow(workflow.id)}
                      checkedChildren="ON"
                      unCheckedChildren="OFF"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-2xl font-bold text-green-700">{enabledWorkflows}</p>
              <p className="text-sm text-green-600">Active Workflows</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-2xl font-bold text-gray-700">{workflows.length - enabledWorkflows}</p>
              <p className="text-sm text-gray-600">Disabled</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-4 border border-purple-100">
              <p className="text-2xl font-bold text-purple-700">{workflows.length}</p>
              <p className="text-sm text-primary">Total Flows</p>
            </div>
          </div>
        </motion.div>
      )}


      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={settings}
          >
            <Card className="rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Link className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Webhook Configuration</h3>
                  <p className="text-sm text-gray-500">Connect Pucho workflows for automation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name={['webhookUrls', 'campaignManagement']}
                  label="Campaign Management (WF1)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item
                  name={['webhookUrls', 'leadTracking']}
                  label="Lead Tracking (WF2)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item
                  name={['webhookUrls', 'roiCalculator']}
                  label="ROI Calculator (WF3)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item
                  name={['webhookUrls', 'contentCalendar']}
                  label="Content Calendar (WF4)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item
                  name={['webhookUrls', 'broadcast']}
                  label="Broadcast (WF5)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item
                  name={['webhookUrls', 'dataSync']}
                  label="Data Sync (WF7)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item
                  name={['webhookUrls', 'onboarding']}
                  label="KYC Onboarding (WF11)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
                <Form.Item
                  name={['webhookUrls', 'testimonials']}
                  label="Testimonials (WF12)"
                >
                  <Input placeholder="https://..." size="large" />
                </Form.Item>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="primary" htmlType="submit" icon={<Save className="w-4 h-4" />} loading={saving}>
                  Save Webhooks
                </Button>
              </div>
            </Card>
          </Form>
        </motion.div>
      )}

      {/* Integrations Hub Tab */}
      {activeTab === 'integrations' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Integrations Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Columns - Settings */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-subtle border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <FlaskConical className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Lead Aggregator Configuration</h3>
                    <p className="text-sm text-gray-500">Configure multi-channel webhook listeners</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Meta Ads Integration */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        Facebook & Instagram Lead Ads
                      </h4>
                      <p className="text-xs text-gray-500">Capture leads from Facebook/Instagram forms in real-time</p>
                      <div className="mt-2 text-xs text-gray-400 font-mono">
                        Webhook URL: <span className="text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200 select-all cursor-pointer">https://studio.pucho.ai/api/v1/webhooks/tXsAclaOxsKMK24WhWTdR</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch 
                        checked={integrationSettings.meta} 
                        onChange={(checked) => updateIntegrationSettings({ meta: checked })} 
                      />
                      <span className="text-[10px] text-gray-400 font-medium">Verification Token: {integrationSettings.metaVerificationToken}</span>
                    </div>
                  </div>

                  {/* IndiaMART Integration */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-gray-900">IndiaMART Leads</h4>
                      <p className="text-xs text-gray-500">Ingest B2B marketplace leads automatically via CRM API key</p>
                      <div className="mt-2 flex gap-3 items-center">
                        <span className="text-xs text-gray-500">CRM Key:</span>
                        <Input.Password 
                          value={integrationSettings.indiamartApiKey} 
                          onChange={(e) => updateIntegrationSettings({ indiamartApiKey: e.target.value })} 
                          className="w-48 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <Switch 
                      checked={integrationSettings.indiamart} 
                      onChange={(checked) => updateIntegrationSettings({ indiamart: checked })} 
                    />
                  </div>

                  {/* TradeIndia Integration */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-gray-900">TradeIndia Leads</h4>
                      <p className="text-xs text-gray-500">Pull TradeIndia buy lead inquiries using trade credentials</p>
                      <div className="mt-2 flex gap-3 items-center">
                        <span className="text-xs text-gray-500">API Key:</span>
                        <Input.Password 
                          value={integrationSettings.tradeindiaApiKey} 
                          onChange={(e) => updateIntegrationSettings({ tradeindiaApiKey: e.target.value })} 
                          className="w-48 h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <Switch 
                      checked={integrationSettings.tradeindia} 
                      onChange={(checked) => updateIntegrationSettings({ tradeindia: checked })} 
                    />
                  </div>

                  {/* Google Forms Integration */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-gray-900">Google Forms</h4>
                      <p className="text-xs text-gray-500">Append leads submitted from custom landing page forms</p>
                      <div className="mt-2 text-xs text-gray-400 font-mono">
                        Webhook Endpoint: <span className="text-gray-600 bg-white px-1.5 py-0.5 rounded border border-gray-200 select-all cursor-pointer">https://api.pucho.ai/api/v1/leads/webhook</span>
                      </div>
                    </div>
                    <Switch 
                      checked={integrationSettings.google_forms} 
                      onChange={(checked) => updateIntegrationSettings({ google_forms: checked })} 
                    />
                  </div>

                  {/* WhatsApp Integration */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="font-semibold text-gray-900">WhatsApp Lead Capture</h4>
                      <p className="text-xs text-gray-500">Automatically register incoming customer messages as leads</p>
                    </div>
                    <Switch 
                      checked={integrationSettings.whatsapp} 
                      onChange={(checked) => updateIntegrationSettings({ whatsapp: checked })} 
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Simulator */}
            <div className="col-span-1">
              <Card className="shadow-subtle border border-gray-100 rounded-2xl h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Bug className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Simulator Panel</h3>
                    <p className="text-sm text-gray-500">Simulate incoming webhook events</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 space-y-2">
                    <p className="font-semibold">Bypassing Webhook Gateways</p>
                    <p>Triggering simulations tests deduplication algorithms, UTM parsers, and timeline drawer events locally.</p>
                  </div>

                  <button
                    onClick={() => {
                      simulateWebhookLead({
                        name: 'Aarav Mehta',
                        phone: '9811223344',
                        email: 'aarav.mehta@gmail.com',
                        source: 'Facebook Ads',
                        utm_source: 'facebook',
                        utm_medium: 'cpc',
                        utm_campaign: 'monsoon_clearance_sale',
                        utm_content: 'carousel_v1',
                        message: 'Interested in retail stock discounts.'
                      });
                      message.success('Simulated Meta Lead posted successfully!');
                    }}
                    className="w-full py-2.5 bg-primary hover:bg-[#4a211b] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    Simulate New Meta Lead (Aarav Mehta)
                  </button>

                  <button
                    onClick={() => {
                      simulateWebhookLead({
                        name: 'Aarav Mehta',
                        phone: '9811223344',
                        email: 'aarav.mehta@gmail.com',
                        source: 'Instagram Ads',
                        utm_source: 'instagram',
                        utm_medium: 'cpc',
                        utm_campaign: 'instagram_reengage_2026',
                        utm_content: 'image_ad_v2',
                        message: 'Re-submitting form on Instagram'
                      });
                      message.warning('Simulated Duplicate Lead posted!');
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    Simulate Duplicate Lead (Re-engages Aarav)
                  </button>

                  <button
                    onClick={() => {
                      simulateWebhookLead({
                        name: 'Karan Malhotra',
                        phone: '9900112233',
                        email: 'karan@malhotragroup.in',
                        source: 'IndiaMART',
                        utm_source: 'indiamart',
                        utm_medium: 'referral',
                        utm_campaign: 'enterprise_hvac',
                        message: 'Bulk HVAC enquiry for CP commercial building.'
                      });
                      message.success('Simulated IndiaMART Lead posted!');
                    }}
                    className="w-full py-2.5 bg-[#5d2a23]/80 hover:bg-[#5d2a23] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    Simulate IndiaMART Lead (Karan)
                  </button>

                  <button
                    onClick={() => {
                      simulateWebhookLead({
                        name: 'Simran Sethi',
                        phone: '9820011223',
                        email: 'simran.sethi@gmail.com',
                        source: 'Google Forms',
                        utm_source: 'google_forms',
                        utm_medium: 'organic',
                        utm_campaign: 'monsoon_clearance_sale',
                        message: 'Interested in festive schemes.'
                      });
                      message.success('Simulated Google Form Lead posted!');
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    Simulate Google Form Lead (Simran)
                  </button>
                </div>
              </Card>
            </div>
          </div>

          {/* Webhook logs */}
          <Card className="shadow-subtle border border-gray-100 rounded-2xl">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-400" />
              Live Ingestion & Webhook Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payload</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {integrationLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-900">
                        {log.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded select-all cursor-pointer" title={JSON.stringify(log.payload)}>
                          {log.payload.name} ({log.payload.phone})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' :
                          log.status === 'duplicate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {log.type || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Settings
