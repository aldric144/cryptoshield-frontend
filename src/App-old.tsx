import { useState, useEffect } from 'react'
import './App.css'
import { Shield, Phone, MapPin, Wallet, Users, FileText, AlertTriangle, Activity, TrendingUp, Lock } from 'lucide-react'
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

function App() {
  const [activeTab, setActiveTab] = useState('monitor')
  const [userId] = useState('demo-user-1')
  const [callText, setCallText] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysisResult | null>(null)
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<EmotionalAnalysisResult | null>(null)
  const [walletRisk, setWalletRisk] = useState<WalletRiskResult | null>(null)
  const [gpsCheck, setGpsCheck] = useState<GPSCheckResult | null>(null)
  const [intervention, setIntervention] = useState<InterventionResult | null>(null)
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [stats, setStats] = useState<any>(null)

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
          trusted_contacts: [
            { contact_id: 'contact-1', name: 'Emergency Contact', phone: '+0987654321' }
          ]
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
      
      if (data.scam_probability >= 40 || emotionalData.manipulation_index >= 40) {
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
      fetchStats()
    } catch (error) {
      console.error('Error checking wallet:', error)
    }
  }

  const checkGPS = async () => {
    if (!latitude || !longitude) return
    
    try {
      const response = await fetch(`${API_URL}/api/gps-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          call_id: isMonitoring ? `call-${Date.now()}` : null
        })
      })
      const data = await response.json()
      setGpsCheck(data)
      fetchStats()
    } catch (error) {
      console.error('Error checking GPS:', error)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 75) return 'text-red-500'
    if (score >= 50) return 'text-orange-500'
    if (score >= 25) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getRiskBgColor = (score: number) => {
    if (score >= 75) return 'bg-red-500/20 border-red-500'
    if (score >= 50) return 'bg-orange-500/20 border-orange-500'
    if (score >= 25) return 'bg-yellow-500/20 border-yellow-500'
    return 'bg-green-500/20 border-green-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="border-b border-cyan-500/30 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  CryptoShield Guardian AI
                </h1>
                <p className="text-xs text-cyan-400/70">Bitcoin & Crypto Scam Detection Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                <Activity className="w-3 h-3 mr-1" />
                ACTIVE
              </Badge>
              {stats && (
                <div className="text-xs text-cyan-400/70">
                  {stats.total_call_events} Calls | {stats.total_wallet_checks} Wallets
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 bg-slate-800/50 border border-cyan-500/30">
            <TabsTrigger value="monitor" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Phone className="w-4 h-4 mr-2" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Wallet className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="gps" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <MapPin className="w-4 h-4 mr-2" />
              GPS
            </TabsTrigger>
            <TabsTrigger value="family" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <Users className="w-4 h-4 mr-2" />
              Family
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="emergency" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
              <Lock className="w-4 h-4 mr-2" />
              Emergency
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Real-Time Voice Protection
                </CardTitle>
                <CardDescription className="text-cyan-400/70">
                  AI-powered scam detection and emotional manipulation analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-cyan-400/70 mb-2 block">Call Transcript / Audio Text</label>
                  <Textarea
                    value={callText}
                    onChange={(e) => setCallText(e.target.value)}
                    placeholder="Enter call transcript or paste conversation text here..."
                    className="min-h-32 bg-slate-900/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button 
                  onClick={analyzeVoice}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Analyze Call
                </Button>

                {voiceAnalysis && (
                  <div className="space-y-4 mt-6">
                    <Alert className={`${getRiskBgColor(voiceAnalysis.scam_probability)} border-2 ${voiceAnalysis.scam_probability >= 75 ? 'pulse-glow' : ''}`}>
                      <AlertTriangle className="h-5 w-5" />
                      <AlertTitle className="text-lg font-bold">
                        Scam Probability: {voiceAnalysis.scam_probability.toFixed(1)}%
                      </AlertTitle>
                      <AlertDescription className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Script Type:</span>
                          <Badge variant="outline" className="border-cyan-500">
                            {voiceAnalysis.script_classification || 'Unknown'}
                          </Badge>
                        </div>
                        <Progress value={voiceAnalysis.scam_probability} className="h-3" />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm">
                            <span className="text-cyan-400/70">Urgency:</span> {voiceAnalysis.urgency_score.toFixed(0)}%
                          </div>
                          <div className="text-sm">
                            <span className="text-cyan-400/70">Manipulation:</span> {voiceAnalysis.manipulation_intensity.toFixed(0)}%
                          </div>
                        </div>
                        {voiceAnalysis.manipulation_patterns.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-cyan-400/70 mb-1">Detected Patterns:</div>
                            <div className="flex flex-wrap gap-1">
                              {voiceAnalysis.manipulation_patterns.map((pattern, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>

                    {emotionalAnalysis && (
                      <Card className="bg-slate-900/50 border-cyan-500/30">
                        <CardHeader>
                          <CardTitle className="text-cyan-400 text-lg">Emotional Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-cyan-400/70 mb-1">Stress Level</div>
                              <Progress value={emotionalAnalysis.stress_level} className="h-2" />
                              <div className={`text-sm font-bold ${getRiskColor(emotionalAnalysis.stress_level)}`}>
                                {emotionalAnalysis.stress_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-cyan-400/70 mb-1">Fear Level</div>
                              <Progress value={emotionalAnalysis.fear_level} className="h-2" />
                              <div className={`text-sm font-bold ${getRiskColor(emotionalAnalysis.fear_level)}`}>
                                {emotionalAnalysis.fear_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-cyan-400/70 mb-1">Confusion</div>
                              <Progress value={emotionalAnalysis.confusion_level} className="h-2" />
                              <div className={`text-sm font-bold ${getRiskColor(emotionalAnalysis.confusion_level)}`}>
                                {emotionalAnalysis.confusion_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-cyan-400/70 mb-1">Vulnerability</div>
                              <Progress value={emotionalAnalysis.victim_vulnerability} className="h-2" />
                              <div className={`text-sm font-bold ${getRiskColor(emotionalAnalysis.victim_vulnerability)}`}>
                                {emotionalAnalysis.victim_vulnerability.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <Alert className={`${getRiskBgColor(emotionalAnalysis.manipulation_index)} border-2 mt-4`}>
                            <TrendingUp className="h-4 w-4" />
                            <AlertTitle className="text-sm font-bold">
                              Manipulation Index: {emotionalAnalysis.manipulation_index.toFixed(1)}%
                            </AlertTitle>
                          </Alert>
                        </CardContent>
                      </Card>
                    )}

                    {intervention && intervention.intervention_triggered && (
                      <Alert className="bg-red-500/20 border-red-500 border-2 pulse-glow">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <AlertTitle className="text-red-400 font-bold text-lg">
                          INTERVENTION TRIGGERED - {intervention.alert_level.toUpperCase()}
                        </AlertTitle>
                        <AlertDescription className="space-y-2">
                          <div className="text-sm text-red-300">
                            Protective actions activated:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {intervention.actions.map((action, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {action.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                          {intervention.family_notified && (
                            <div className="text-sm text-red-300 font-bold mt-2">
                              Emergency contacts have been notified!
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

          <TabsContent value="wallet" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Bitcoin Wallet Risk Engine
                </CardTitle>
                <CardDescription className="text-cyan-400/70">
                  Blockchain intelligence and scam wallet detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-cyan-400/70 mb-2 block">Wallet Address</label>
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter Bitcoin wallet address..."
                    className="bg-slate-900/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                  />
                </div>
                <Button 
                  onClick={checkWalletRisk}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Check Wallet Risk
                </Button>

                <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-sm text-cyan-400/70 mb-2">Test Wallet (Known Scam):</div>
                  <div className="text-xs text-cyan-400 font-mono">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</div>
                </div>

                {walletRisk && (
                  <div className="space-y-4 mt-6">
                    <Alert className={`${getRiskBgColor(walletRisk.risk_score)} border-2 ${walletRisk.risk_score >= 75 ? 'pulse-glow' : ''}`}>
                      <AlertTriangle className="h-5 w-5" />
                      <AlertTitle className="text-lg font-bold">
                        Risk Score: {walletRisk.risk_score.toFixed(1)}% - {walletRisk.risk_category.toUpperCase()}
                      </AlertTitle>
                      <AlertDescription className="space-y-2">
                        <Progress value={walletRisk.risk_score} className="h-3" />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm">
                            <span className="text-cyan-400/70">Mixer Detected:</span> {walletRisk.mixer_detected ? 'YES' : 'NO'}
                          </div>
                          <div className="text-sm">
                            <span className="text-cyan-400/70">Darknet:</span> {walletRisk.darknet_crossing ? 'YES' : 'NO'}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {walletRisk.known_scam_flags.length > 0 && (
                      <Card className="bg-red-500/10 border-red-500/50">
                        <CardHeader>
                          <CardTitle className="text-red-400 text-lg">Known Scam Flags</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {walletRisk.known_scam_flags.map((flag, idx) => (
                              <div key={idx} className="text-sm text-red-300 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                {flag}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="bg-slate-900/50 border-cyan-500/30">
                      <CardHeader>
                        <CardTitle className="text-cyan-400 text-lg">Wallet Lineage Map</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-cyan-400/70">Transactions:</span>{' '}
                            <span className="font-bold">{walletRisk.risk_lineage_map.transaction_count}</span>
                          </div>
                          <div>
                            <span className="text-cyan-400/70">Received:</span>{' '}
                            <span className="font-bold">{walletRisk.risk_lineage_map.total_received_btc} BTC</span>
                          </div>
                          <div>
                            <span className="text-cyan-400/70">Sent:</span>{' '}
                            <span className="font-bold">{walletRisk.risk_lineage_map.total_sent_btc} BTC</span>
                          </div>
                          <div>
                            <span className="text-cyan-400/70">Parent Wallets:</span>{' '}
                            <span className="font-bold">{walletRisk.risk_lineage_map.parent_wallets?.length || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gps" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  GPS Anti-Scam Shield
                </CardTitle>
                <CardDescription className="text-cyan-400/70">
                  Location-based fraud prevention and Bitcoin ATM detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-cyan-400/70 mb-2 block">Latitude</label>
                    <Input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="37.7749"
                      className="bg-slate-900/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-cyan-400/70 mb-2 block">Longitude</label>
                    <Input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="-122.4194"
                      className="bg-slate-900/50 border-cyan-500/30 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
                <Button 
                  onClick={checkGPS}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Check Location
                </Button>

                <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-sm text-cyan-400/70 mb-2">Test Locations:</div>
                  <div className="space-y-1 text-xs">
                    <div className="text-cyan-400">San Francisco Bitcoin ATM: 37.7749, -122.4194</div>
                    <div className="text-cyan-400">New York Bitcoin ATM: 40.7128, -74.0060</div>
                    <div className="text-cyan-400">Los Angeles Bitcoin ATM: 34.0522, -118.2437</div>
                  </div>
                </div>

                {gpsCheck && (
                  <div className="space-y-4 mt-6">
                    {gpsCheck.risk_detected ? (
                      <Alert className="bg-red-500/20 border-red-500 border-2 pulse-glow">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <AlertTitle className="text-red-400 font-bold text-lg">
                          {gpsCheck.alert_message}
                        </AlertTitle>
                        <AlertDescription className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="text-sm text-red-300">
                              <span className="text-red-400/70">Location Type:</span>{' '}
                              {gpsCheck.location_type?.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-red-300">
                              <span className="text-red-400/70">Distance:</span> {gpsCheck.distance_to_risk.toFixed(2)} km
                            </div>
                          </div>
                          <div className="text-sm text-red-300 font-bold mt-2">
                            Risk Level: {gpsCheck.risk_level.toUpperCase()}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-green-500/20 border-green-500">
                        <Shield className="h-5 w-5 text-green-400" />
                        <AlertTitle className="text-green-400 font-bold">
                          No High-Risk Locations Detected
                        </AlertTitle>
                        <AlertDescription className="text-green-300">
                          {gpsCheck.alert_message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="family" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Family Guardian Mode
                </CardTitle>
                <CardDescription className="text-cyan-400/70">
                  Trusted contacts and emergency notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-cyan-500/10 border-cyan-500/50">
                  <Users className="h-4 w-4 text-cyan-400" />
                  <AlertTitle className="text-cyan-400">Emergency Contacts</AlertTitle>
                  <AlertDescription className="text-cyan-300">
                    Your trusted contacts will be notified when high-risk scam activity is detected.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-cyan-400">Emergency Contact</div>
                        <div className="text-sm text-cyan-400/70">+0987654321</div>
                      </div>
                      <Badge variant="outline" className="border-green-500 text-green-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-sm text-cyan-400/70 mb-2">Notification Triggers:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>High-risk scam call detected (scam probability &gt; 85%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>User approaching Bitcoin ATM during suspicious call</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Suspicious wallet address entered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>High manipulation index detected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-slate-800/50 border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Evidence Case Builder
                </CardTitle>
                <CardDescription className="text-cyan-400/70">
                  Generate reports for law enforcement and financial institutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-cyan-500/10 border-cyan-500/50">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <AlertTitle className="text-cyan-400">Report Generation</AlertTitle>
                  <AlertDescription className="text-cyan-300">
                    All scam detection events are automatically documented with transcripts, wallet addresses, GPS traces, and emotional analysis graphs.
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-sm text-cyan-400/70 mb-2">Report Includes:</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Complete call transcript</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Wallet addresses and blockchain analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>GPS location trace</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Emotional manipulation graph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span>Scam script fingerprint</span>
                    </div>
                  </div>
                </div>

                {stats && stats.total_call_events > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-cyan-400/70">Recent Activity:</div>
                    <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">{stats.total_call_events}</div>
                          <div className="text-xs text-cyan-400/70">Calls Analyzed</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">{stats.total_wallet_checks}</div>
                          <div className="text-xs text-cyan-400/70">Wallets Checked</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">{stats.total_gps_alerts}</div>
                          <div className="text-xs text-cyan-400/70">GPS Alerts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <Card className="bg-red-500/10 border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Emergency Freeze Mode
                </CardTitle>
                <CardDescription className="text-red-400/70">
                  Immediate protective actions when critical threat detected
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-red-500/20 border-red-500 border-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <AlertTitle className="text-red-400 font-bold">
                    Auto-Intervention System
                  </AlertTitle>
                  <AlertDescription className="text-red-300">
                    When scam probability exceeds 85% or manipulation index exceeds 80%, the system automatically triggers protective measures.
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-900/50 border border-red-500/30 rounded-lg p-4">
                  <div className="text-sm text-red-400/70 mb-2">Emergency Actions:</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Vibrate phone to alert user</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Display blocking overlay with warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Offer auto-hang up option</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Lock crypto wallet apps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Delay money transfer operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Notify emergency contacts immediately</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
                  <div className="text-sm text-cyan-400/70 mb-2">System Status:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Voice Analysis Engine</span>
                      <Badge variant="outline" className="border-green-500 text-green-400">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Emotional AI Engine</span>
                      <Badge variant="outline" className="border-green-500 text-green-400">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Wallet Risk Engine</span>
                      <Badge variant="outline" className="border-green-500 text-green-400">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GPS Shield</span>
                      <Badge variant="outline" className="border-green-500 text-green-400">Online</Badge>
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
