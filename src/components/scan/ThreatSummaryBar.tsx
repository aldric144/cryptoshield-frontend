import { AlertTriangle, Shield, TrendingUp } from 'lucide-react'

interface ThreatSummaryBarProps {
  threatLevel: string
  scamProbability: number
  aiConfidence: number
}

export function ThreatSummaryBar({ threatLevel, scamProbability, aiConfidence }: ThreatSummaryBarProps) {
  const getThreatColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
      case 'high':
        return '#EF4444'
      case 'medium':
      case 'moderate':
        return '#F59E0B'
      case 'low':
        return '#00B4A0'
      default:
        return '#6B7280'
    }
  }

  const threatColor = getThreatColor(threatLevel)

  return (
    <div className="bg-[#0A0F1A] border-2 border-[#F5C461] rounded-lg p-6 shadow-[0_0_20px_rgba(245,196,97,0.3)]">
      <div className="grid grid-cols-3 gap-6">
        {/* Threat Level */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#F5C461] text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            THREAT LEVEL
          </div>
          <div 
            className="text-3xl font-bold uppercase"
            style={{ color: threatColor }}
          >
            {threatLevel}
          </div>
          <div className="w-full bg-[#0A1A2F] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${threatLevel.toLowerCase() === 'critical' ? 100 : threatLevel.toLowerCase() === 'high' ? 80 : threatLevel.toLowerCase() === 'medium' ? 60 : threatLevel.toLowerCase() === 'moderate' ? 50 : 30}%`,
                backgroundColor: threatColor
              }}
            />
          </div>
        </div>

        {/* Scam Probability */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#F5C461] text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            SCAM PROBABILITY
          </div>
          <div className="text-3xl font-bold text-white">
            {scamProbability.toFixed(1)}%
          </div>
          <div className="w-full bg-[#0A1A2F] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${scamProbability}%`,
                backgroundColor: scamProbability > 70 ? '#EF4444' : scamProbability > 40 ? '#F59E0B' : '#00B4A0'
              }}
            />
          </div>
        </div>

        {/* AI Confidence */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#F5C461] text-sm font-semibold">
            <Shield className="w-4 h-4" />
            AI CONFIDENCE
          </div>
          <div className="text-3xl font-bold text-[#00B4A0]">
            {aiConfidence.toFixed(1)}%
          </div>
          <div className="w-full bg-[#0A1A2F] rounded-full h-2">
            <div
              className="bg-[#00B4A0] h-2 rounded-full transition-all duration-500"
              style={{ width: `${aiConfidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
