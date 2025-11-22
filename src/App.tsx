import { useState, useEffect, useRef } from 'react'
import './App.css'
import { Shield, MapPin, FileText, AlertTriangle, Activity, TrendingUp, Plus, Trash2, Download, QrCode, Bell, Mic, Search, Navigation, Map as MapIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { gate, handlePaywallDismissal, incrementWalletScan, incrementReport } from '@/utils/subscriptionGate'
import { normalizeTierName } from '@/utils/features'
import { ScanPage } from '@/components/scan/ScanPage'
import { VoiceAnalyzerEngine, VoiceEngineState } from '@/modules/voice/engine'
import { LiveTranscriptPanel } from '@/components/voice/LiveTranscriptPanel'
import { DangerAlerts } from '@/components/voice/DangerAlerts'
import { DeceptionMeter } from '@/components/voice/DeceptionMeter'
import { EmotionMeter } from '@/components/voice/EmotionMeter'
import { ManipulationTimeline } from '@/components/voice/ManipulationTimeline'
import { ScammerProfileCard } from '@/components/voice/ScammerProfileCard'
import { DangerScoreGauge } from '@/components/voice/DangerScoreGauge'

const API_URL = import.meta.env.VITE_API_URL || 'https://cryptoshield-backend-i83o.onrender.com'

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

interface ScamWallet {
  address: string
  riskScore: number
  scamHistory: string[]
  atmLocations: string[]
  lineageCluster: string
  zipCode: string
  scamPattern: string
}

interface HighRiskStore {
  name: string
  address: string
  atmBrand: string
  scamReports: number
  linkedWallets: number
  riskScore: number
  zipCode: string
  lat: number
  lon: number
}

interface BitcoinATM {
  name: string
  address: string
  distance: number
  riskLevel: string
  scamPatternsDetected: boolean
}

interface DarkPatternResult {
  pattern_list: string[]
  pattern_scores: { [key: string]: number }
  overall_score: number
  fingerprint_hash: string
}

interface NationalityPrediction {
  predicted_region: string | null
  confidence: number
  linguistic_markers: string[]
  likely_origins: Array<{ country: string; probability: number }>
}

interface ThreatLevel {
  threat_score: number
  risk_level: string
  contributing_factors: string[]
}

interface SessionTimelineEvent {
  timestamp: string
  event: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  icon: string
}

interface ScammerProfile {
  voiceTraits: {
    accent: string
    speed: string
    pitch: string
    dominance: string
  }
  behavioralPatterns: {
    urgencyLevel: number
    repetition: number
    aggression: number
    isolationTactics: number
  }
  scriptPatterns: string[]
  financialBehavior: {
    walletsUsed: string[]
    riskScore: number
  }
  likelyNationality: NationalityPrediction
  scamPatternType: string
}

interface SubscriptionTier {
  tier: string
  name: string
  price: number | null
  family_limit: number
  features: { [key: string]: boolean }
}

interface UserSubscription {
  user_id: string
  subscription_tier: string
  tier_name: string
  subscription_expiration: string | null
  is_expired: boolean
  family_members_count: number
  family_limit: number
}

function App() {
  const [activeTab, setActiveTab] = useState('monitor')
  const [userId] = useState('demo-user-1')
  const [callText, setCallText] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [currentAddress, setCurrentAddress] = useState('')
  const [searchAddress, setSearchAddress] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [walletSearchQuery, setWalletSearchQuery] = useState('')
  const [walletSearchType, setWalletSearchType] = useState<'wallet' | 'zipcode' | 'pattern' | 'risk'>('wallet')
  
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysisResult | null>(null)
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<EmotionalAnalysisResult | null>(null)
  const [walletRisk, setWalletRisk] = useState<WalletRiskResult | null>(null)
  const [gpsCheck, setGpsCheck] = useState<GPSCheckResult | null>(null)
  const [intervention, setIntervention] = useState<InterventionResult | null>(null)
  
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [freezeModeActive, setFreezeModeActive] = useState(false)
  const [travelModeActive, setTravelModeActive] = useState(false)
  const [nightModeActive, setNightModeActive] = useState(false)
  
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
  const [nearbyATM, setNearbyATM] = useState<BitcoinATM | null>(null)
  const [highRiskStores, setHighRiskStores] = useState<HighRiskStore[]>([])
  const [filteredScamWallets, setFilteredScamWallets] = useState<ScamWallet[]>([])
  
  const [darkPatterns, setDarkPatterns] = useState<DarkPatternResult | null>(null)
  const [nationalityPrediction, setNationalityPrediction] = useState<NationalityPrediction | null>(null)
  const [threatLevel, setThreatLevel] = useState<ThreatLevel | null>(null)
  const [sessionTimeline, setSessionTimeline] = useState<SessionTimelineEvent[]>([])
  const [scammerProfile, setScammerProfile] = useState<ScammerProfile | null>(null)
  const [currentCallId, setCurrentCallId] = useState<string | null>(null)
  
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([])
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallFeature, setPaywallFeature] = useState('')
  const [paywallMessage, setPaywallMessage] = useState('')
  const [isFinalizing, setIsFinalizing] = useState(false)
  
  const voiceEngineRef = useRef<VoiceAnalyzerEngine | null>(null)
  const [voiceEngineState, setVoiceEngineState] = useState<VoiceEngineState>({
    isListening: false,
    transcript: [],
    timeline: [],
    profile: null,
    emotions: null,
    deceptionProbability: 0,
    dangerScore: 0,
    alerts: [],
    sessionDuration: 0,
  })

  const mockScamWallets: ScamWallet[] = [
    {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      riskScore: 95,
      scamHistory: ['IRS Scam', 'Tech Support Scam', 'Romance Scam'],
      atmLocations: ['725 Mission St, SF', '345 Market St, SF'],
      lineageCluster: 'Cluster-A-001',
      zipCode: '94103',
      scamPattern: 'Bitcoin ATM Coercion'
    },
    {
      address: '3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy',
      riskScore: 88,
      scamHistory: ['Grandparent Scam', 'Amazon Refund Scam'],
      atmLocations: ['1234 Broadway, LA'],
      lineageCluster: 'Cluster-B-002',
      zipCode: '90015',
      scamPattern: 'Emergency Coercion'
    },
    {
      address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      riskScore: 92,
      scamHistory: ['Pig Butchering', 'Investment Scam'],
      atmLocations: ['725 Mission St, NY'],
      lineageCluster: 'Cluster-C-003',
      zipCode: '10001',
      scamPattern: 'Romance/Investment'
    }
  ]

  const mockHighRiskStores: HighRiskStore[] = [
    {
      name: '7-Eleven - Broadway Ave',
      address: '1234 Broadway Ave, Los Angeles, CA 90015',
      atmBrand: 'Bitcoin Depot',
      scamReports: 37,
      linkedWallets: 12,
      riskScore: 94,
      zipCode: '90015',
      lat: 34.0522,
      lon: -118.2437
    },
    {
      name: 'Circle K - Market St',
      address: '345 Market St, San Francisco, CA 94103',
      atmBrand: 'CoinFlip',
      scamReports: 28,
      linkedWallets: 8,
      riskScore: 89,
      zipCode: '94103',
      lat: 37.7749,
      lon: -122.4194
    },
    {
      name: 'Shell Gas Station - Mission St',
      address: '725 Mission St, New York, NY 10001',
      atmBrand: 'Coinme',
      scamReports: 42,
      linkedWallets: 15,
      riskScore: 96,
      zipCode: '10001',
      lat: 40.7128,
      lon: -74.0060
    }
  ]

  useEffect(() => {
    fetchStats()
    createDemoUser()
    setFilteredScamWallets(mockScamWallets)
    setHighRiskStores(mockHighRiskStores)
    
    const hour = new Date().getHours()
    setNightModeActive(hour >= 20 || hour < 6)
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

  const forwardGeocode = async (address: string) => {
    const mockCoordinates: { [key: string]: { lat: number, lon: number } } = {
      '345 market st': { lat: 37.7749, lon: -122.4194 },
      '725 mission st': { lat: 40.7128, lon: -74.0060 },
      '1234 broadway': { lat: 34.0522, lon: -118.2437 }
    }
    
    const normalizedAddress = address.toLowerCase()
    for (const key in mockCoordinates) {
      if (normalizedAddress.includes(key)) {
        return mockCoordinates[key]
      }
    }
    return null
  }

  const useMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setLatitude(lat.toString())
          setLongitude(lon.toString())
          const address = await reverseGeocode(lat, lon)
          setCurrentAddress(address)
          checkNearbyATM(lat, lon)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please enter coordinates manually.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const convertAddressToCoords = async () => {
    if (!searchAddress.trim()) return
    
    const coords = await forwardGeocode(searchAddress)
    if (coords) {
      setLatitude(coords.lat.toString())
      setLongitude(coords.lon.toString())
      setCurrentAddress(searchAddress)
      checkNearbyATM(coords.lat, coords.lon)
    } else {
      alert('Address not found. Please try a different address.')
    }
  }

  const checkNearbyATM = (lat: number, lon: number) => {
    const nearby = mockHighRiskStores.find(store => {
      const distance = Math.sqrt(
        Math.pow(store.lat - lat, 2) + Math.pow(store.lon - lon, 2)
      ) * 69 // Rough conversion to miles
      return distance < 0.1 // Within 0.1 miles
    })
    
    if (nearby) {
      const distance = Math.sqrt(
        Math.pow(nearby.lat - lat, 2) + Math.pow(nearby.lon - lon, 2)
      ) * 69 * 5280 // Convert to feet
      
      setNearbyATM({
        name: nearby.name,
        address: nearby.address,
        distance: Math.round(distance),
        riskLevel: 'HIGH',
        scamPatternsDetected: true
      })
    } else {
      setNearbyATM(null)
    }
  }

  const searchHighRiskStores = () => {
    if (!zipCode.trim()) return
    
    const stores = mockHighRiskStores.filter(store => store.zipCode === zipCode)
    setHighRiskStores(stores)
  }

  const searchScamWallets = () => {
    if (!walletSearchQuery.trim()) {
      setFilteredScamWallets(mockScamWallets)
      return
    }
    
    const query = walletSearchQuery.toLowerCase()
    const filtered = mockScamWallets.filter(wallet => {
      switch (walletSearchType) {
        case 'wallet':
          return wallet.address.toLowerCase().includes(query)
        case 'zipcode':
          return wallet.zipCode.includes(query)
        case 'pattern':
          return wallet.scamPattern.toLowerCase().includes(query)
        case 'risk':
          const riskThreshold = parseInt(query)
          return !isNaN(riskThreshold) && wallet.riskScore >= riskThreshold
        default:
          return true
      }
    })
    setFilteredScamWallets(filtered)
  }

  const analyzeVoice = async () => {
    if (!callText.trim()) return
    
    console.info('[A-Series] 🎤 Starting voice analysis...', { API_URL, callText: callText.substring(0, 50) + '...' })
    
    setIsMonitoring(true)
    const callId = `call-${Date.now()}`
    setCurrentCallId(callId)
    
    addTimelineEvent('Call received', 'low', '📞')
    
    try {
      console.info('[A-Series] 📡 Calling /api/voice-analysis...')
      const response = await fetch(`${API_URL}/api/voice-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          user_id: userId,
          audio_text: callText
        })
      })
      
      if (!response.ok) {
        throw new Error(`Voice analysis failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.info('[A-Series] ✅ Voice analysis response:', data)
      setVoiceAnalysis(data)
      
      if (data.scam_probability > 50) {
        addTimelineEvent('First scam phrase detected', 'medium', '⚠️')
      }
      
      console.info('[A-Series] 📡 Calling /api/emotional-analysis...')
      const emotionalResponse = await fetch(`${API_URL}/api/emotional-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call_id: callId,
          user_id: userId,
          audio_text: callText
        })
      })
      
      if (!emotionalResponse.ok) {
        throw new Error(`Emotional analysis failed: ${emotionalResponse.status} ${emotionalResponse.statusText}`)
      }
      
      const emotionalData = await emotionalResponse.json()
      console.info('[A-Series] ✅ Emotional analysis response:', emotionalData)
      setEmotionalAnalysis(emotionalData)
      
      if (emotionalData.manipulation_index > 60) {
        addTimelineEvent('Emotional spike detected', 'high', '😰')
      }
      
      await analyzeDarkPatterns(callText)
      
      await predictNationality(callText)
      
      await calculateThreatLevel()
      
      const threshold = nightModeActive ? 75 : 85
      const manipulationThreshold = nightModeActive ? 70 : 80
      
      if (data.scam_probability >= threshold || emotionalData.manipulation_index >= manipulationThreshold) {
        addTimelineEvent('Freeze Mode triggered', 'critical', '🚨')
        
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
          transcript: callText,
          location: currentAddress
        }
        setCaseFiles(prev => [newCase, ...prev])
      }
      
      fetchStats()
    } catch (error) {
      console.error('[A-Series] ❌ Voice analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`⚠️ Server is available, but AI returned no usable data. Retrying...\n\nError: ${errorMessage}\n\nPlease check:\n1. Backend is running at ${API_URL}\n2. CORS is configured\n3. Network connection`)
      setIsMonitoring(false)
    }
  }

  const checkWalletRisk = async () => {
    if (!walletAddress.trim()) return
    
    const gateResult = await gate('wallet_risk_check', userId, userSubscription ? normalizeTierName(userSubscription.tier_name) : undefined)
    if (!gateResult.allowed) {
      setPaywallFeature('wallet_risk_check')
      setPaywallMessage(gateResult.upgradeMessage || 'This feature requires a premium subscription.')
      setShowPaywall(true)
      return
    }
    
    incrementWalletScan()
    
    addTimelineEvent('Wallet risk check initiated', 'medium', '🪙')
    
    try {
      console.info('[A-Series] 🪙 Checking wallet risk...', { API_URL, walletAddress })
      const response = await fetch(`${API_URL}/api/wallet-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          user_id: userId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Wallet risk check failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.info('[A-Series] ✅ Wallet risk response:', data)
      setWalletRisk(data)
      
      if (data.risk_score >= 75) {
        addTimelineEvent('High-risk wallet detected', 'critical', '⚠️')
        
        const newCase: CaseFile = {
          id: `case-${Date.now()}`,
          date: new Date().toLocaleString(),
          scamType: 'Suspicious Wallet',
          riskScore: data.risk_score,
          walletAddress: walletAddress
        }
        setCaseFiles(prev => [newCase, ...prev])
      } else {
        addTimelineEvent('Wallet risk assessment complete', 'low', '✅')
      }
      
      await calculateThreatLevel()
      
      fetchStats()
    } catch (error) {
      console.error('[A-Series] ❌ Wallet risk check error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`⚠️ Server is available, but AI returned no usable data. Retrying...\n\nError: ${errorMessage}\n\nPlease check:\n1. Backend is running at ${API_URL}\n2. CORS is configured\n3. Wallet address format`)
    }
  }

  const checkGPS = async () => {
    if (!latitude || !longitude) return
    
    addTimelineEvent('GPS location check initiated', 'low', '📍')
    
    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)
    
    const address = await reverseGeocode(lat, lon)
    setCurrentAddress(address)
    checkNearbyATM(lat, lon)
    
    if (nearbyATM) {
      addTimelineEvent('ATM proximity warning', 'critical', '🏧')
    }
    
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
      
      if (data.risk_detected) {
        addTimelineEvent('High-risk location detected', 'high', '⚠️')
      }
      
      if (data.risk_detected && isMonitoring && voiceAnalysis && voiceAnalysis.scam_probability > 50) {
        setFreezeModeActive(true)
      }
      
      await calculateThreatLevel()
      
      fetchStats()
    } catch (error) {
      console.error('[A-Series] ❌ GPS check error:', error)
      alert(`GPS check failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check:\n1. Backend is running\n2. CORS is configured\n3. Coordinates are valid`)
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
    if (score >= 75) return '#EF4444'
    if (score >= 50) return '#FBBF24'
    if (score >= 25) return '#FBBF24'
    return '#22C55E'
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

  const downloadPDF = async (caseFile: CaseFile) => {
    const gateResult = await gate('pdf_export', userId, userSubscription ? normalizeTierName(userSubscription.tier_name) : undefined)
    if (!gateResult.allowed) {
      setPaywallFeature('pdf_export')
      setPaywallMessage(gateResult.upgradeMessage || 'PDF export requires a premium subscription.')
      setShowPaywall(true)
      return
    }
    
    incrementReport()
    
    console.log('Downloading PDF for case:', caseFile.id)
    alert(`PDF download for Case ${caseFile.id} would be generated here`)
  }

  const generateQRCode = async (caseFile: CaseFile) => {
    const gateResult = await gate('qr_export', userId, userSubscription ? normalizeTierName(userSubscription.tier_name) : undefined)
    if (!gateResult.allowed) {
      setPaywallFeature('qr_export')
      setPaywallMessage(gateResult.upgradeMessage || 'QR code generation requires a premium subscription.')
      setShowPaywall(true)
      return
    }
    
    incrementReport()
    
    console.log('Generating QR code for case:', caseFile.id)
    alert(`QR Code for Case ${caseFile.id} would be generated here\nURL: cryptoshield.ai/case/${caseFile.id}`)
  }

  const addTimelineEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', icon: string) => {
    const newEvent: SessionTimelineEvent = {
      timestamp: new Date().toLocaleTimeString(),
      event,
      severity,
      icon
    }
    setSessionTimeline(prev => [...prev, newEvent])
  }

  const analyzeDarkPatterns = async (text: string) => {
    try {
      const response = await fetch(`${API_URL}/api/dark-pattern-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setDarkPatterns(data)
      return data
    } catch (error) {
      console.error('Error analyzing dark patterns:', error)
      return null
    }
  }

  const predictNationality = async (text: string) => {
    try {
      const response = await fetch(`${API_URL}/api/nationality-prediction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await response.json()
      setNationalityPrediction(data)
      return data
    } catch (error) {
      console.error('Error predicting nationality:', error)
      return null
    }
  }

  const calculateThreatLevel = async () => {
    try {
      const response = await fetch(`${API_URL}/api/threat-level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotional_index: emotionalAnalysis?.manipulation_index || 0,
          manipulation_index: emotionalAnalysis?.manipulation_index || 0,
          scam_pattern_match: voiceAnalysis?.script_classification !== null,
          wallet_risk: walletRisk?.risk_score || 0,
          atm_proximity: nearbyATM !== null,
          store_risk: highRiskStores.length > 0 ? highRiskStores[0].riskScore : 0,
          time_of_day_risk: nightModeActive ? 70 : 30,
          geolocation_overlap: gpsCheck?.risk_detected || false
        })
      })
      const data = await response.json()
      setThreatLevel(data)
      return data
    } catch (error) {
      console.error('Error calculating threat level:', error)
      return null
    }
  }

  const buildScammerProfile = async (text: string): Promise<ScammerProfile | null> => {
    const darkPatternData = await analyzeDarkPatterns(text)
    const nationalityData = await predictNationality(text)
    
    const profile: ScammerProfile = {
      voiceTraits: {
        accent: nationalityData?.predicted_region || nationalityData?.likely_origins[0]?.country || 'Unknown',
        speed: darkPatternData?.pattern_list.includes('cognitive_overload') ? 'Fast' : 'Normal',
        pitch: 'Medium',
        dominance: darkPatternData?.pattern_list.includes('threat_tone') ? 'High' : 'Medium'
      },
      behavioralPatterns: {
        urgencyLevel: voiceAnalysis?.urgency_score || 0,
        repetition: darkPatternData?.pattern_list.includes('repetitive_pressure') ? 80 : 40,
        aggression: darkPatternData?.pattern_list.includes('threat_tone') ? 90 : 30,
        isolationTactics: darkPatternData?.pattern_list.includes('do_not_hang_up') ? 95 : 20
      },
      scriptPatterns: darkPatternData?.pattern_list || [],
      financialBehavior: {
        walletsUsed: walletAddress ? [walletAddress] : [],
        riskScore: walletRisk?.risk_score || 0
      },
      likelyNationality: nationalityData || { predicted_region: null, confidence: 0, linguistic_markers: [], likely_origins: [] },
      scamPatternType: voiceAnalysis?.script_classification || 'Unknown'
    }
    
    setScammerProfile(profile)
    return profile
  }

  const finalizeCase = async () => {
    console.log('🔄 Starting case finalization...')
    setIsFinalizing(true)

    addTimelineEvent('Case finalization started', 'critical', '📁')

    try {
      const profile = await buildScammerProfile(callText)
      const threat = await calculateThreatLevel()

      console.log('📤 Sending finalization request to backend...')
      const response = await fetch(`${API_URL}/api/finalize-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          transcript: callText || '',
          emotional_analysis: emotionalAnalysis || null,
          manipulation_index: emotionalAnalysis?.manipulation_index || 0,
          scam_script: voiceAnalysis?.script_classification || '',
          wallet_data: walletRisk || null,
          gps_data: gpsCheck || null,
          freeze_mode_logs: freezeModeActive ? ['Freeze mode activated'] : [],
          dark_patterns: darkPatterns || null,
          nationality_prediction: nationalityPrediction || null,
          threat_level: threat || null,
          scammer_profile: profile || null,
          session_timeline: sessionTimeline || []
        })
      })

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Case finalized successfully:', data)

      const finalizedCase: CaseFile = {
        id: data.case_id,
        date: new Date().toLocaleString(),
        scamType: voiceAnalysis?.script_classification || 'Unknown',
        riskScore: voiceAnalysis?.scam_probability || 0,
        transcript: callText || 'No transcript available',
        walletAddress: walletAddress || undefined,
        location: currentAddress || undefined
      }
      setCaseFiles(prev => [finalizedCase, ...prev])

      resetSession()
      
      alert(`✅ Case ${data.case_id} finalized successfully!\n\n📄 PDF: ${data.pdf_url}\n📱 QR Code: ${data.qr_code_url}\n\n🔄 Starting new session...`)
    } catch (error) {
      console.error('❌ Finalize Case Failed:', error)
      alert(`❌ Finalize Case Failed\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or check the console for details.`)
    } finally {
      setIsFinalizing(false)
    }
  }

  const resetSession = () => {
    console.log('🔄 Resetting session and creating new case ID...')
    console.log(`📋 Previous call ID: ${currentCallId || 'none'}`)
    
    setCallText('')
    setWalletAddress('')
    setLatitude('')
    setLongitude('')
    setCurrentAddress('')
    setSearchAddress('')
    setZipCode('')
    setVoiceAnalysis(null)
    setEmotionalAnalysis(null)
    setWalletRisk(null)
    setGpsCheck(null)
    setIntervention(null)
    setIsMonitoring(false)
    setFreezeModeActive(false)
    setNearbyATM(null)
    setDarkPatterns(null)
    setNationalityPrediction(null)
    setThreatLevel(null)
    setSessionTimeline([])
    setScammerProfile(null)
    
    const newCallId = `call-${Date.now()}`
    setCurrentCallId(newCallId)
    
    console.log(`✅ New session started with ID: ${newCallId}`)
    addTimelineEvent('New session started', 'low', '🔄')
  }

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch(`${API_URL}/api/subscription/user/${userId}`)
      const data = await response.json()
      setUserSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const fetchSubscriptionTiers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/subscription/tiers`)
      const data = await response.json()
      setSubscriptionTiers(data.tiers || [])
    } catch (error) {
      console.error('Error fetching tiers:', error)
    }
  }

  const upgradeSubscription = async (tier: string) => {
    try {
      const response = await fetch(`${API_URL}/api/subscription/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, tier })
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchUserSubscription()
        setShowSubscriptionModal(false)
        setShowPaywall(false)
        alert(`Successfully upgraded to ${data.message}`)
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Failed to upgrade subscription. Please try again.')
    }
  }
  
  const startVoiceListening = () => {
    if (!voiceEngineRef.current) return
    
    const tier = userSubscription?.subscription_tier || 'free'
    const normalizedTier = normalizeTierName(tier)
    
    const sessionLimits = {
      free: 20,
      premium: 300,
      ultra: Infinity,
      enterprise: Infinity,
    }
    
    const maxDuration = sessionLimits[normalizedTier as keyof typeof sessionLimits] || 20
    
    try {
      voiceEngineRef.current.start()
      
      if (maxDuration !== Infinity) {
        setTimeout(() => {
          if (voiceEngineRef.current && voiceEngineState.isListening) {
            voiceEngineRef.current.stop()
            alert(`Session limit reached (${maxDuration} seconds). Upgrade to continue.`)
          }
        }, maxDuration * 1000)
      }
    } catch (error) {
      console.error('Failed to start voice listening:', error)
      alert('Web Speech API not supported in this browser. Please use Chrome or Edge.')
    }
  }
  
  const stopVoiceListening = () => {
    if (!voiceEngineRef.current) return
    voiceEngineRef.current.stop()
  }
  
  const resetVoiceSession = () => {
    if (!voiceEngineRef.current) return
    voiceEngineRef.current.reset()
  }

  useEffect(() => {
    fetchUserSubscription()
    fetchSubscriptionTiers()
    
    if (!voiceEngineRef.current) {
      voiceEngineRef.current = new VoiceAnalyzerEngine(API_URL)
      voiceEngineRef.current.setCallback((state) => {
        setVoiceEngineState(state)
      })
    }
    
    return () => {
      if (voiceEngineRef.current) {
        voiceEngineRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-[#0A1A2F] text-white">
      {/* Header - Mobile First */}
      <div className="border-b border-[#14B8A6]/30 bg-[#11243D]/50 backdrop-blur-sm">
        <div className="mobile-container">
          {/* Mobile: Stack vertically, Tablet+: Horizontal */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 md:w-12 md:h-12 text-[#14B8A6] flex-shrink-0" />
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                  CryptoShield Guardian AI
                </h1>
                <p className="text-sm md:text-base text-[#CFFAFE] hidden sm:block">Bitcoin & Crypto Scam Detection Platform</p>
              </div>
            </div>
            
            {/* Actions - Mobile: Full width buttons, Desktop: Inline */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 lg:gap-4">
              <Button
                onClick={finalizeCase}
                className="mobile-button md:w-auto bg-[#14B8A6] hover:bg-[#14B8A6]/80 text-[#0A1A2F] font-bold text-base md:text-sm lg:text-base"
                disabled={isFinalizing}
              >
                {isFinalizing ? '⏳ Finalizing...' : '📁 Finalize Case'}
              </Button>
              {userSubscription && userSubscription.subscription_tier === 'free' && (
                <Button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="mobile-button md:w-auto bg-gradient-to-r from-[#14B8A6] to-purple-500 hover:opacity-90 text-white font-bold text-base md:text-sm lg:text-base shadow-[0_0_12px_#14B8A6]"
                >
                  🛡 Upgrade
                </Button>
              )}
              
              {/* Badges - Hidden on mobile, show on tablet+ */}
              <div className="hidden md:flex md:items-center md:gap-2 lg:gap-3 md:flex-wrap">
                <Badge variant="outline" className="border-[#22C55E] text-[#22C55E] text-xs lg:text-sm px-2 lg:px-3 py-1">
                  <Activity className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                  ACTIVE
                </Badge>
                {userSubscription && (
                  <Badge 
                    variant="outline" 
                    className={`${
                      userSubscription.subscription_tier === 'free' ? 'border-[#A1A1AA] text-[#A1A1AA]' :
                      userSubscription.subscription_tier === 'premium_shield' ? 'border-[#14B8A6] text-[#14B8A6]' :
                      'border-purple-500 text-purple-400'
                    } text-xs lg:text-sm px-2 lg:px-3 py-1 cursor-pointer`}
                    onClick={() => setShowSubscriptionModal(true)}
                  >
                    {userSubscription.tier_name}
                  </Badge>
                )}
                {nightModeActive && (
                  <Badge variant="outline" className="border-[#FBBF24] text-[#FBBF24] text-xs lg:text-sm px-2 lg:px-3 py-1">
                    🌙 NIGHT
                  </Badge>
                )}
                {travelModeActive && (
                  <Badge variant="outline" className="border-[#14B8A6] text-[#14B8A6] text-xs lg:text-sm px-2 lg:px-3 py-1">
                    ✈️ TRAVEL
                  </Badge>
                )}
                {stats && (
                  <div className="text-xs lg:text-sm text-[#E2E8F0] hidden lg:block">
                    {stats.total_call_events} Calls | {stats.total_wallet_checks} Wallets
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Freeze Mode Banner - Mobile First */}
      {freezeModeActive && (
        <div className="bg-[#7F1D1D] border-b-4 border-[#EF4444] py-3 md:py-4">
          <div className="mobile-container">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse flex-shrink-0" />
                <span className="text-base md:text-lg lg:text-xl font-bold text-white">🛑 FREEZE MODE ACTIVE</span>
              </div>
              <Button 
                onClick={deactivateFreezeMode}
                className="mobile-button md:w-auto bg-white text-[#7F1D1D] hover:bg-[#E2E8F0] font-bold"
              >
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* GPS Danger Banner - Mobile First */}
      {nearbyATM && isMonitoring && voiceAnalysis && voiceAnalysis.scam_probability > 50 && (
        <div className="bg-[#EF4444] border-b-4 border-[#7F1D1D] py-3 md:py-4">
          <div className="mobile-container">
            <div className="flex items-center gap-2 md:gap-3">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse flex-shrink-0" />
              <span className="text-base md:text-lg lg:text-xl font-bold text-white">
                🟥 DANGER — Near Bitcoin ATM during suspicious call. STOP NOW.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mobile-container">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
          {/* Top Navigation Bar - Text Only */}
          <TabsList className="sticky top-0 z-[9999] w-full flex flex-row items-center gap-2 bg-[#0A1A2F]/95 backdrop-blur-md border-b border-[#14B8A6]/30 px-3 py-3 overflow-x-auto whitespace-nowrap safe-area-top" style={{scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'}}>
            <TabsTrigger 
              value="voice" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] data-[state=active]:border-b-2 data-[state=active]:border-[#14B8A6] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Voice Shield
            </TabsTrigger>
            <TabsTrigger 
              value="scan" 
              className="data-[state=active]:bg-[#F5C461] data-[state=active]:text-[#0A0F1A] data-[state=active]:border-b-2 data-[state=active]:border-[#F5C461] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Scan
            </TabsTrigger>
            <TabsTrigger 
              value="monitor" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] data-[state=active]:border-b-2 data-[state=active]:border-[#14B8A6] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Monitor
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] data-[state=active]:border-b-2 data-[state=active]:border-[#14B8A6] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Wallet Check
            </TabsTrigger>
            <TabsTrigger 
              value="gps" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] data-[state=active]:border-b-2 data-[state=active]:border-[#14B8A6] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              GPS Shield
            </TabsTrigger>
            <TabsTrigger 
              value="family" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] data-[state=active]:border-b-2 data-[state=active]:border-[#14B8A6] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Family Safety
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-[#14B8A6] data-[state=active]:text-[#0A1A2F] data-[state=active]:border-b-2 data-[state=active]:border-[#14B8A6] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Reports
            </TabsTrigger>
            <TabsTrigger 
              value="emergency" 
              className="data-[state=active]:bg-[#EF4444] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#EF4444] text-[#E2E8F0] hover:text-white font-bold text-sm md:text-base px-4 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0"
            >
              Emergency
            </TabsTrigger>
          </TabsList>

          {/* VOICE SHIELD™ TAB - Real-Time Voice Analyzer */}
          <TabsContent value="voice" className="min-h-[100dvh] pt-4 pb-6 space-y-4 md:space-y-6 lg:space-y-8">
            {/* Danger Alerts - Show at top when active */}
            <DangerAlerts alerts={voiceEngineState.alerts} />
            
            {/* Voice Shield Control Card */}
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>🛡️</span>
                  Voice Shield™ - Real-Time Protection
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  AI-powered live voice analysis with Web Speech API
                  {nightModeActive && <span className="block sm:inline sm:ml-2 text-[#FBBF24] mt-1 sm:mt-0">🌙 Enhanced Night Protection Active</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {/* Device Status */}
                {voiceEngineState.isListening && (
                  <Alert className="bg-[#14B8A6]/20 border-[#14B8A6] border-2">
                    <Mic className="h-5 w-5 text-[#14B8A6] animate-pulse" />
                    <AlertTitle className="text-white font-bold text-base md:text-lg">
                      🎙️ Recording Active - {Math.floor(voiceEngineState.sessionDuration / 60)}:{(voiceEngineState.sessionDuration % 60).toString().padStart(2, '0')}
                    </AlertTitle>
                    <AlertDescription className="text-[#CFFAFE] text-sm md:text-base">
                      Analyzing voice patterns in real-time every 5 seconds
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Subscription Status */}
                {userSubscription && (
                  <div className="bg-[#0A1A2F] border border-[#14B8A6]/30 rounded-[10px] p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold text-sm md:text-base">
                          {userSubscription.subscription_tier === 'free' && '🔒 FREE - 20 Second Limit'}
                          {userSubscription.subscription_tier === 'premium' && '✅ PRO - 5 Minute Sessions'}
                          {userSubscription.subscription_tier === 'ultra' && '⭐ ELITE - Unlimited + Advanced Tools'}
                        </div>
                        <div className="text-[#CFFAFE] text-xs md:text-sm mt-1">
                          {userSubscription.subscription_tier === 'free' && 'Upgrade to unlock longer sessions'}
                          {userSubscription.subscription_tier === 'premium' && 'Full voice analysis enabled'}
                          {userSubscription.subscription_tier === 'ultra' && 'All advanced features unlocked'}
                        </div>
                      </div>
                      {userSubscription.subscription_tier === 'free' && (
                        <Button 
                          onClick={() => setActiveTab('subscription')}
                          className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-xs md:text-sm px-3 md:px-4 py-2"
                        >
                          Upgrade
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Large Microphone Button */}
                <div className="flex flex-col items-center gap-4 py-4 md:py-6">
                  {!voiceEngineState.isListening ? (
                    <Button 
                      onClick={startVoiceListening}
                      className="w-full max-w-md h-16 md:h-20 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-lg md:text-xl rounded-[16px] shadow-[0_0_20px_#14B8A6] transition-all hover:scale-105"
                    >
                      <Mic className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                      Start Voice Shield™
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopVoiceListening}
                      className="w-full max-w-md h-16 md:h-20 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-lg md:text-xl rounded-[16px] shadow-[0_0_20px_#EF4444] transition-all hover:scale-105 animate-pulse"
                    >
                      <Activity className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                      Stop Recording
                    </Button>
                  )}
                  <Button 
                    onClick={resetVoiceSession}
                    variant="outline"
                    className="border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6]/10 font-bold text-sm md:text-base px-6 md:px-8 py-2 md:py-3 rounded-[12px]"
                  >
                    Reset Session
                  </Button>
                </div>
                
                {/* Background AI Processing Indicator */}
                {voiceEngineState.isListening && (
                  <div className="flex items-center justify-center gap-2 text-[#14B8A6] text-sm md:text-base">
                    <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse"></div>
                    <span>AI Processing Active</span>
                    <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Real-Time Threat Score Display */}
            <DangerScoreGauge score={voiceEngineState.dangerScore} />
            
            {/* Live Transcript Panel */}
            <LiveTranscriptPanel 
              transcript={voiceEngineState.transcript} 
              isListening={voiceEngineState.isListening} 
            />
            
            {/* Two Column Layout for Meters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <DeceptionMeter probability={voiceEngineState.deceptionProbability} />
              <EmotionMeter emotions={voiceEngineState.emotions} />
            </div>
            
            {/* Manipulation Timeline with Smooth Scrolling */}
            <ManipulationTimeline timeline={voiceEngineState.timeline} />
            
            {/* Scammer Profile Card */}
            <ScammerProfileCard profile={voiceEngineState.profile} />
          </TabsContent>

          {/* SCAN TAB - FBI-Grade Intelligence Scanner */}
          <TabsContent value="scan" className="min-h-[100dvh] pt-4 pb-6 space-y-0">
            <ScanPage />
          </TabsContent>

          {/* MONITOR TAB - Mobile First (Manual Analysis Only) */}
          <TabsContent value="monitor" className="min-h-[100dvh] pt-4 pb-6 space-y-4 md:space-y-6 lg:space-y-8">
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>🎧</span>
                  Real-Time Voice Protection
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  AI-powered scam detection and emotional manipulation analysis
                  {nightModeActive && <span className="block sm:inline sm:ml-2 text-[#FBBF24] mt-1 sm:mt-0">🌙 Enhanced Night Protection Active</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-white text-base md:text-lg font-medium mb-2 md:mb-3 block">Call Transcript / Audio Text</label>
                  <div className="relative">
                    <Mic className="absolute left-3 md:left-4 top-3 md:top-4 w-4 h-4 md:w-5 md:h-5 text-[#A1A1AA]" />
                    <Textarea
                      value={callText}
                      onChange={(e) => setCallText(e.target.value)}
                      placeholder="Enter call transcript or paste conversation text here..."
                      className="min-h-32 md:min-h-40 bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-base md:text-lg pl-10 md:pl-12 rounded-[10px] leading-relaxed"
                      style={{ lineHeight: '1.6' }}
                    />
                  </div>
                  <Button 
                    onClick={analyzeVoice}
                    className="mobile-button bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-base md:text-lg rounded-[12px] shadow-[0_0_12px_#14B8A6] mt-3"
                  >
                    <Activity className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Analyze Text
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Instant Danger Score Gauge */}
            <DangerScoreGauge score={voiceEngineState.dangerScore} />
            
            {/* Live Transcript Panel */}
            <LiveTranscriptPanel 
              transcript={voiceEngineState.transcript} 
              isListening={voiceEngineState.isListening} 
            />
            
            {/* Two Column Layout for Meters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <DeceptionMeter probability={voiceEngineState.deceptionProbability} />
              <EmotionMeter emotions={voiceEngineState.emotions} />
            </div>
            
            {/* Manipulation Timeline */}
            <ManipulationTimeline timeline={voiceEngineState.timeline} />
            
            {/* Scammer Profile Card */}
            <ScammerProfileCard profile={voiceEngineState.profile} />

                {voiceAnalysis && (
                  <div className="space-y-4 md:space-y-6 mt-4 md:mt-6 lg:mt-8">
                    <Alert className={`${getRiskBgColor(voiceAnalysis.scam_probability)} border-2 p-4 md:p-6 rounded-[14px] ${voiceAnalysis.scam_probability >= 75 ? 'pulse-glow' : ''}`}>
                      <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" style={{ color: getRiskColor(voiceAnalysis.scam_probability) }} />
                      <AlertTitle className="text-white text-lg md:text-xl lg:text-2xl font-bold">
                        Scam Probability: {voiceAnalysis.scam_probability.toFixed(1)}%
                      </AlertTitle>
                      <AlertDescription className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <span className="text-white text-base md:text-lg">Script Type:</span>
                          <Badge variant="outline" className="border-[#14B8A6] text-[#14B8A6] text-sm md:text-base px-2 md:px-3 py-1 w-fit">
                            {voiceAnalysis.script_classification || 'Unknown'}
                          </Badge>
                        </div>
                        <Progress value={voiceAnalysis.scam_probability} className="h-3 md:h-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
                          <div className="text-base md:text-lg">
                            <span className="text-[#CFFAFE]">Urgency:</span> <span className="text-white font-bold">{voiceAnalysis.urgency_score.toFixed(0)}%</span>
                          </div>
                          <div className="text-base md:text-lg">
                            <span className="text-[#CFFAFE]">Manipulation:</span> <span className="text-white font-bold">{voiceAnalysis.manipulation_intensity.toFixed(0)}%</span>
                          </div>
                        </div>
                        {voiceAnalysis.manipulation_patterns.length > 0 && (
                          <div className="mt-3 md:mt-4">
                            <div className="text-base md:text-lg text-[#CFFAFE] mb-2">Detected Patterns:</div>
                            <div className="flex flex-wrap gap-2">
                              {voiceAnalysis.manipulation_patterns.map((pattern, idx) => (
                                <Badge key={idx} variant="secondary" className="text-sm md:text-base px-2 md:px-3 py-1">
                                  {pattern}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>

                    {emotionalAnalysis && (
                      <Card className="mobile-card bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px]">
                        <CardHeader className="pb-3 md:pb-4">
                          <CardTitle className="text-[#CFFAFE] text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                            <span>💭</span>
                            Emotional Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 md:space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div>
                              <div className="text-sm md:text-base text-[#CFFAFE] mb-2">Stress Level</div>
                              <Progress value={emotionalAnalysis.stress_level} className="h-2 md:h-3" />
                              <div className="text-base md:text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.stress_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm md:text-base text-[#CFFAFE] mb-2">Fear Level</div>
                              <Progress value={emotionalAnalysis.fear_level} className="h-2 md:h-3" />
                              <div className="text-base md:text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.fear_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm md:text-base text-[#CFFAFE] mb-2">Confusion</div>
                              <Progress value={emotionalAnalysis.confusion_level} className="h-2 md:h-3" />
                              <div className="text-base md:text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.confusion_level.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-sm md:text-base text-[#CFFAFE] mb-2">Vulnerability</div>
                              <Progress value={emotionalAnalysis.victim_vulnerability} className="h-2 md:h-3" />
                              <div className="text-base md:text-lg font-bold text-white mt-1">
                                {emotionalAnalysis.victim_vulnerability.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <Alert className={`${getRiskBgColor(emotionalAnalysis.manipulation_index)} border-2 mt-4 md:mt-6 p-3 md:p-4 rounded-[14px]`}>
                            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" style={{ color: getRiskColor(emotionalAnalysis.manipulation_index) }} />
                            <AlertTitle className="text-white text-base md:text-lg font-bold">
                              Manipulation Index: {emotionalAnalysis.manipulation_index.toFixed(1)}%
                            </AlertTitle>
                          </Alert>
                        </CardContent>
                      </Card>
                    )}

                    {intervention && intervention.intervention_triggered && (
                      <Alert className="bg-[#EF4444]/20 border-[#EF4444] border-2 p-4 md:p-6 rounded-[14px] pulse-glow">
                        <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-[#EF4444]" />
                        <AlertTitle className="text-[#EF4444] font-bold text-lg md:text-xl lg:text-2xl">
                          INTERVENTION TRIGGERED - {intervention.alert_level.toUpperCase()}
                        </AlertTitle>
                        <AlertDescription className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                          <div className="text-base md:text-lg text-white">
                            Protective actions activated:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {intervention.actions.map((action, idx) => (
                              <Badge key={idx} className="bg-[#EF4444] text-white text-sm md:text-base px-2 md:px-3 py-1">
                                {action.replace(/_/g, ' ').toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                          {intervention.family_notified && (
                            <div className="text-base md:text-lg text-white font-bold mt-3 md:mt-4">
                              ✅ Emergency contacts have been notified!
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {threatLevel && (
                      <Card className="mobile-card bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px]">
                        <CardHeader className="pb-3 md:pb-4">
                          <CardTitle className="text-[#CFFAFE] text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                            <span>🎯</span>
                            <span className="hidden sm:inline">Threat Level Meter (Homeland Security Style)</span>
                            <span className="sm:hidden">Threat Level</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 md:space-y-5">
                          <div className="text-center">
                            <div className={`text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 ${
                              threatLevel.risk_level === 'SEVERE' ? 'text-black' :
                              threatLevel.risk_level === 'HIGH' ? 'text-[#EF4444]' :
                              threatLevel.risk_level === 'ELEVATED' ? 'text-[#FBBF24]' :
                              threatLevel.risk_level === 'GUARDED' ? 'text-[#FBBF24]' :
                              'text-[#22C55E]'
                            }`}>
                              {threatLevel.risk_level}
                            </div>
                            <Progress value={threatLevel.threat_score} className="h-4 md:h-6 mb-3 md:mb-4" />
                            <div className="text-lg md:text-xl lg:text-2xl font-bold text-white">
                              Threat Score: {threatLevel.threat_score}%
                            </div>
                          </div>
                          {threatLevel.contributing_factors.length > 0 && (
                            <div className="mt-4 md:mt-6">
                              <div className="text-base md:text-lg text-[#CFFAFE] mb-2 md:mb-3 font-bold">Contributing Factors:</div>
                              <div className="space-y-2">
                                {threatLevel.contributing_factors.map((factor, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-white text-sm md:text-base bg-[#132B45] p-2 md:p-3 rounded-lg">
                                    <span className="text-[#EF4444] flex-shrink-0">⚠️</span>
                                    <span>{factor}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {darkPatterns && darkPatterns.pattern_list.length > 0 && (
                      <Card className="mobile-card bg-[#11243D] border-[#EF4444]/50 border-2 rounded-[14px]">
                        <CardHeader className="pb-3 md:pb-4">
                          <CardTitle className="text-[#EF4444] text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                            <span>🔍</span>
                            <span className="hidden sm:inline">Dark Pattern Voice Fingerprinting</span>
                            <span className="sm:hidden">Dark Patterns</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 md:space-y-5">
                          <div className="text-center mb-3 md:mb-4">
                            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#EF4444] mb-2">
                              {darkPatterns.overall_score}%
                            </div>
                            <div className="text-base md:text-lg text-[#CFFAFE]">
                              Manipulation Score
                            </div>
                          </div>
                          <div className="space-y-2 md:space-y-3">
                            <div className="text-base md:text-lg text-[#CFFAFE] font-bold">Detected Patterns:</div>
                            {darkPatterns.pattern_list.map((pattern, idx) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#132B45] p-2 md:p-3 rounded-lg">
                                <span className="text-white text-sm md:text-base capitalize">
                                  {pattern.replace(/_/g, ' ')}
                                </span>
                                <Badge className="bg-[#EF4444] text-white text-xs md:text-sm w-fit">
                                  Score: {darkPatterns.pattern_scores[pattern]}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 md:mt-4 p-2 md:p-3 bg-[#132B45] rounded-lg">
                            <div className="text-xs md:text-sm text-[#CFFAFE]">Fingerprint Hash:</div>
                            <div className="text-white font-mono text-xs mt-1 break-all">{darkPatterns.fingerprint_hash}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {scammerProfile && (
                      <Card className="mobile-card bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px]">
                        <CardHeader className="pb-3 md:pb-4">
                          <CardTitle className="text-[#CFFAFE] text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                            <span>👤</span>
                            Scammer Profile Builder
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 md:space-y-6">
                          <div>
                            <div className="text-base md:text-lg text-[#CFFAFE] font-bold mb-2 md:mb-3">🎙 Voice Traits</div>
                            <div className="grid grid-cols-2 gap-2 md:gap-4">
                              <div className="bg-[#132B45] p-2 md:p-3 rounded-lg">
                                <div className="text-xs md:text-sm text-[#CFFAFE]">Accent</div>
                                <div className="text-white font-bold text-sm md:text-base">{scammerProfile.voiceTraits.accent}</div>
                              </div>
                              <div className="bg-[#132B45] p-2 md:p-3 rounded-lg">
                                <div className="text-xs md:text-sm text-[#CFFAFE]">Speed</div>
                                <div className="text-white font-bold text-sm md:text-base">{scammerProfile.voiceTraits.speed}</div>
                              </div>
                              <div className="bg-[#132B45] p-2 md:p-3 rounded-lg">
                                <div className="text-xs md:text-sm text-[#CFFAFE]">Pitch</div>
                                <div className="text-white font-bold text-sm md:text-base">{scammerProfile.voiceTraits.pitch}</div>
                              </div>
                              <div className="bg-[#132B45] p-2 md:p-3 rounded-lg">
                                <div className="text-xs md:text-sm text-[#CFFAFE]">Dominance</div>
                                <div className="text-white font-bold text-sm md:text-base">{scammerProfile.voiceTraits.dominance}</div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-base md:text-lg text-[#CFFAFE] font-bold mb-2 md:mb-3">🧠 Behavioral Patterns</div>
                            <div className="space-y-2 md:space-y-3">
                              <div>
                                <div className="flex justify-between mb-1 text-sm md:text-base">
                                  <span className="text-white">Urgency Level</span>
                                  <span className="text-[#14B8A6] font-bold">{scammerProfile.behavioralPatterns.urgencyLevel}%</span>
                                </div>
                                <Progress value={scammerProfile.behavioralPatterns.urgencyLevel} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1 text-sm md:text-base">
                                  <span className="text-white">Repetition</span>
                                  <span className="text-[#14B8A6] font-bold">{scammerProfile.behavioralPatterns.repetition}%</span>
                                </div>
                                <Progress value={scammerProfile.behavioralPatterns.repetition} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1 text-sm md:text-base">
                                  <span className="text-white">Aggression</span>
                                  <span className="text-[#EF4444] font-bold">{scammerProfile.behavioralPatterns.aggression}%</span>
                                </div>
                                <Progress value={scammerProfile.behavioralPatterns.aggression} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1 text-sm md:text-base">
                                  <span className="text-white">Isolation Tactics</span>
                                  <span className="text-[#EF4444] font-bold">{scammerProfile.behavioralPatterns.isolationTactics}%</span>
                                </div>
                                <Progress value={scammerProfile.behavioralPatterns.isolationTactics} className="h-2" />
                              </div>
                            </div>
                          </div>

                          {scammerProfile.scriptPatterns.length > 0 && (
                            <div>
                              <div className="text-base md:text-lg text-[#CFFAFE] font-bold mb-2 md:mb-3">💬 Script Patterns</div>
                              <div className="flex flex-wrap gap-2">
                                {scammerProfile.scriptPatterns.map((pattern, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-sm md:text-base px-2 md:px-3 py-1">
                                    {pattern.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-base md:text-lg text-[#CFFAFE] font-bold mb-2 md:mb-3">🔗 Financial Behavior</div>
                            <div className="bg-[#132B45] p-3 md:p-4 rounded-lg space-y-2">
                              <div className="flex justify-between text-sm md:text-base">
                                <span className="text-white">Wallets Used</span>
                                <span className="text-[#14B8A6] font-bold">{scammerProfile.financialBehavior.walletsUsed.length}</span>
                              </div>
                              <div className="flex justify-between text-sm md:text-base">
                                <span className="text-white">Risk Score</span>
                                <span className="text-[#EF4444] font-bold">{scammerProfile.financialBehavior.riskScore}%</span>
                              </div>
                            </div>
                          </div>

                          {scammerProfile.likelyNationality.likely_origins.length > 0 && (
                            <div>
                              <div className="text-base md:text-lg text-[#CFFAFE] font-bold mb-2 md:mb-3">🌍 Likely Nationality</div>
                              <div className="space-y-2">
                                {scammerProfile.likelyNationality.likely_origins.map((origin, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-[#132B45] p-2 md:p-3 rounded-lg">
                                    <span className="text-white font-bold text-sm md:text-base">{idx + 1}. {origin.country}</span>
                                    <Badge className="bg-[#14B8A6] text-[#0A1A2F] text-xs md:text-sm">
                                      {origin.probability}%
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 text-xs md:text-sm text-[#CFFAFE]">
                                Confidence: <span className="text-white font-bold capitalize">{scammerProfile.likelyNationality.confidence}</span>
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="text-base md:text-lg text-[#CFFAFE] font-bold mb-2 md:mb-3">⚠ Scam Pattern Type</div>
                            <Badge className="bg-[#EF4444] text-white text-base md:text-lg px-3 md:px-4 py-1.5 md:py-2">
                              {scammerProfile.scamPatternType}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {sessionTimeline.length > 0 && (
                      <Card className="mobile-card bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px]">
                        <CardHeader className="pb-3 md:pb-4">
                          <CardTitle className="text-[#CFFAFE] text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                            <span>📊</span>
                            <span className="hidden sm:inline">Case Session Timeline (Forensic Track)</span>
                            <span className="sm:hidden">Timeline</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 md:space-y-4">
                            {sessionTimeline.map((event, idx) => (
                              <div key={idx} className={`flex items-start gap-2 md:gap-4 p-3 md:p-4 rounded-lg border-l-4 ${
                                event.severity === 'critical' ? 'bg-[#EF4444]/10 border-[#EF4444]' :
                                event.severity === 'high' ? 'bg-[#FBBF24]/10 border-[#FBBF24]' :
                                event.severity === 'medium' ? 'bg-[#14B8A6]/10 border-[#14B8A6]' :
                                'bg-[#22C55E]/10 border-[#22C55E]'
                              }`}>
                                <div className="text-xl md:text-2xl flex-shrink-0">{event.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-bold text-sm md:text-base">{event.event}</div>
                                  <div className="text-[#CFFAFE] text-xs md:text-sm mt-1">{event.timestamp}</div>
                                </div>
                                <Badge className={`${
                                  event.severity === 'critical' ? 'bg-[#EF4444]' :
                                  event.severity === 'high' ? 'bg-[#FBBF24] text-[#0A1A2F]' :
                                  event.severity === 'medium' ? 'bg-[#14B8A6] text-[#0A1A2F]' :
                                  'bg-[#22C55E] text-[#0A1A2F]'
                                } text-white text-xs md:text-sm flex-shrink-0`}>
                                  {event.severity.toUpperCase()}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
          </TabsContent>

          {/* WALLET TAB - Mobile First */}
          <TabsContent value="wallet" className="min-h-[100dvh] pt-4 pb-6 space-y-4 md:space-y-6 lg:space-y-8">
            {/* Known Scam Wallet Index */}
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>📚</span>
                  <span className="hidden sm:inline">Known Scam Wallet Index</span>
                  <span className="sm:hidden">Scam Wallets</span>
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Searchable database of confirmed scam wallets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-white text-sm md:text-base font-medium mb-2 block">Search By</label>
                    <select
                      value={walletSearchType}
                      onChange={(e) => setWalletSearchType(e.target.value as any)}
                      className="w-full bg-[#11243D] border-2 border-[#14B8A6]/30 text-white text-sm md:text-base h-11 md:h-12 rounded-[10px] px-3 md:px-4"
                    >
                      <option value="wallet">Wallet Address</option>
                      <option value="zipcode">ZIP Code</option>
                      <option value="pattern">Scam Pattern</option>
                      <option value="risk">Risk Level (≥)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-sm md:text-base font-medium mb-2 block">Search Query</label>
                    <div className="flex gap-2">
                      <Input
                        value={walletSearchQuery}
                        onChange={(e) => setWalletSearchQuery(e.target.value)}
                        placeholder={`Enter ${walletSearchType}...`}
                        className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-sm md:text-base h-11 md:h-12 rounded-[10px]"
                      />
                      <Button 
                        onClick={searchScamWallets}
                        className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold h-11 md:h-12 px-4 md:px-6 rounded-[10px] flex-shrink-0"
                      >
                        <Search className="w-4 h-4 md:w-5 md:h-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto">
                  {filteredScamWallets.map((wallet, idx) => (
                    <Card key={idx} className="bg-[#11243D] border-[#EF4444]/50 border-2 rounded-[12px] p-3 md:p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                            <Badge className={`${getRiskBgColor(wallet.riskScore)} text-white text-xs md:text-sm px-2 md:px-3 py-1`}>
                              Risk: {wallet.riskScore}%
                            </Badge>
                            <span className="text-[#CFFAFE] text-xs md:text-sm">ZIP: {wallet.zipCode}</span>
                          </div>
                          <div className="text-white font-mono text-xs md:text-sm mb-2 break-all">{wallet.address}</div>
                          <div className="text-[#E2E8F0] text-xs md:text-sm mb-2">
                            <span className="text-[#CFFAFE]">Pattern:</span> {wallet.scamPattern}
                          </div>
                          <div className="text-[#E2E8F0] text-xs md:text-sm mb-2">
                            <span className="text-[#CFFAFE]">Cluster:</span> {wallet.lineageCluster}
                          </div>
                          <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2">
                            {wallet.scamHistory.map((scam, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {scam}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-[#A1A1AA] text-xs mt-2 break-words">
                            ATM Locations: {wallet.atmLocations.join(', ')}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fraud HOTMAP */}
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <MapIcon className="w-5 h-5 md:w-6 md:h-6" />
                  Fraud HOTMAP
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Geographic heatmap of Bitcoin scam clusters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-4 md:p-6">
                  <div className="text-[#CFFAFE] text-base md:text-lg mb-3 md:mb-4">High-Density Scam Zones</div>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 md:p-3 bg-[#EF4444]/20 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm md:text-base">San Francisco, CA (94103)</div>
                        <div className="text-[#E2E8F0] text-xs md:text-sm">37 active scam wallets | 28 ATM locations</div>
                      </div>
                      <Badge className="bg-[#EF4444] text-white text-xs md:text-sm w-fit">CRITICAL</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 md:p-3 bg-[#FBBF24]/20 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm md:text-base">New York, NY (10001)</div>
                        <div className="text-[#E2E8F0] text-xs md:text-sm">42 active scam wallets | 35 ATM locations</div>
                      </div>
                      <Badge className="bg-[#FBBF24] text-[#0A1A2F] text-xs md:text-sm w-fit">HIGH</Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 md:p-3 bg-[#FBBF24]/20 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm md:text-base">Los Angeles, CA (90015)</div>
                        <div className="text-[#E2E8F0] text-xs md:text-sm">31 active scam wallets | 22 ATM locations</div>
                      </div>
                      <Badge className="bg-[#FBBF24] text-[#0A1A2F] text-xs md:text-sm w-fit">HIGH</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Network Check */}
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>🪙</span>
                  Wallet Network Check
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Blockchain intelligence and scam wallet detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-white text-base md:text-lg font-medium mb-2 md:mb-3 block">Wallet Address</label>
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter Bitcoin wallet address..."
                    className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-base md:text-lg h-12 md:h-14 rounded-[10px]"
                  />
                </div>
                <Button 
                  onClick={checkWalletRisk}
                  className="mobile-button bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-base md:text-lg rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Check Wallet Risk
                </Button>

                <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-4 md:p-6">
                  <div className="text-base md:text-lg text-[#CFFAFE] mb-2">Test Wallet (Known Scam):</div>
                  <div className="text-sm md:text-base text-[#14B8A6] font-mono break-all">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</div>
                </div>

                {walletRisk && (
                  <div className="space-y-4 md:space-y-6 mt-4 md:mt-8">
                    <Alert className={`${getRiskBgColor(walletRisk.risk_score)} border-2 p-4 md:p-6 rounded-[14px] ${walletRisk.risk_score >= 75 ? 'pulse-glow' : ''}`}>
                      <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" style={{ color: getRiskColor(walletRisk.risk_score) }} />
                      <AlertTitle className="text-white text-lg md:text-xl lg:text-2xl font-bold">
                        Risk Score: {walletRisk.risk_score.toFixed(1)}% - {walletRisk.risk_category.toUpperCase()}
                      </AlertTitle>
                      <AlertDescription className="space-y-3 md:space-y-4 mt-3 md:mt-4">
                        <div className="text-base md:text-lg lg:text-xl font-bold text-white mb-3 md:mb-4">
                          {getRiskLabel(walletRisk.risk_score)}
                        </div>
                        <Progress value={walletRisk.risk_score} className="h-3 md:h-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mt-3 md:mt-4">
                          <div className="text-sm md:text-base lg:text-lg">
                            <span className="text-[#CFFAFE]">Mixer Detected:</span> <span className="text-white font-bold">{walletRisk.mixer_detected ? 'YES' : 'NO'}</span>
                          </div>
                          <div className="text-sm md:text-base lg:text-lg">
                            <span className="text-[#CFFAFE]">Darknet:</span> <span className="text-white font-bold">{walletRisk.darknet_crossing ? 'YES' : 'NO'}</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {walletRisk.known_scam_flags.length > 0 && (
                      <Card className="mobile-card bg-[#EF4444]/10 border-[#EF4444]/50 border-2 rounded-[14px]">
                        <CardHeader className="pb-3 md:pb-4">
                          <CardTitle className="text-[#EF4444] text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                            <span>🚩</span>
                            Known Scam Flags
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 md:space-y-3">
                            {walletRisk.known_scam_flags.map((flag, idx) => (
                              <div key={idx} className="text-sm md:text-base lg:text-lg text-white flex items-start gap-2 md:gap-3 bg-[#EF4444]/20 p-2 md:p-3 rounded-lg">
                                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                                <span>{flag}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="mobile-card bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[14px]">
                      <CardHeader className="pb-3 md:pb-4">
                        <CardTitle className="text-[#CFFAFE] text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 md:gap-3">
                          <span>🔗</span>
                          Wallet Lineage Map
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-[#E2E8F0] text-xs md:text-sm lg:text-base overflow-x-auto">
                          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(walletRisk.risk_lineage_map, null, 2)}</pre>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* GPS TAB - Mobile First */}
          <TabsContent value="gps" className="min-h-[100dvh] pt-4 pb-6 space-y-4 md:space-y-6 lg:space-y-8">
            {/* Address to Coordinates (Forward Geocoding) */}
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>🏠</span>
                  <span className="hidden sm:inline">Address to Coordinates</span>
                  <span className="sm:hidden">Address</span>
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Convert street address to GPS coordinates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div>
                  <label className="text-white text-base md:text-lg font-medium mb-2 md:mb-3 block">Street Address</label>
                  <Input
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    placeholder="Enter street address, city, or store name..."
                    className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-base md:text-lg h-12 md:h-14 rounded-[10px]"
                  />
                </div>
                <Button 
                  onClick={convertAddressToCoords}
                  className="mobile-button bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-base md:text-lg rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Convert to Coordinates
                </Button>
              </CardContent>
            </Card>

            {/* GPS Location Check */}
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>📍</span>
                  <span className="hidden sm:inline">GPS Anti-Scam Shield</span>
                  <span className="sm:hidden">GPS Shield</span>
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Real-time location monitoring and Bitcoin ATM detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <Button 
                  onClick={useMyLocation}
                  className="mobile-button bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-base md:text-lg rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <Navigation className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Use My Location
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-white text-base md:text-lg font-medium mb-2 md:mb-3 block">Latitude</label>
                    <Input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="37.7749"
                      className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-base md:text-lg h-12 md:h-14 rounded-[10px]"
                    />
                  </div>
                  <div>
                    <label className="text-white text-base md:text-lg font-medium mb-2 md:mb-3 block">Longitude</label>
                    <Input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="-122.4194"
                      className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-base md:text-lg h-12 md:h-14 rounded-[10px]"
                    />
                  </div>
                </div>

                <Button 
                  onClick={checkGPS}
                  className="mobile-button bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-base md:text-lg rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Check Location
                </Button>

                {currentAddress && (
                  <div className="bg-[#11243D] border-2 border-[#14B8A6]/30 rounded-[14px] p-4 md:p-6">
                    <div className="text-base md:text-lg text-[#CFFAFE] mb-2">📍 Current Location:</div>
                    <div className="text-lg md:text-xl text-white font-bold break-words">{currentAddress}</div>
                    <div className="text-sm md:text-base text-[#A1A1AA] mt-1">
                      (Detected from {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)})
                    </div>
                  </div>
                )}

                {nearbyATM && (
                  <Alert className="bg-[#EF4444]/20 border-[#EF4444] border-2 p-4 md:p-6 rounded-[14px] pulse-glow">
                    <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-[#EF4444]" />
                    <AlertTitle className="text-[#EF4444] font-bold text-lg md:text-xl lg:text-2xl mb-3 md:mb-4">
                      ⚠️ Nearest Bitcoin ATM Detected
                    </AlertTitle>
                    <AlertDescription className="space-y-2 md:space-y-3">
                      <div className="text-sm md:text-base lg:text-lg text-white">
                        <span className="text-[#CFFAFE]">📍 Location:</span> {nearbyATM.address}
                      </div>
                      <div className="text-sm md:text-base lg:text-lg text-white">
                        <span className="text-[#CFFAFE]">Distance:</span> {nearbyATM.distance} feet
                      </div>
                      <div className="text-sm md:text-base lg:text-lg text-white">
                        <span className="text-[#CFFAFE]">Risk Level:</span> <Badge className="bg-[#EF4444] text-white ml-2 text-xs md:text-sm">{nearbyATM.riskLevel}</Badge>
                      </div>
                      {nearbyATM.scamPatternsDetected && (
                        <div className="text-sm md:text-base lg:text-lg text-white font-bold mt-3 md:mt-4">
                          🚨 Scam Patterns Detected: YES
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {gpsCheck && gpsCheck.risk_detected && (
                  <Alert className="bg-[#FBBF24]/20 border-[#FBBF24] border-2 p-4 md:p-6 rounded-[14px]">
                    <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-[#FBBF24]" />
                    <AlertTitle className="text-white font-bold text-base md:text-lg lg:text-xl">
                      Location Risk Detected
                    </AlertTitle>
                    <AlertDescription className="space-y-2 mt-2 md:mt-3">
                      <div className="text-sm md:text-base lg:text-lg text-white">
                        <span className="text-[#CFFAFE]">Type:</span> {gpsCheck.location_type}
                      </div>
                      <div className="text-sm md:text-base lg:text-lg text-white">
                        <span className="text-[#CFFAFE]">Risk Level:</span> {gpsCheck.risk_level}
                      </div>
                      <div className="text-sm md:text-base lg:text-lg text-white mt-2 md:mt-3">
                        {gpsCheck.alert_message}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* High-Fraud Store Locator */}
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>🏪</span>
                  <span className="hidden sm:inline">High-Fraud Store Locator</span>
                  <span className="sm:hidden">Store Locator</span>
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Find high-risk stores with Bitcoin ATMs by ZIP code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Enter ZIP Code..."
                    className="bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-base md:text-lg h-12 md:h-14 rounded-[10px]"
                  />
                  <Button 
                    onClick={searchHighRiskStores}
                    className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-base md:text-lg h-12 md:h-14 px-6 md:px-8 rounded-[12px] shadow-[0_0_12px_#14B8A6] w-full sm:w-auto flex-shrink-0"
                  >
                    <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Search
                  </Button>
                </div>

                {highRiskStores.length > 0 && (
                  <div className="space-y-3 md:space-y-4">
                    <div className="text-base md:text-lg text-[#CFFAFE] font-bold">
                      High-Risk Stores in ZIP {zipCode || 'All Areas'}:
                    </div>
                    {highRiskStores.map((store, idx) => (
                      <Card key={idx} className="bg-[#11243D] border-[#EF4444]/50 border-2 rounded-[12px] p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 mb-2">
                              <span className="text-xl md:text-2xl">{idx + 1}️⃣</span>
                              <div className="text-base md:text-lg lg:text-xl text-white font-bold break-words">{store.name}</div>
                            </div>
                            <div className="text-sm md:text-base text-[#E2E8F0] mb-2 break-words">📍 {store.address}</div>
                          </div>
                          <Badge className={`${getRiskBgColor(store.riskScore)} text-white text-sm md:text-base lg:text-lg px-3 md:px-4 py-1.5 md:py-2 w-fit flex-shrink-0`}>
                            {store.riskScore}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mt-3 md:mt-4">
                          <div className="text-sm md:text-base text-white">
                            <span className="text-[#CFFAFE]">⚠️ Scam Reports:</span> <span className="font-bold">{store.scamReports}</span>
                          </div>
                          <div className="text-sm md:text-base text-white">
                            <span className="text-[#CFFAFE]">🔗 Linked Wallets:</span> <span className="font-bold">{store.linkedWallets}</span>
                          </div>
                          <div className="text-sm md:text-base text-white">
                            <span className="text-[#CFFAFE]">🏧 ATM Brand:</span> <span className="font-bold">{store.atmBrand}</span>
                          </div>
                          <div className="text-sm md:text-base text-white">
                            <span className="text-[#CFFAFE]">🔥 Risk Score:</span> <span className="font-bold text-[#EF4444]">{store.riskScore}%</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAMILY TAB - Mobile First */}
          <TabsContent value="family" className="min-h-[100dvh] pt-4 pb-6 space-y-4 md:space-y-6 lg:space-y-8">
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>👨‍👩‍👧‍👦</span>
                  <span className="hidden sm:inline">Trusted Contacts Management</span>
                  <span className="sm:hidden">Contacts</span>
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Manage emergency contacts and notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <Button 
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="mobile-button bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-base md:text-lg rounded-[12px] shadow-[0_0_12px_#14B8A6]"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Add Trusted Contact
                </Button>

                {showAddContact && (
                  <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[12px] p-4 md:p-6">
                    <CardHeader className="pb-3 md:pb-4">
                      <CardTitle className="text-[#CFFAFE] text-lg md:text-xl font-bold flex items-center gap-2 md:gap-3">
                        <span>➕</span>
                        New Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                      <div>
                        <label className="text-white text-sm md:text-base font-medium mb-2 block">Full Name</label>
                        <Input
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          placeholder="Enter full name..."
                          className="bg-[#132B45] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-sm md:text-base h-11 md:h-12 rounded-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm md:text-base font-medium mb-2 block">Relationship</label>
                        <select
                          value={newContact.relationship}
                          onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                          className="w-full bg-[#132B45] border-2 border-[#14B8A6]/30 text-white text-sm md:text-base h-11 md:h-12 rounded-[10px] px-3 md:px-4"
                        >
                          <option value="">Select relationship...</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white text-sm md:text-base font-medium mb-2 block">Phone</label>
                        <Input
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          placeholder="+1234567890"
                          className="bg-[#132B45] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-sm md:text-base h-11 md:h-12 rounded-[10px]"
                        />
                      </div>
                      <div>
                        <label className="text-white text-sm md:text-base font-medium mb-2 block">Email</label>
                        <Input
                          value={newContact.email}
                          onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                          placeholder="email@example.com"
                          className="bg-[#132B45] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-sm md:text-base h-11 md:h-12 rounded-[10px]"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-3 md:mt-4">
                        <Button 
                          onClick={addTrustedContact}
                          className="flex-1 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-sm md:text-base h-11 md:h-12 rounded-[10px]"
                        >
                          Save Contact
                        </Button>
                        <Button 
                          onClick={() => setShowAddContact(false)}
                          className="flex-1 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-sm md:text-base h-11 md:h-12 rounded-[10px]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3 md:space-y-4 max-h-96 overflow-y-auto">
                  {trustedContacts.map((contact) => (
                    <Card key={contact.id} className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[12px] p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                            <div className="text-base md:text-lg lg:text-xl text-white font-bold break-words">{contact.name}</div>
                            <Badge variant="outline" className={`${contact.active ? 'border-[#22C55E] text-[#22C55E]' : 'border-[#A1A1AA] text-[#A1A1AA]'} text-xs md:text-sm px-2 md:px-3 py-1`}>
                              {contact.active ? 'ACTIVE' : 'INACTIVE'}
                            </Badge>
                          </div>
                          <div className="text-sm md:text-base text-[#E2E8F0] mb-1">
                            <span className="text-[#CFFAFE]">Relationship:</span> {contact.relationship}
                          </div>
                          <div className="text-sm md:text-base text-[#E2E8F0] mb-1 break-all">
                            <span className="text-[#CFFAFE]">Phone:</span> {contact.phone}
                          </div>
                          <div className="text-sm md:text-base text-[#E2E8F0] mb-2 md:mb-3 break-all">
                            <span className="text-[#CFFAFE]">Email:</span> {contact.email}
                          </div>
                          <div className="text-xs md:text-sm text-[#CFFAFE] mb-2">Notifications:</div>
                          <div className="flex flex-wrap gap-1.5 md:gap-2">
                            {contact.notifications.highRiskCall && <Badge variant="secondary" className="text-xs">High-Risk Call</Badge>}
                            {contact.notifications.atmProximity && <Badge variant="secondary" className="text-xs">ATM Proximity</Badge>}
                            {contact.notifications.suspiciousWallet && <Badge variant="secondary" className="text-xs">Suspicious Wallet</Badge>}
                            {contact.notifications.highManipulation && <Badge variant="secondary" className="text-xs">High Manipulation</Badge>}
                            {contact.notifications.freezeMode && <Badge variant="secondary" className="text-xs">Freeze Mode</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                          <Button 
                            onClick={() => toggleContactActive(contact.id)}
                            className="flex-1 lg:flex-none bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold h-10 md:h-11 px-3 md:px-4 rounded-[8px] text-xs md:text-sm"
                          >
                            {contact.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            onClick={() => removeContact(contact.id)}
                            className="flex-1 lg:flex-none bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold h-10 md:h-11 px-3 md:px-4 rounded-[8px] text-xs md:text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Notification Log */}
                <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[12px] p-4 md:p-6">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-[#CFFAFE] text-base md:text-lg lg:text-xl font-bold flex items-center gap-2">
                      <Bell className="w-4 h-4 md:w-5 md:h-5" />
                      Notification Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm md:text-base text-[#E2E8F0]">
                      <div>📅 10:14 AM – High-risk call alert sent to Emergency Contact</div>
                      <div>📅 10:18 AM – ATM proximity alert sent to Emergency Contact</div>
                      <div>📅 10:22 AM – Freeze Mode activation alert sent to Emergency Contact</div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS TAB - Mobile First */}
          <TabsContent value="reports" className="min-h-[100dvh] pt-4 pb-6 space-y-4 md:space-y-6 lg:space-y-8">
            <Card className="mobile-card bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px] hover:shadow-[0_0_12px_#14B8A6] transition-shadow">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>📄</span>
                  <span className="hidden sm:inline">Evidence Locker</span>
                  <span className="sm:hidden">Evidence</span>
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Law-enforcement-grade case file management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {caseFiles.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-[#A1A1AA] mx-auto mb-3 md:mb-4" />
                    <div className="text-base md:text-lg lg:text-xl text-[#E2E8F0]">No case files yet</div>
                    <div className="text-sm md:text-base text-[#A1A1AA] mt-2">
                      Case files will be automatically created when scams are detected
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {caseFiles.map((caseFile) => (
                      <Card key={caseFile.id} className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[12px] p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 md:mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                              <span className="text-xl md:text-2xl">📁</span>
                              <div className="text-base md:text-lg lg:text-xl text-white font-bold">Case #{caseFile.id.split('-')[1]}</div>
                              <Badge className={`${getRiskBgColor(caseFile.riskScore)} text-white text-xs md:text-sm lg:text-base px-2 md:px-3 py-1`}>
                                Risk: {caseFile.riskScore.toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="text-sm md:text-base text-[#E2E8F0] mb-1 md:mb-2">
                              <span className="text-[#CFFAFE]">Date:</span> {caseFile.date}
                            </div>
                            <div className="text-sm md:text-base text-[#E2E8F0] mb-1 md:mb-2">
                              <span className="text-[#CFFAFE]">Scam Type:</span> {caseFile.scamType}
                            </div>
                            {caseFile.walletAddress && (
                              <div className="text-sm md:text-base text-[#E2E8F0] mb-1 md:mb-2">
                                <span className="text-[#CFFAFE]">Wallet:</span> <span className="font-mono text-xs md:text-sm break-all">{caseFile.walletAddress.substring(0, 20)}...</span>
                              </div>
                            )}
                            {caseFile.location && (
                              <div className="text-sm md:text-base text-[#E2E8F0] mb-1 md:mb-2 break-words">
                                <span className="text-[#CFFAFE]">Location:</span> {caseFile.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-3 md:mt-4">
                          <Button 
                            onClick={() => alert(`Viewing details for Case ${caseFile.id}`)}
                            className="flex-1 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-sm md:text-base h-11 md:h-12 rounded-[10px]"
                          >
                            View Details
                          </Button>
                          <Button 
                            onClick={() => downloadPDF(caseFile)}
                            className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-sm md:text-base h-11 md:h-12 px-4 md:px-6 rounded-[10px] flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="sm:hidden">PDF</span>
                          </Button>
                          <Button 
                            onClick={() => generateQRCode(caseFile)}
                            className="bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-sm md:text-base h-11 md:h-12 px-4 md:px-6 rounded-[10px] flex items-center justify-center gap-2"
                          >
                            <QrCode className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="sm:hidden">QR</span>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="bg-[#11243D] border-2 border-[#FBBF24]/30 rounded-[14px] p-4 md:p-6 mt-4 md:mt-6">
                  <div className="flex items-center gap-2 md:gap-3 text-[#FBBF24]">
                    <span className="text-xl md:text-2xl">🕒</span>
                    <div className="text-sm md:text-base">
                      Evidence retained for 180 days (auto-delete)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMERGENCY TAB - Mobile First */}
          <TabsContent value="emergency" className="min-h-[100dvh] pt-4 pb-6 space-y-4 md:space-y-6 lg:space-y-8">
            <Card className="mobile-card bg-[#7F1D1D] border-[#EF4444] border-4 rounded-[14px] shadow-[0_0_20px_#EF4444]">
              <CardHeader className="pb-4 md:pb-6">
                <CardTitle className="text-white text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2 md:gap-3">
                  <span>🚨</span>
                  <span className="hidden sm:inline">Emergency Freeze Mode</span>
                  <span className="sm:hidden">Freeze Mode</span>
                </CardTitle>
                <CardDescription className="text-[#CFFAFE] text-sm md:text-base lg:text-lg mt-2">
                  Hybrid protection system with automatic and manual activation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                {/* Manual Panic Button */}
                <Button 
                  onClick={activateManualFreezeMode}
                  disabled={freezeModeActive}
                  className="mobile-button bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-lg md:text-xl lg:text-2xl h-16 md:h-20 rounded-[12px] shadow-[0_0_20px_#EF4444] disabled:opacity-50"
                >
                  🛑 ACTIVATE FREEZE MODE
                </Button>

                {/* System Status */}
                <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[12px] p-4 md:p-6">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-[#CFFAFE] text-base md:text-lg lg:text-xl font-bold flex items-center gap-2 md:gap-3">
                      <span>⚙️</span>
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                      <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#132B45] rounded-lg">
                        <span className="text-xl md:text-2xl">🔕</span>
                        <div>
                          <div className="text-white font-bold text-sm md:text-base">Vibrate</div>
                          <div className="text-[#A1A1AA] text-xs md:text-sm">Alert System</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#132B45] rounded-lg">
                        <span className="text-xl md:text-2xl">🛑</span>
                        <div>
                          <div className="text-white font-bold text-sm md:text-base">Block</div>
                          <div className="text-[#A1A1AA] text-xs md:text-sm">Call Blocking</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#132B45] rounded-lg">
                        <span className="text-xl md:text-2xl">📵</span>
                        <div>
                          <div className="text-white font-bold text-sm md:text-base">Hang Up</div>
                          <div className="text-[#A1A1AA] text-xs md:text-sm">Auto Disconnect</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#132B45] rounded-lg">
                        <span className="text-xl md:text-2xl">🔐</span>
                        <div>
                          <div className="text-white font-bold text-sm md:text-base">Lock Wallet</div>
                          <div className="text-[#A1A1AA] text-xs md:text-sm">App Lockdown</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#132B45] rounded-lg">
                        <span className="text-xl md:text-2xl">⏳</span>
                        <div>
                          <div className="text-white font-bold text-sm md:text-base">Delay</div>
                          <div className="text-[#A1A1AA] text-xs md:text-sm">Transfer Delay</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#132B45] rounded-lg">
                        <span className="text-xl md:text-2xl">📲</span>
                        <div>
                          <div className="text-white font-bold text-sm md:text-base">Notify</div>
                          <div className="text-[#A1A1AA] text-xs md:text-sm">Family Alerts</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Automatic Activation Settings */}
                <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[12px] p-4 md:p-6">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-[#CFFAFE] text-base md:text-lg lg:text-xl font-bold flex items-center gap-2 md:gap-3">
                      <span>🤖</span>
                      Automatic Activation (Default ON)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 md:space-y-3">
                    <div className="text-sm md:text-base text-[#E2E8F0]">
                      Freeze Mode automatically triggers when:
                    </div>
                    <div className="space-y-2 text-sm md:text-base text-white">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#22C55E] text-white text-xs md:text-sm">✓</Badge>
                        <span>Scam Probability ≥ {nightModeActive ? '75' : '85'}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#22C55E] text-white text-xs md:text-sm">✓</Badge>
                        <span>Manipulation Index ≥ {nightModeActive ? '70' : '80'}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#22C55E] text-white text-xs md:text-sm">✓</Badge>
                        <span>User approaching Bitcoin ATM during suspicious call</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#22C55E] text-white text-xs md:text-sm">✓</Badge>
                        <span>High-risk wallet entered</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Travel Mode Toggle */}
                <Card className="bg-[#11243D] border-[#14B8A6]/30 border-2 rounded-[12px] p-4 md:p-6">
                  <CardHeader className="pb-3 md:pb-4">
                    <CardTitle className="text-[#CFFAFE] text-base md:text-lg lg:text-xl font-bold flex items-center gap-2">
                      <span>✈️</span>
                      Travel Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-sm md:text-base text-[#E2E8F0]">
                        Enhanced alerts when approaching high-risk areas
                      </div>
                      <Button 
                        onClick={() => setTravelModeActive(!travelModeActive)}
                        className={`${travelModeActive ? 'bg-[#22C55E]' : 'bg-[#A1A1AA]'} hover:opacity-90 text-white font-bold text-sm md:text-base h-11 md:h-12 px-4 md:px-6 rounded-[10px] w-full sm:w-auto flex-shrink-0`}
                      >
                        {travelModeActive ? 'ON' : 'OFF'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Subscription Modal - Mobile First */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 overflow-y-auto">
          <div className="bg-[#0A1A2F] border-2 border-[#14B8A6] rounded-[14px] max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4 md:mb-6 lg:mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">🛡 Choose Your Protection</h2>
                <button 
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-[#A1A1AA] hover:text-white text-xl md:text-2xl flex-shrink-0 ml-2"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {subscriptionTiers.length === 0 && (
                  <div className="col-span-3 text-center text-[#A1A1AA] text-sm md:text-base">Loading subscription tiers...</div>
                )}
                {/* FREE Tier */}
                <div className="bg-[#11243D] border border-[#14B8A6]/30 rounded-[12px] p-4 md:p-6">
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">FREE</h3>
                    <div className="text-3xl md:text-4xl font-bold text-[#14B8A6] mb-2">$0</div>
                    <div className="text-[#A1A1AA] text-sm md:text-base">Forever</div>
                  </div>
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Basic Scam Detection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Single Wallet Risk Score</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">GPS Fraud Warnings</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Manual Freeze Mode</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">1 Case Report/month</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#A1A1AA] mt-0.5 md:mt-1">✕</span>
                      <span className="text-[#A1A1AA] text-xs md:text-sm">No PDF Export</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-[#132B45] hover:bg-[#132B45]/80 text-white font-bold text-sm md:text-base h-11 md:h-12"
                    disabled
                  >
                    Current Plan
                  </Button>
                </div>

                {/* PREMIUM SHIELD Tier */}
                <div className="bg-gradient-to-b from-[#14B8A6]/20 to-[#11243D] border-2 border-[#14B8A6] rounded-[12px] p-4 md:p-6 relative">
                  <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2 bg-[#14B8A6] text-[#0A1A2F] px-3 md:px-4 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-bold">
                    RECOMMENDED
                  </div>
                  <div className="text-center mb-4 md:mb-6 mt-2 md:mt-0">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">PREMIUM SHIELD</h3>
                    <div className="text-3xl md:text-4xl font-bold text-[#14B8A6] mb-2">$9.99</div>
                    <div className="text-[#A1A1AA] text-sm md:text-base">per month</div>
                  </div>
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm font-bold">All FREE features PLUS:</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Real-time Voice Protection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Emotional + Manipulation AI</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Auto Freeze Mode</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Unlimited Wallet Scanning</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Wallet Lineage Mapping</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Unlimited PDF Exports</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Scammer Profile Builder</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Case Timeline</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Family Center (3 members)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Travel Mode Protection</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => upgradeSubscription('premium_shield')}
                    className="w-full bg-[#14B8A6] hover:bg-[#14B8A6]/80 text-[#0A1A2F] font-bold text-sm md:text-base h-11 md:h-12 shadow-[0_0_12px_#14B8A6]"
                  >
                    Upgrade to Premium
                  </Button>
                </div>

                {/* GUARDIAN ULTRA Tier */}
                <div className="bg-gradient-to-b from-purple-500/20 to-[#11243D] border-2 border-purple-500 rounded-[12px] p-4 md:p-6">
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">GUARDIAN ULTRA</h3>
                    <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">$19.99</div>
                    <div className="text-[#A1A1AA] text-sm md:text-base">per month</div>
                  </div>
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm font-bold">All PREMIUM features PLUS:</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Family Center (10 members)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Scammer Network Intelligence</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Voice Line-Up Tool</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Dark Web Monitoring</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Ultra Travel Mode</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#22C55E] mt-0.5 md:mt-1">✓</span>
                      <span className="text-white text-xs md:text-sm">Priority Support</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => upgradeSubscription('guardian_ultra')}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm md:text-base h-11 md:h-12 shadow-[0_0_12px_rgb(168,85,247)]"
                  >
                    Go Ultra
                  </Button>
                </div>
              </div>

              <div className="mt-6 md:mt-8 text-center">
                <div className="text-[#A1A1AA] text-xs md:text-sm mb-3 md:mb-4">
                  Need enterprise-level protection for your organization?
                </div>
                <Button 
                  className="bg-[#132B45] hover:bg-[#132B45]/80 text-[#14B8A6] font-bold text-sm md:text-base h-11 md:h-12 px-6 md:px-8"
                >
                  Contact Us for Enterprise
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Modal - Mobile First */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-[#0A1A2F] border-2 border-[#EF4444] rounded-[14px] max-w-md w-full p-6 md:p-8">
            <div className="text-center mb-4 md:mb-6">
              <div className="text-5xl md:text-6xl mb-3 md:mb-4">🔒</div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Premium Feature</h3>
              {paywallFeature && (
                <p className="text-[#14B8A6] text-xs md:text-sm mb-2 font-mono break-words">
                  Feature: {paywallFeature}
                </p>
              )}
              <p className="text-[#E2E8F0] text-sm md:text-base mb-2">
                {paywallMessage}
              </p>
              <p className="text-[#A1A1AA] text-xs md:text-sm">
                Upgrade to unlock this feature and protect yourself from crypto scams.
              </p>
            </div>

            <div className="space-y-2 md:space-y-3">
              <Button 
                onClick={() => {
                  setShowPaywall(false)
                  setShowSubscriptionModal(true)
                }}
                className="w-full bg-[#14B8A6] hover:bg-[#14B8A6]/80 text-[#0A1A2F] font-bold text-sm md:text-base h-11 md:h-12"
              >
                View Plans & Upgrade
              </Button>
              <Button 
                onClick={() => {
                  if (paywallFeature) {
                    handlePaywallDismissal(paywallFeature)
                  }
                  setShowPaywall(false)
                }}
                className="w-full bg-[#132B45] hover:bg-[#132B45]/80 text-white font-bold text-sm md:text-base h-11 md:h-12"
              >
                Maybe Later
              </Button>
            </div>

            {userSubscription && (
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-[#14B8A6]/30">
                <div className="text-center text-xs md:text-sm text-[#A1A1AA]">
                  Current Plan: <span className="text-[#14B8A6] font-bold">{userSubscription.tier_name}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
