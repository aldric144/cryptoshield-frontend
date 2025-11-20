import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EmotionAnalysis } from '@/modules/voice/engine';

interface EmotionMeterProps {
  emotions: EmotionAnalysis | null;
}

export function EmotionMeter({ emotions }: EmotionMeterProps) {
  if (!emotions) {
    return (
      <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
            <span>😠</span>
            Emotional Tone Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#CFFAFE] text-center py-4">
            Analyzing emotional patterns...
          </p>
        </CardContent>
      </Card>
    );
  }

  const emotionData = [
    { label: 'Anger', value: emotions.anger, color: '#EF4444', emoji: '😠' },
    { label: 'Calm Manipulation', value: emotions.calmManipulation, color: '#F59E0B', emoji: '😌' },
    { label: 'Gaslighting', value: emotions.gaslighting, color: '#8B5CF6', emoji: '🌀' },
    { label: 'Threatening', value: emotions.threatening, color: '#DC2626', emoji: '⚠️' },
    { label: 'Seduction/Love Bombing', value: emotions.seduction, color: '#EC4899', emoji: '💕' },
  ];

  return (
    <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
          <span>😠</span>
          Emotional Tone Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emotionData.map((emotion) => (
            <div key={emotion.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#CFFAFE] text-sm md:text-base flex items-center gap-2">
                  <span>{emotion.emoji}</span>
                  {emotion.label}
                </span>
                <span
                  className="font-bold text-sm md:text-base"
                  style={{ color: emotion.color }}
                >
                  {emotion.value.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={emotion.value}
                className="h-2 md:h-3"
                style={{
                  backgroundColor: '#1E3A5F',
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
