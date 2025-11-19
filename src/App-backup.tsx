import { useState, useEffect } from 'react'
import './App.css'
import { Shield, MapPin, Users, FileText, AlertTriangle, Activity, TrendingUp, Plus, Trash2, Download, QrCode, Bell, Mic } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface VoiceAnalysisResult {
  scam_probability: number
  manipulation_intensity: number
  script_classification: string | null
  urgency_score: number
  threat_detected: boolean
  manipulation_patterns: string[]
}

interface EmotionalAnalysisResult {
  stress_level: number
  confusion_level: number
  fear_level: number
  compliance_probability: number
  tone_instability: number
  victim_vulnerability: number
  manipulation_index: number
}

interface WalletRiskResult {
  risk_score: number
  risk_category: string
  risk_lineage_map: any
  known_scam_flags: string[]
  mixer_detected: boolean
  darknet_crossing: boolean
}

interface GPSCheckResult {
  risk_detected: boolean
  location_type: string | null
  risk_level: string
  alert_message: string
  distance_to_risk: number
}

interface InterventionResult {
  intervention_triggered: boolean
  actions: string[]
  alert_level: string
  family_notified: boolean
}

interface TrustedContact {
  id: string
  name: string
  relationship: string
  phone: string
  email: string
  active: boolean
  notifications: {
    highRiskCall: boolean
    atmProximity: boolean
    suspiciousWallet: boolean
    highManipulation: boolean
    freezeMode: boolean
  }
}

interface CaseFile {
  id: string
  date: string
  scamType: string
  riskScore: number
  walletAddress?: string
  transcript?: string
  location?: string
}

