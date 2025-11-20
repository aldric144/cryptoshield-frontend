import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ThreatInputPanelProps {
  onAnalyze: (text: string) => void
  isLoading: boolean
}

export function ThreatInputPanel({ onAnalyze, isLoading }: ThreatInputPanelProps) {
  const [inputText, setInputText] = useState('')

  const handleAnalyze = () => {
    if (inputText.trim()) {
      onAnalyze(inputText)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setInputText(text)
      }
      reader.readAsText(file)
    }
  }

  return (
    <Card className="bg-[#0A0F1A] border-[#F5C461] border-2 shadow-[0_0_20px_rgba(245,196,97,0.3)]">
      <CardHeader>
        <CardTitle className="text-[#F5C461] text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Threat Intelligence Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-[#00B4A0] text-sm font-semibold mb-2 block">
            PASTE OR TYPE TRANSCRIPT / COMMUNICATION
          </label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter suspicious call transcript, text message, email, or any communication you want to analyze for scam indicators..."
            className="min-h-[300px] bg-[#0A1A2F] border-[#F5C461] text-white placeholder:text-gray-500 focus:ring-[#F5C461] focus:border-[#F5C461] font-mono text-sm"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="file"
              id="file-upload"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isLoading}
            />
            <label htmlFor="file-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-[#0A1A2F] border-[#00B4A0] text-[#00B4A0] hover:bg-[#00B4A0] hover:text-[#0A0F1A] transition-all"
                disabled={isLoading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </label>
          </div>

          <div className="flex-1">
            <Button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isLoading}
              className="w-full bg-[#F5C461] text-[#0A0F1A] hover:bg-[#F5C461]/90 font-bold text-lg py-6 shadow-[0_0_30px_rgba(245,196,97,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isLoading ? 'ANALYZING...' : '⚡ Run Scam Intelligence Scan'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center">
          All data is analyzed securely. No information is stored without your consent.
        </div>
      </CardContent>
    </Card>
  )
}
