import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ModuleCardProps {
  title: string
  score: number
  explanation: string
  details?: string[]
}

export function ModuleCard({ title, score, explanation, details }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#EF4444'
    if (score >= 40) return '#F59E0B'
    return '#00B4A0'
  }

  const scoreColor = getScoreColor(score)

  return (
    <Card className="bg-[#0A1A2F] border border-[#F5C461]/30 hover:border-[#F5C461] transition-all cursor-pointer">
      <CardHeader 
        className="pb-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#F5C461] text-lg font-semibold flex items-center gap-2">
            {title}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div 
              className="text-2xl font-bold"
              style={{ color: scoreColor }}
            >
              {score}%
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-[#F5C461]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#F5C461]" />
            )}
          </div>
        </div>
        
        {/* Score bar */}
        <div className="w-full bg-[#0A0F1A] rounded-full h-2 mt-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: scoreColor
            }}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-gray-300 text-sm leading-relaxed">
            {explanation}
          </p>
          
          {details && details.length > 0 && (
            <div className="space-y-2">
              <div className="text-[#00B4A0] text-xs font-semibold uppercase">
                Detected Indicators:
              </div>
              <ul className="space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="text-gray-400 text-xs flex items-start gap-2">
                    <span className="text-[#F5C461] mt-1">▸</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
