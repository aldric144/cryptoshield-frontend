import { useState } from 'react'
import { ThreatInputPanel } from './ThreatInputPanel'
import { ThreatSummaryBar } from './ThreatSummaryBar'
import { ModuleCard } from './ModuleCard'
import { VerdictCard } from './VerdictCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://cryptoshield-backend-i830.onrender.com'

interface AnalysisResult {
  threat_level: string
  scam_probability: number
  ai_confidence: number
  verdict: string
  is_scam: boolean
  recommendation: string
  modules: {
    title: string
    score: number
    explanation: string
    details?: string[]
  }[]
}

export function ScanPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (text: string) => {
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const response = await fetch(`${API_URL}/api/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      const result: AnalysisResult = {
        threat_level: data.threat_level || 'UNKNOWN',
        scam_probability: data.scam_probability || 0,
        ai_confidence: data.ai_confidence || 0,
        verdict: data.verdict || 'Analysis Complete',
        is_scam: data.is_scam || false,
        recommendation: data.recommendation || 'Review the analysis results carefully.',
        modules: data.modules || []
      }

      setAnalysisResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0F1A] p-6">
      {/* FBI-style header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-[#F5C461] tracking-wider">
            SCAM INTELLIGENCE SCANNER
          </h1>
          <p className="text-[#00B4A0] text-lg">
            FBI-Grade Threat Analysis System
          </p>
          <div className="h-1 w-32 bg-[#F5C461] mx-auto mt-4"></div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          <ThreatInputPanel onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {error && (
            <Alert className="bg-[#EF4444]/10 border-[#EF4444]">
              <AlertCircle className="h-4 w-4 text-[#EF4444]" />
              <AlertDescription className="text-[#EF4444]">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isAnalyzing && (
            <div className="bg-[#0A1A2F] border-2 border-[#F5C461] rounded-lg p-12 text-center">
              <div className="animate-pulse space-y-4">
                <div className="text-[#F5C461] text-2xl font-bold">
                  ANALYZING THREAT DATA...
                </div>
                <div className="text-[#00B4A0] text-sm">
                  Running AI intelligence modules
                </div>
                <div className="flex justify-center gap-2 mt-6">
                  <div className="w-3 h-3 bg-[#F5C461] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-[#F5C461] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-[#F5C461] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {analysisResult && (
            <>
              {/* Summary Bar */}
              <ThreatSummaryBar
                threatLevel={analysisResult.threat_level}
                scamProbability={analysisResult.scam_probability}
                aiConfidence={analysisResult.ai_confidence}
              />

              {/* Module Cards */}
              <div className="space-y-4">
                {analysisResult.modules.map((module, index) => (
                  <ModuleCard
                    key={index}
                    title={module.title}
                    score={module.score}
                    explanation={module.explanation}
                    details={module.details}
                  />
                ))}
              </div>

              {/* Verdict Card */}
              <VerdictCard
                verdict={analysisResult.verdict}
                isScam={analysisResult.is_scam}
                confidence={analysisResult.ai_confidence}
                recommendation={analysisResult.recommendation}
              />
            </>
          )}

          {!analysisResult && !isAnalyzing && !error && (
            <div className="bg-[#0A1A2F] border border-[#F5C461]/30 rounded-lg p-12 text-center">
              <div className="text-gray-400 text-lg">
                Enter text and click "Run Scam Intelligence Scan" to begin analysis
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FBI-style footer */}
      <div className="max-w-7xl mx-auto mt-12 text-center text-gray-500 text-xs">
        <div className="h-px w-full bg-[#F5C461]/20 mb-4"></div>
        <p>CRYPTOSHIELD GUARDIAN AI™ | THREAT INTELLIGENCE DIVISION</p>
        <p className="mt-1">All communications are analyzed using advanced AI algorithms and pattern recognition</p>
      </div>
    </div>
  )
}
