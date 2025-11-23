/**
 * VoiceShieldRecorder Component
 * Microphone recording UI with Web Speech API integration
 * Features: 20-second FREE timer, live transcription, Freeze Mode auto-activation
 */

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Mic, Activity, AlertTriangle } from 'lucide-react'
import { VoiceAnalyzerEngine, VoiceEngineState } from '@/modules/voice/engine'

interface VoiceShieldRecorderProps {
  apiUrl: string
  subscriptionTier: string
  onStateUpdate: (state: VoiceEngineState) => void
  onFreezeModeActivate: () => void
  nightModeActive: boolean
}

export function VoiceShieldRecorder({
  apiUrl,
  subscriptionTier,
  onStateUpdate,
  onFreezeModeActivate,
  nightModeActive
}: VoiceShieldRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(20)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [showFreezeAlert, setShowFreezeAlert] = useState(false)
  const [fallbackMode, setFallbackMode] = useState(false)
  const [fallbackText, setFallbackText] = useState('')
  
  const engineRef = useRef<VoiceAnalyzerEngine | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const freezeTriggeredRef = useRef(false)

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new VoiceAnalyzerEngine(apiUrl, 3000)
      engineRef.current.setCallback((state) => {
        onStateUpdate(state)
        setSessionDuration(state.sessionDuration)

        const threshold = nightModeActive ? 60 : 70
        if (state.deceptionProbability >= threshold && !freezeTriggeredRef.current) {
          freezeTriggeredRef.current = true
          setShowFreezeAlert(true)
          onFreezeModeActivate()
          
          setTimeout(() => setShowFreezeAlert(false), 5000)
        }
      })
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [apiUrl, onStateUpdate, onFreezeModeActivate, nightModeActive])

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setFallbackMode(true)
    }
  }, [])

  const getSessionLimit = () => {
    switch (subscriptionTier) {
      case 'free': return 20
      case 'premium': return 300 // 5 minutes
      case 'ultra': return Infinity
      default: return 20
    }
  }

  const startRecording = async () => {
    if (!engineRef.current) return

    try {
      engineRef.current.start()
      setIsRecording(true)
      freezeTriggeredRef.current = false
      
      const limit = getSessionLimit()
      setSecondsLeft(limit)

      if (limit !== Infinity) {
        timerRef.current = setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              stopRecording()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      alert('Microphone access denied or not available. Please enable microphone permissions and try again.')
    }
  }

  const stopRecording = () => {
    if (engineRef.current) {
      engineRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const resetSession = () => {
    if (engineRef.current) {
      engineRef.current.reset()
    }
    setIsRecording(false)
    setSecondsLeft(getSessionLimit())
    setSessionDuration(0)
    setShowFreezeAlert(false)
    freezeTriggeredRef.current = false
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (fallbackMode) {
    return (
      <div className="space-y-4">
        <Alert className="bg-[#FBBF24]/20 border-[#FBBF24] border-2">
          <AlertTriangle className="h-5 w-5 text-[#FBBF24]" />
          <AlertTitle className="text-white font-bold">Microphone Not Available</AlertTitle>
          <AlertDescription className="text-[#CFFAFE]">
            Web Speech API is not supported in this browser. Using text input mode instead.
          </AlertDescription>
        </Alert>
        <div>
          <label className="text-white text-base md:text-lg font-medium mb-2 md:mb-3 block">Call Transcript / Audio Text</label>
          <div className="relative">
            <Mic className="absolute left-3 md:left-4 top-3 md:top-4 w-4 h-4 md:w-5 md:h-5 text-[#A1A1AA]" />
            <Textarea
              value={fallbackText}
              onChange={(e) => setFallbackText(e.target.value)}
              placeholder="Enter call transcript or paste conversation text here..."
              className="min-h-32 md:min-h-40 bg-[#11243D] border-2 border-[#14B8A6]/30 focus:border-[#14B8A6] text-white placeholder:text-[#A1A1AA] text-base md:text-lg pl-10 md:pl-12 rounded-[10px] leading-relaxed"
              style={{ lineHeight: '1.6' }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Freeze Mode Alert Animation */}
      {showFreezeAlert && (
        <Alert className="bg-[#EF4444]/20 border-[#EF4444] border-2 pulse-glow animate-pulse">
          <AlertTriangle className="h-6 w-6 text-[#EF4444]" />
          <AlertTitle className="text-[#EF4444] font-bold text-xl">
            🚨 FREEZE MODE ACTIVATED
          </AlertTitle>
          <AlertDescription className="text-white text-lg">
            High scam probability detected! Protective measures engaged.
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Status with Progress Bar */}
      <div className="bg-[#0A1A2F] border border-[#14B8A6]/30 rounded-[10px] p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-white font-bold text-sm md:text-base">
              {subscriptionTier === 'free' && '🔒 FREE - 20 Second Limit'}
              {subscriptionTier === 'premium' && '✅ PRO - 5 Minute Sessions'}
              {subscriptionTier === 'ultra' && '⭐ ELITE - Unlimited + Advanced Tools'}
            </div>
            <div className="text-[#CFFAFE] text-xs md:text-sm mt-1">
              {subscriptionTier === 'free' && 'Upgrade to unlock longer sessions'}
              {subscriptionTier === 'premium' && 'Full voice analysis enabled'}
              {subscriptionTier === 'ultra' && 'All advanced features unlocked'}
            </div>
          </div>
        </div>
        {/* Progress Bar for FREE tier */}
        {subscriptionTier === 'free' && isRecording && (
          <div className="mt-2">
            <Progress 
              value={((20 - secondsLeft) / 20) * 100} 
              className="h-2 md:h-3"
            />
            <div className="text-[#FBBF24] text-xs md:text-sm mt-1 text-center font-bold">
              {formatTime(secondsLeft)} remaining
            </div>
          </div>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <Alert className="bg-[#14B8A6]/20 border-[#14B8A6] border-2">
          <Mic className="h-5 w-5 text-[#14B8A6] animate-pulse" />
          <AlertTitle className="text-white font-bold text-base md:text-lg">
            🎙️ Recording Active - {formatTime(sessionDuration)}
          </AlertTitle>
          <AlertDescription className="text-[#CFFAFE] text-sm md:text-base">
            Analyzing voice patterns every 3 seconds
          </AlertDescription>
        </Alert>
      )}

      {/* Microphone Button */}
      <div className="flex flex-col items-center gap-4 py-4 md:py-6">
        {!isRecording ? (
          <Button 
            onClick={startRecording}
            className="w-full max-w-md h-16 md:h-20 bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-[#0A1A2F] font-bold text-lg md:text-xl rounded-[16px] shadow-[0_0_20px_#14B8A6] transition-all hover:scale-105"
          >
            <Mic className="w-6 h-6 md:w-8 md:h-8 mr-3" />
            Start Voice Shield™
          </Button>
        ) : (
          <Button 
            onClick={stopRecording}
            className="w-full max-w-md h-16 md:h-20 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-lg md:text-xl rounded-[16px] shadow-[0_0_20px_#EF4444] transition-all hover:scale-105 animate-pulse"
          >
            <Activity className="w-6 h-6 md:w-8 md:h-8 mr-3" />
            Stop Recording
          </Button>
        )}
        <Button 
          onClick={resetSession}
          variant="outline"
          className="border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6]/10 font-bold text-sm md:text-base px-6 md:px-8 py-2 md:py-3 rounded-[12px]"
        >
          Reset Session
        </Button>
      </div>

      {/* AI Processing Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-[#14B8A6] text-sm md:text-base">
          <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse"></div>
          <span>AI Processing Active</span>
          <div className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      )}

      {/* Note: Live Transcript, Deception Probability, and other analysis panels */}
      {/* are rendered separately below this component in the Voice Shield tab */}
    </div>
  )
}
