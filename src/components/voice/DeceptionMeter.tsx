import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DeceptionMeterProps {
  probability: number;
}

export function DeceptionMeter({ probability }: DeceptionMeterProps) {
  const getColor = (value: number) => {
    if (value >= 70) return '#EF4444';
    if (value >= 40) return '#F59E0B';
    return '#00B4A0';
  };

  const getLabel = (value: number) => {
    if (value >= 80) return 'CRITICAL';
    if (value >= 60) return 'HIGH';
    if (value >= 40) return 'MODERATE';
    if (value >= 20) return 'LOW';
    return 'MINIMAL';
  };

  return (
    <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
          <span>🎯</span>
          Deception Probability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[#CFFAFE] text-sm md:text-base">Detection Level:</span>
            <span
              className="font-bold text-lg md:text-xl"
              style={{ color: getColor(probability) }}
            >
              {getLabel(probability)}
            </span>
          </div>
          <div className="space-y-2">
            <Progress
              value={probability}
              className="h-4 md:h-6"
              style={{
                backgroundColor: '#1E3A5F',
              }}
            />
            <div className="flex justify-between text-xs md:text-sm text-[#CFFAFE]">
              <span>0%</span>
              <span
                className="font-bold text-base md:text-lg"
                style={{ color: getColor(probability) }}
              >
                {probability.toFixed(1)}%
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
