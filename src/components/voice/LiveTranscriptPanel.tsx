import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TranscriptEntry } from '@/modules/voice/engine';

interface LiveTranscriptPanelProps {
  transcript: TranscriptEntry[];
  isListening: boolean;
}

export function LiveTranscriptPanel({ transcript, isListening }: LiveTranscriptPanelProps) {
  return (
    <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
          <span>📝</span>
          Live Transcript
          {isListening && (
            <span className="ml-auto text-sm text-[#14B8A6] flex items-center gap-1">
              <span className="w-2 h-2 bg-[#14B8A6] rounded-full animate-pulse"></span>
              Recording
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {transcript.length === 0 ? (
            <div className="text-[#CFFAFE] text-center py-8">
              {isListening ? (
                <p>Listening... Start speaking to see transcript</p>
              ) : (
                <p>Click "Start Listening" to begin voice analysis</p>
              )}
            </div>
          ) : (
            transcript.map((entry, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  entry.speaker === 'user'
                    ? 'bg-[#14B8A6]/20 border-l-4 border-[#14B8A6]'
                    : 'bg-[#EF4444]/20 border-l-4 border-[#EF4444]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">
                    {entry.speaker === 'user' ? 'You:' : 'Scammer:'}
                  </span>
                  <span className="text-xs text-[#CFFAFE]">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white text-sm md:text-base">{entry.text}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
