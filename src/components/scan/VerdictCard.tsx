import { AlertTriangle, CheckCircle, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface VerdictCardProps {
  verdict: string
  isScam: boolean
  confidence: number
  recommendation: string
}

export function VerdictCard({ verdict, isScam, confidence, recommendation }: VerdictCardProps) {
  return (
    <Card className={`border-4 ${isScam ? 'border-[#EF4444]' : 'border-[#00B4A0]'} bg-[#0A0F1A] shadow-[0_0_30px_rgba(245,196,97,0.4)]`}>
      <CardHeader>
        <CardTitle className="text-[#F5C461] text-2xl font-bold flex items-center gap-3">
          <Shield className="w-7 h-7" />
          AI VERDICT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Verdict */}
        <div className="flex items-center gap-4">
          {isScam ? (
            <AlertTriangle className="w-16 h-16 text-[#EF4444]" />
          ) : (
            <CheckCircle className="w-16 h-16 text-[#00B4A0]" />
          )}
          <div className="flex-1">
            <div className={`text-3xl font-bold uppercase ${isScam ? 'text-[#EF4444]' : 'text-[#00B4A0]'}`}>
              {verdict}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              Confidence: {confidence.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-[#0A1A2F] border border-[#F5C461]/30 rounded-lg p-4">
          <div className="text-[#F5C461] text-sm font-semibold mb-2 uppercase">
            Recommended Action:
          </div>
          <p className="text-white text-base leading-relaxed">
            {recommendation}
          </p>
        </div>

        {/* Warning Banner */}
        {isScam && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
              <div className="text-[#EF4444] text-sm">
                <strong>HIGH RISK DETECTED:</strong> Do not proceed with any financial transactions. 
                Do not share personal information. Consider reporting this to authorities.
              </div>
            </div>
          </div>
        )}

        {/* Safe Banner */}
        {!isScam && (
          <div className="bg-[#00B4A0]/10 border border-[#00B4A0] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#00B4A0] mt-0.5 flex-shrink-0" />
              <div className="text-[#00B4A0] text-sm">
                <strong>LOW RISK:</strong> While this communication appears safe, always remain vigilant 
                and verify identities through official channels before sharing sensitive information.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