function App() {
  const [activeTab, setActiveTab] = useState('monitor')
  const [userId] = useState('demo-user-1')
  const [callText, setCallText] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [currentAddress, setCurrentAddress] = useState('')
  
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysisResult | null>(null)
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<EmotionalAnalysisResult | null>(null)
  const [walletRisk, setWalletRisk] = useState<WalletRiskResult | null>(null)
  const [gpsCheck, setGpsCheck] = useState<GPSCheckResult | null>(null)
  const [intervention, setIntervention] = useState<InterventionResult | null>(null)
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [freezeModeActive, setFreezeModeActive] = useState(false)
  
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([
    {
      id: 'contact-1',
      name: 'Emergency Contact',
      relationship: 'Family',
      phone: '+0987654321',
      email: 'emergency@example.com',
      active: true,
      notifications: {
        highRiskCall: true,
        atmProximity: true,
        suspiciousWallet: true,
        highManipulation: true,
        freezeMode: true
      }
    }
  ])
  const [showAddContact, setShowAddContact] = useState(false)
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: ''
  })
  
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([])

  useEffect(() => {
    fetchStats()
    createDemoUser()
  }, [])

  const createDemoUser = async () => {
    try {
      await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user-1',
          name: 'Demo User',
          phone_number: '+1234567890',
          device_id: 'device-demo',
          trusted_contacts: trustedContacts.map(c => ({
            contact_id: c.id,
            name: c.name,
            phone: c.phone
          }))
        })
      })
    } catch (error) {
      console.error('Error creating demo user:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const reverseGeocode = async (lat: number, lon: number) => {
    const mockAddresses: { [key: string]: string } = {
      '37.7749,-122.4194': '345 Market St, San Francisco, CA 94103',
      '40.7128,-74.0060': '725 Mission St, New York, NY 10001',
      '34.0522,-118.2437': '1234 Broadway, Los Angeles, CA 90015'
    }
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`
    return mockAddresses[key] || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
  }

  const analyzeVoice = async () => {
    if (!callText.trim()) return
    
    setIsMonitoring(true)
    const callId = `call-${Date.now()}`
    
    try {
      const response = await fetch(`${API_URL}/api/voice-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          user_id: userId,
          audio_text: callText
        })
      })
      const data = await response.json()
      setVoiceAnalysis(data)
      
      const emotionalResponse = await fetch(`${API_URL}/api/emotional-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          user_id: userId,
          audio_text: callText
        })
      })
      const emotionalData = await emotionalResponse.json()
      setEmotionalAnalysis(emotionalData)
      
      if (data.scam_probability >= 85 || emotionalData.manipulation_index >= 80) {
        const interventionResponse = await fetch(`${API_URL}/api/intervention`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            call_id: callId,
            user_id: userId,
            scam_probability: data.scam_probability,
            manipulation_index: emotionalData.manipulation_index
          })
        })
        const interventionData = await interventionResponse.json()
        setIntervention(interventionData)
        setFreezeModeActive(true)
        
        const newCase: CaseFile = {
          id: `case-${Date.now()}`,
          date: new Date().toLocaleString(),
          scamType: data.script_classification || 'Unknown',
          riskScore: data.scam_probability,
          transcript: callText
        }
        setCaseFiles(prev => [newCase, ...prev])
      }
      
      fetchStats()
    } catch (error) {
      console.error('Error analyzing voice:', error)
    }
  }

  const checkWalletRisk = async () => {
    if (!walletAddress.trim()) return
    
    try {
      const response = await fetch(`${API_URL}/api/wallet-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          user_id: userId
        })
      })
      const data = await response.json()
      setWalletRisk(data)
      
      if (data.risk_score >= 75) {
        const newCase: CaseFile = {
          id: `case-${Date.now()}`,
          date: new Date().toLocaleString(),
          scamType: 'Suspicious Wallet',
          riskScore: data.risk_score,
          walletAddress: walletAddress
        }
        setCaseFiles(prev => [newCase, ...prev])
      }
      
      fetchStats()
    } catch (error) {
      console.error('Error checking wallet:', error)
    }
  }

  const checkGPS = async () => {
    if (!latitude || !longitude) return
    
    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)
    
    const address = await reverseGeocode(lat, lon)
    setCurrentAddress(address)
    
    try {
      const response = await fetch(`${API_URL}/api/gps-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          latitude: lat,
          longitude: lon,
          call_id: isMonitoring ? `call-${Date.now()}` : null
        })
      })
      const data = await response.json()
      setGpsCheck(data)
      
      if (data.risk_detected && isMonitoring && voiceAnalysis && voiceAnalysis.scam_probability > 50) {
        setFreezeModeActive(true)
      }
      
      fetchStats()
    } catch (error) {
      console.error('Error checking GPS:', error)
    }
  }

  const activateManualFreezeMode = () => {
    setFreezeModeActive(true)
    trustedContacts.filter(c => c.active).forEach(contact => {
      console.log(`Notifying ${contact.name} at ${contact.phone}`)
    })
  }

  const deactivateFreezeMode = () => {
    setFreezeModeActive(false)
  }

  const addTrustedContact = () => {
    if (!newContact.name || !newContact.phone) return
    
    const contact: TrustedContact = {
      id: `contact-${Date.now()}`,
      name: newContact.name,
      relationship: newContact.relationship || 'Other',
      phone: newContact.phone,
      email: newContact.email,
      active: true,
      notifications: {
        highRiskCall: true,
        atmProximity: true,
        suspiciousWallet: true,
        highManipulation: true,
        freezeMode: true
      }
    }
    
    setTrustedContacts(prev => [...prev, contact])
    setNewContact({ name: '', relationship: '', phone: '', email: '' })
    setShowAddContact(false)
  }

  const removeContact = (id: string) => {
    setTrustedContacts(prev => prev.filter(c => c.id !== id))
  }

  const toggleContactActive = (id: string) => {
    setTrustedContacts(prev => prev.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    ))
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return '#EF4444' // Danger red
    if (score >= 50) return '#FBBF24' // Warning yellow
    if (score >= 25) return '#FBBF24' // Warning yellow
    return '#22C55E' // Success green
  }

  const getRiskBgColor = (score: number) => {
    if (score >= 75) return 'bg-[#EF4444]/20 border-[#EF4444]'
    if (score >= 50) return 'bg-[#FBBF24]/20 border-[#FBBF24]'
    if (score >= 25) return 'bg-[#FBBF24]/20 border-[#FBBF24]'
    return 'bg-[#22C55E]/20 border-[#22C55E]'
  }

  const getRiskLabel = (score: number) => {
    if (score >= 75) return '🟥 HIGH RISK'
    if (score >= 50) return '🟧 MEDIUM RISK'
    if (score >= 25) return '🟧 MEDIUM RISK'
    return '🟩 LOW RISK'
  }

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white">
      {/* Header */}
      <div className="border-b border-[#14B8A6]/30 bg-[#11243D]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-[#14B8A6]" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  CryptoShield Guardian AI
                </h1>
                <p className="text-base text-[#CFFAFE]">Bitcoin & Crypto Scam Detection Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Badge variant="outline" className="border-[#22C55E] text-[#22C55E] text-base px-4 py-2">
                <Activity className="w-4 h-4 mr-2" />
                ACTIVE
              </Badge>
              {stats && (
                <div className="text-base text-[#E2E8F0]">
                  {stats.total_call_events} Calls | {stats.total_wallet_checks} Wallets
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Freeze Mode Banner */}
      {freezeModeActive && (
        <div className="bg-[#7F1D1D] border-b-4 border-[#EF4444] py-4">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                <span className="text-xl font-bold text-white">🛑 FREEZE MODE ACTIVE - All Protections Engaged</span>
              </div>
              <Button 
                onClick={deactivateFreezeMode}
                className="bg-white text-[#7F1D1D] hover:bg-[#E2E8F0] font-bold h-12 px-6"
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-6 bg-[#11243D] border-2 border-[#14B8A6]/30 p-2 rounded-[14px]">
            <TabsTrigger 
              value="monitor" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] text-[#E2E8F0] font-bold text-lg h-14 rounded-[12px]"
            >
              <span className="mr-2">🎧</span>
              Monitor
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] text-[#E2E8F0] font-bold text-lg h-14 rounded-[12px]"
            >
              <span className="mr-2">🪙</span>
              Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="gps" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] text-[#E2E8F0] font-bold text-lg h-14 rounded-[12px]"
            >
              <span className="mr-2">📍</span>
              GPS
            </TabsTrigger>
            <TabsTrigger 
              value="family" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] text-[#E2E8F0] font-bold text-lg h-14 rounded-[12px]"
            >
              <span className="mr-2">👨‍👩‍👧‍👦</span>
              Family
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] text-[#E2E8F0] font-bold text-lg h-14 rounded-[12px]"
            >
              <span className="mr-2">📄</span>
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="emergency" 
              className="data-[state=active]:bg-[#EF4444] data-[state=active]:text-white text-[#E2E8F0] font-bold text-lg h-14 rounded-[12px]"
            >
              <span className="mr-2">🚨</span>
              Emergency
            </TabsTrigger>
          </TabsList>

          {/* MONITOR TAB */}
          <TabsContent value="monitor" className="space-y-8">
            <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] p-8 hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-6">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <span>🎧</span>
                  Real-Time Voice Protection
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-lg mt-2">
                  AI-powered scam detection and emotional manipulation analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white text-lg font-medium mb-3 block">Call Transcript / Audio Text</label>
                  <div className="relative">
                    <Mic className="absolute left-4 top-4 w-5 h-5 text-[#A1A1AA]" />
                    <Textarea
                      value={callText}
                      onChange={(e) => setCallText(e.target.value)}
                      placeholder="Enter call transcript or paste conversation text here..."
                      className="min-h-40 bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-lg pl-12 rounded-[10px] leading-relaxed"
                      style={{ lineHeight: '1.6' }}
                    />
                  </div>
                </div>
                <Button 
                  onClick={analyzeVoice}
                  className="w-full bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-lg h-14 rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <Activity className="w-5 h-5 mr-2" />
                  Analyze Call
                </Button>

                {voiceAnalysis && (
                  <div className="space-y-6 mt-8">
                    <Alert className={`${getRiskBgColor(voiceAnalysis.scam_probability)} border-2 p-6 rounded-[14px] ${voiceAnalysis.scam_probability >= 75 ? 'pulse-glow' : ''}`}>
                      <AlertTriangle className="h-6 w-6" style={{ color: getRiskColor(voiceAnalysis.scam_probability) }} />
                      <AlertTitle className="text-white text-2xl font-bold">
                        Scam Probability: {voiceAnalysis.scam_probability.toFixed(1)}%
                      </AlertTitle>
                      <AlertDescription className="space-y-4 mt-4">
                        <div className="flex items-center gap-3">
                          <span className="text-white text-lg">Script Type:</span>
                          <Badge variant="outline" className="border-[#14B8A6] text-[#14B8A6] text-base px-3 py-1">
                            {voiceAnalysis.script_classification || 'Unknown'}
                          </Badge>
                        </div>
                        <Progress value={voiceAnalysis.scam_probability} className="h-4" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="text-lg">
                            <span className="text-[#CFFAFE]">Urgency:</span> <span className="text-white font-bold">{voiceAnalysis.urgency_score.toFixed(0)}%</span>
                          </div>
                          <div className="text-lg">
                            <span className="text-[#CFFAFE]">Manipulation:</span> <span className="text-white font-bold">{voiceAnalysis.manipulation_intensity.toFixed(0)}%</span>
                          </div>
                        </div>
                        {voiceAnalysis.manipulation_patterns.length > 0 && (
                          <div className="mt-4">
                            <div className="text-lg text-[#CFFAFE] mb-2">Detected Patterns:</div>
                            <div className="flex flex-wrap gap-2">
                              {voiceAnalysis.manipulation_patterns.map((pattern, idx) => (
                                <Badge key={idx} variant="secondary" className="text-base px-3 py-1">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>

                    {emotionalAnalysis && (
                      <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px] p-6">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-[#CFFAFE] text-xl font-bold">Emotional Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <div className="text-base text-[#CFFAFE] mb-2">Stress Level</div>
                              <Progress value={emotionalAnalysis.stress_level} className="h-3" />
                              <div className="text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.stress_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-base text-[#CFFAFE] mb-2">Fear Level</div>
                              <Progress value={emotionalAnalysis.fear_level} className="h-3" />
                              <div className="text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.fear_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-base text-[#CFFAFE] mb-2">Confusion</div>
                              <Progress value={emotionalAnalysis.confusion_level} className="h-3" />
                              <div className="text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.confusion_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-base text-[#CFFAFE] mb-2">Vulnerability</div>
                              <Progress value={emotionalAnalysis.victim_vulnerability} className="h-3" />
                              <div className="text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.victim_vulnerability.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <Alert className={`${getRiskBgColor(emotionalAnalysis.manipulation_index)} border-2 mt-6 p-4 rounded-[14px]`}>
                            <TrendingUp className="h-5 w-5" style={{ color: getRiskColor(emotionalAnalysis.manipulation_index) }} />
                            <AlertTitle className="text-white text-lg font-bold">
                              Manipulation Index: {emotionalAnalysis.manipulation_index.toFixed(1)}%
                            </AlertTitle>
                          </Alert>
                        </CardContent>
                      </Card>
                    )}

                    {intervention && intervention.intervention_triggered && (
                      <Alert className="bg-[#EF4444]/20 border-[#EF4444] border-2 p-6 rounded-[14px] pulse-glow">
                        <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                        <AlertTitle className="text-[#EF4444] font-bold text-2xl">
                          INTERVENTION TRIGGERED - {intervention.alert_level.toUpperCase()}
                        </AlertTitle>
                        <AlertDescription className="space-y-4 mt-4">
                          <div className="text-lg text-white">
                            Protective actions activated:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {intervention.actions.map((action, idx) => (
                              <Badge key={idx} className="bg-[#EF4444] text-white text-base px-3 py-1">
                                {action.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                          {intervention.family_notified && (
                            <div className="text-lg text-white font-bold mt-4">
                              ✅ Emergency contacts have been notified!
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* WALLET TAB */}
          <TabsContent value="wallet" className="space-y-8">
            <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] p-8 hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-6">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <span>🪙</span>
                  Bitcoin Wallet Risk Engine
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-lg mt-2">
                  Blockchain intelligence and scam wallet detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white text-lg font-medium mb-3 block">Wallet Address</label>
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter Bitcoin wallet address..."
                    className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-lg h-14 rounded-[10px]"
                  />
                </div>
                <Button 
                  onClick={checkWalletRisk}
                  className="w-full bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-lg h-14 rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Check Wallet Risk
                </Button>

                <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                  <div className="text-lg text-[#CFFAFE] mb-2">Test Wallet (Known Scam):</div>
                  <div className="text-base text-[#14B8A6] font-mono">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</div>
                </div>

                {walletRisk && (
                  <div className="space-y-6 mt-8">
                    <Alert className={`${getRiskBgColor(walletRisk.risk_score)} border-2 p-6 rounded-[14px] ${walletRisk.risk_score >= 75 ? 'pulse-glow' : ''}`}>
                      <AlertTriangle className="h-6 w-6" style={{ color: getRiskColor(walletRisk.risk_score) }} />
                      <AlertTitle className="text-white text-2xl font-bold">
                        Risk Score: {walletRisk.risk_score.toFixed(1)}% - {walletRisk.risk_category.toUpperCase()}
                      </AlertTitle>
                      <AlertDescription className="space-y-4 mt-4">
                        <div className="text-xl font-bold text-white mb-4">
                          {getRiskLabel(walletRisk.risk_score)}
                        </div>
                        <Progress value={walletRisk.risk_score} className="h-4" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="text-lg">
                            <span className="text-[#CFFAFE]">Mixer Detected:</span> <span className="text-white font-bold">{walletRisk.mixer_detected ? 'YES' : 'NO'}</span>
                          </div>
                          <div className="text-lg">
                            <span className="text-[#CFFAFE]">Darknet:</span> <span className="text-white font-bold">{walletRisk.darknet_crossing ? 'YES' : 'NO'}</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {walletRisk.known_scam_flags.length > 0 && (
                      <Card className="bg-[#EF4444]/10 border-[#EF4444]/50 border-2 rounded-[14px] p-6">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-[#EF4444] text-xl font-bold">Known Scam Flags</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {walletRisk.known_scam_flags.map((flag, idx) => (
                              <div key={idx} className="text-lg text-white flex items-center gap-3 bg-[#EF4444]/20 p-3 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                                {flag}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px] p-6">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-[#CFFAFE] text-xl font-bold">Wallet Lineage Map</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6 text-lg">
                          <div>
                            <span className="text-[#CFFAFE]">Transactions:</span>{' '}
                            <span className="font-bold text-white">{walletRisk.risk_lineage_map.transaction_count}</span>
                          </div>
                          <div>
                            <span className="text-[#CFFAFE]">Received:</span>{' '}
                            <span className="font-bold text-white">{walletRisk.risk_lineage_map.total_received_btc} BTC</span>
                          </div>
                          <div>
                            <span className="text-[#CFFAFE]">Sent:</span>{' '}
                            <span className="font-bold text-white">{walletRisk.risk_lineage_map.total_sent_btc} BTC</span>
                          </div>
                          <div>
                            <span className="text-[#CFFAFE]">Parent Wallets:</span>{' '}
                            <span className="font-bold text-white">{walletRisk.risk_lineage_map.parent_wallets?.length || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GPS TAB - Enhanced with Address Conversion */}
          <TabsContent value="gps" className="space-y-8">
            <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] p-8 hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-6">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <span>📍</span>
                  GPS Anti-Scam Shield
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-lg mt-2">
                  Location-based fraud prevention with Bitcoin ATM detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-white text-lg font-medium mb-3 block">Latitude</label>
                    <Input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="37.7749"
                      className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-lg h-14 rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-white text-lg font-medium mb-3 block">Longitude</label>
                    <Input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="-122.4194"
                      className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-lg h-14 rounded-[10px]"
                    />
                  </div>
                </div>
                
                {currentAddress && (
                  <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                    <div className="text-lg text-[#CFFAFE] mb-2">Current Location:</div>
                    <div className="text-xl text-white font-bold flex items-center gap-2">
                      <span>📍</span>
                      {currentAddress}
                    </div>
                    <div className="text-base text-[#A1A1AA] mt-1">
                      (Detected from {latitude}, {longitude})
                    </div>
                  </div>
                )}

                <Button 
                  onClick={checkGPS}
                  className="w-full bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-lg h-14 rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Check Location
                </Button>

                <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                  <div className="text-lg text-[#CFFAFE] mb-3">Test Locations:</div>
                  <div className="space-y-2 text-base">
                    <div className="text-white">🏧 San Francisco Bitcoin ATM: 37.7749, -122.4194</div>
                    <div className="text-white">🏧 New York Bitcoin ATM: 40.7128, -74.0060</div>
                    <div className="text-white">🏧 Los Angeles Bitcoin ATM: 34.0522, -118.2437</div>
                  </div>
                </div>

                {gpsCheck && (
                  <div className="space-y-6 mt-8">
                    {gpsCheck.risk_detected ? (
                      <>
                        <Alert className="bg-[#EF4444]/20 border-[#EF4444] border-2 p-6 rounded-[14px] pulse-glow">
                          <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                          <AlertTitle className="text-[#EF4444] font-bold text-2xl">
                            {gpsCheck.alert_message}
                          </AlertTitle>
                          <AlertDescription className="space-y-4 mt-4">
                            <div className="text-xl text-white font-bold">
                              Nearest Bitcoin ATM:
                            </div>
                            <div className="text-lg text-white flex items-center gap-2">
                              <span>📍</span>
                              {currentAddress || 'Location detected'}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="text-lg text-white">
                                <span className="text-[#CFFAFE]">Location Type:</span>{' '}
                                <span className="font-bold">{gpsCheck.location_type?.replace(/_/g, ' ').toUpperCase()}</span>
                              </div>
                              <div className="text-lg text-white">
                                <span className="text-[#CFFAFE]">Distance:</span> <span className="font-bold">{(gpsCheck.distance_to_risk * 3280.84).toFixed(0)} feet</span>
                              </div>
                            </div>
                            <div className="text-lg text-white font-bold mt-4">
                              Risk Level: {gpsCheck.risk_level.toUpperCase()}
                            </div>
                          </AlertDescription>
                        </Alert>

                        {isMonitoring && voiceAnalysis && voiceAnalysis.scam_probability > 50 && (
                          <Alert className="bg-[#7F1D1D] border-[#EF4444] border-4 p-6 rounded-[14px] pulse-glow">
                            <AlertTriangle className="h-8 w-8 text-white animate-pulse" />
                            <AlertTitle className="text-white font-bold text-3xl">
                              🟥 DANGER — You are near a Bitcoin ATM during a suspicious call.
                            </AlertTitle>
                            <AlertDescription className="text-white text-2xl font-bold mt-4">
                              STOP IMMEDIATELY.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    ) : (
                      <Alert className="bg-[#22C55E]/20 border-[#22C55E] border-2 p-6 rounded-[14px]">
                        <Shield className="h-6 w-6 text-[#22C55E]" />
                        <AlertTitle className="text-[#22C55E] font-bold text-2xl">
                          No High-Risk Locations Detected
                        </AlertTitle>
                        <AlertDescription className="text-white text-lg mt-2">
                          {gpsCheck.alert_message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAMILY TAB - Full Contact Management */}
          <TabsContent value="family" className="space-y-8">
            <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] p-8 hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-6">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <span>👨‍👩‍👧‍👦</span>
                  Family Guardian Mode
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-lg mt-2">
                  Trusted contacts and emergency notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-[#14B8A6]/10 border-[#14B8A6]/50 border-2 p-6 rounded-[14px]">
                  <Users className="h-6 w-6 text-[#14B8A6]" />
                  <AlertTitle className="text-[#14B8A6] text-xl font-bold">Trusted Contacts</AlertTitle>
                  <AlertDescription className="text-white text-lg mt-2">
                    Your trusted contacts will be notified when high-risk scam activity is detected.
                  </AlertDescription>
                </Alert>

                {/* Contacts List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white text-xl font-bold">Emergency Contacts</h3>
                    <Button 
                      onClick={() => setShowAddContact(!showAddContact)}
                      className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold h-12 px-6 rounded-[12px]"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Contact
                    </Button>
                  </div>

                  {showAddContact && (
                    <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px] p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-white text-base font-medium mb-2 block">Full Name *</label>
                          <Input
                            value={newContact.name}
                            onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                            placeholder="Enter full name"
                            className="bg-[#132B45] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] h-12 rounded-[10px]"
                          />
                        </div>
                        <div>
                          <label className="text-white text-base font-medium mb-2 block">Relationship</label>
                          <Input
                            value={newContact.relationship}
                            onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                            placeholder="Spouse, Child, Sibling, etc."
                            className="bg-[#132B45] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] h-12 rounded-[10px]"
                          />
                        </div>
                        <div>
                          <label className="text-white text-base font-medium mb-2 block">Phone *</label>
                          <Input
                            value={newContact.phone}
                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                            placeholder="+1234567890"
                            className="bg-[#132B45] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] h-12 rounded-[10px]"
                          />
                        </div>
                        <div>
                          <label className="text-white text-base font-medium mb-2 block">Email</label>
                          <Input
                            value={newContact.email}
                            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                            placeholder="email@example.com"
                            className="bg-[#132B45] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] h-12 rounded-[10px]"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={addTrustedContact}
                            className="flex-1 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold h-12 rounded-[12px]"
                          >
                            Save Contact
                          </Button>
                          <Button 
                            onClick={() => setShowAddContact(false)}
                            className="flex-1 bg-[#132B45] hover:bg-[#11243D] text-white font-bold h-12 rounded-[12px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {trustedContacts.map(contact => (
                    <div key={contact.id} className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-xl font-bold text-white">{contact.name}</div>
                            <Badge 
                              variant="outline" 
                              className={`${contact.active ? 'border-[#22C55E] text-[#22C55E]' : 'border-[#A1A1AA] text-[#A1A1AA]'} text-base px-3 py-1`}
                            >
                              {contact.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-base text-[#CFFAFE]">{contact.relationship}</div>
                          <div className="text-base text-[#E2E8F0] mt-1">{contact.phone}</div>
                          {contact.email && <div className="text-base text-[#E2E8F0]">{contact.email}</div>}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => toggleContactActive(contact.id)}
                            className="bg-[#132B45] hover:bg-[#11243D] text-white h-10 w-10 p-0 rounded-[10px]"
                          >
                            <Bell className="w-5 h-5" />
                          </Button>
                          <Button 
                            onClick={() => removeContact(contact.id)}
                            className="bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] h-10 w-10 p-0 rounded-[10px]"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notification Triggers */}
                <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                  <div className="text-lg text-[#CFFAFE] font-bold mb-4">Notification Triggers:</div>
                  <div className="space-y-3 text-base leading-relaxed">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">High-risk scam call detected (scam probability &gt; 85%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">User approaching Bitcoin ATM during suspicious call</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">Suspicious wallet address entered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">High manipulation index detected</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">Emergency Freeze Mode activation</span>
                    </div>
                  </div>
                </div>

                {/* Notification Log */}
                {intervention && intervention.family_notified && (
                  <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                    <div className="text-lg text-[#CFFAFE] font-bold mb-4">Recent Notifications:</div>
                    <div className="space-y-2 text-base">
                      {trustedContacts.filter(c => c.active).map(contact => (
                        <div key={contact.id} className="text-white">
                          📅 {new Date().toLocaleTimeString()} – High-risk call alert sent to {contact.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS TAB - Evidence Locker */}
          <TabsContent value="reports" className="space-y-8">
            <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] p-8 hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-6">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <span>📄</span>
                  Evidence Locker
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-lg mt-2">
                  Case files and reports for law enforcement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-[#14B8A6]/10 border-[#14B8A6]/50 border-2 p-6 rounded-[14px]">
                  <FileText className="h-6 w-6 text-[#14B8A6]" />
                  <AlertTitle className="text-[#14B8A6] text-xl font-bold">Evidence Case Builder</AlertTitle>
                  <AlertDescription className="text-white text-lg mt-2">
                    All scam detection events are automatically documented with transcripts, wallet addresses, GPS traces, and emotional analysis graphs.
                  </AlertDescription>
                </Alert>

                {/* Case Files */}
                {caseFiles.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-white text-xl font-bold">Case Files</h3>
                    {caseFiles.map(caseFile => (
                      <Card key={caseFile.id} className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px] p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">📁</span>
                              <div className="text-xl font-bold text-white">Case #{caseFile.id.split('-')[1]}</div>
                            </div>
                            <div className="text-base text-[#CFFAFE] mb-1">Date: {caseFile.date}</div>
                            <div className="text-base text-[#CFFAFE] mb-1">Scam Type: {caseFile.scamType}</div>
                            <div className="text-base text-[#CFFAFE] mb-1">Risk: {caseFile.riskScore.toFixed(0)}%</div>
                            {caseFile.walletAddress && (
                              <div className="text-base text-[#CFFAFE] font-mono">Wallet: {caseFile.walletAddress}</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold h-12 px-6 rounded-[12px]"
                            >
                              <Download className="w-5 h-5 mr-2" />
                              PDF
                            </Button>
                            <Button 
                              className="bg-[#132B45] hover:bg-[#11243D] text-white font-bold h-12 px-6 rounded-[12px]"
                            >
                              <QrCode className="w-5 h-5 mr-2" />
                              QR
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-8 text-center">
                    <div className="text-lg text-[#A1A1AA]">No case files yet. Cases are automatically created when high-risk activity is detected.</div>
                  </div>
                )}

                {/* Report Includes */}
                <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                  <div className="text-lg text-[#CFFAFE] font-bold mb-4">Report Includes:</div>
                  <div className="space-y-3 text-base leading-relaxed">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">Complete call transcript</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">Wallet addresses and blockchain analysis</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">GPS location trace</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">Emotional manipulation graph</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">Scam script fingerprint</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#14B8A6] rounded-full"></div>
                      <span className="text-white">Chain-of-custody verification</span>
                    </div>
                  </div>
                </div>

                {/* Evidence Retention Notice */}
                <Alert className="bg-[#FBBF24]/10 border-[#FBBF24]/50 border-2 p-6 rounded-[14px]">
                  <AlertTriangle className="h-6 w-6 text-[#FBBF24]" />
                  <AlertTitle className="text-[#FBBF24] text-xl font-bold">Evidence Retention</AlertTitle>
                  <AlertDescription className="text-white text-lg mt-2">
                    🕒 Evidence retained for 180 days (auto-delete).
                  </AlertDescription>
                </Alert>

                {/* Activity Stats */}
                {stats && stats.total_call_events > 0 && (
                  <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                    <div className="text-lg text-[#CFFAFE] font-bold mb-4">Activity Statistics:</div>
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-3xl font-bold text-[#14B8A6]">{stats.total_call_events}</div>
                        <div className="text-base text-[#CFFAFE] mt-1">Calls Analyzed</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-[#14B8A6]">{stats.total_wallet_checks}</div>
                        <div className="text-base text-[#CFFAFE] mt-1">Wallets Checked</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-[#14B8A6]">{stats.total_gps_alerts}</div>
                        <div className="text-base text-[#CFFAFE] mt-1">GPS Alerts</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMERGENCY TAB - Hybrid Freeze Mode */}
          <TabsContent value="emergency" className="space-y-8">
            <Card className="bg-[#7F1D1D] border-[#EF4444]/50 border-2 rounded-[14px] p-8">
              <CardHeader className="pb-6">
                <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                  <span>🚨</span>
                  Emergency Freeze Mode
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-lg mt-2">
                  Immediate protective actions when critical threat detected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Manual Panic Button */}
                <div className="text-center">
                  <Button 
                    onClick={activateManualFreezeMode}
                    disabled={freezeModeActive}
                    className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-2xl h-24 px-12 rounded-[14px] shadow-[0_0_20px_#EF4444] disabled:opacity-50"
                  >
                    <AlertTriangle className="w-8 h-8 mr-3" />
                    🛑 ACTIVATE FREEZE MODE
                  </Button>
                  <div className="text-white text-base mt-4">
                    Press to manually trigger all protective actions
                  </div>
                </div>

                {/* Auto-Intervention Info */}
                <Alert className="bg-[#EF4444]/20 border-[#EF4444] border-2 p-6 rounded-[14px]">
                  <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
                  <AlertTitle className="text-[#EF4444] font-bold text-xl">
                    Automatic Activation
                  </AlertTitle>
                  <AlertDescription className="text-white text-lg mt-2 leading-relaxed">
                    Freeze Mode automatically triggers when:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Scam Probability ≥ 85%</li>
                      <li>Manipulation Index ≥ 80%</li>
                      <li>User approaching Bitcoin ATM during suspicious call</li>
                      <li>High-risk wallet entered</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Emergency Actions */}
                <div className="bg-[#132B45] border-2 border-[#EF4444]/30 rounded-[14px] p-6">
                  <div className="text-lg text-[#EF4444] font-bold mb-4 flex items-center gap-2">
                    <span>🔴</span>
                    Emergency Actions:
                  </div>
                  <div className="space-y-3 text-base leading-relaxed">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#EF4444] rounded-full"></div>
                      <span className="text-white">🔕 Vibrate phone to alert user</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#EF4444] rounded-full"></div>
                      <span className="text-white">🛑 Display blocking overlay with warning</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#EF4444] rounded-full"></div>
                      <span className="text-white">📵 Offer auto-hang up option</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#EF4444] rounded-full"></div>
                      <span className="text-white">🔐 Lock crypto wallet apps</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#EF4444] rounded-full"></div>
                      <span className="text-white">⏳ Delay money transfer operations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#EF4444] rounded-full"></div>
                      <span className="text-white">📲 Notify emergency contacts immediately</span>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-[#132B45] border-2 border-[#14B8A6]/30 rounded-[14px] p-6">
                  <div className="text-lg text-[#CFFAFE] font-bold mb-4">System Status:</div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-base">Voice Analysis Engine</span>
                      <Badge variant="outline" className="border-[#22C55E] text-[#22C55E] text-base px-3 py-1">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-base">Emotional AI Engine</span>
                      <Badge variant="outline" className="border-[#22C55E] text-[#22C55E] text-base px-3 py-1">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-base">Wallet Risk Engine</span>
                      <Badge variant="outline" className="border-[#22C55E] text-[#22C55E] text-base px-3 py-1">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-base">GPS Shield</span>
                      <Badge variant="outline" className="border-[#22C55E] text-[#22C55E] text-base px-3 py-1">Online</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
