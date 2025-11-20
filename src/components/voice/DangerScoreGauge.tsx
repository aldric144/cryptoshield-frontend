import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DangerScoreGaugeProps {
  score: number;
}

export function DangerScoreGauge({ score }: DangerScoreGaugeProps) {
  const getColor = (value: number) => {
    if (value >= 70) return '#EF4444';
    if (value >= 50) return '#F59E0B';
    if (value >= 30) return '#F59E0B';
    return '#00B4A0';
  };

  const getLabel = (value: number) => {
    if (value >= 80) return 'EXTREME DANGER';
    if (value >= 60) return 'HIGH DANGER';
    if (value >= 40) return 'MODERATE RISK';
    if (value >= 20) return 'LOW RISK';
    return 'SAFE';
  };

  const getEmoji = (value: number) => {
    if (value >= 80) return '🚨';
    if (value >= 60) return '⚠️';
    if (value >= 40) return '⚡';
    if (value >= 20) return '🟡';
    return '✅';
  };

  return (
    <Card
      className="border-4 rounded-[14px]"
      style={{
        borderColor: getColor(score),
        backgroundColor: '#132B45',
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
          <span>🎯</span>
          Instant Danger Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-8"
            style={{
              borderColor: getColor(score),
              backgroundColor: `${getColor(score)}20`,
            }}
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-2">{getEmoji(score)}</div>
              <div
                className="text-3xl md:text-4xl font-bold"
                style={{ color: getColor(score) }}
              >
                {score}%
              </div>
            </div>
          </div>

          <div
            className="text-center font-bold text-lg md:text-xl px-4 py-2 rounded-lg"
            style={{
              color: getColor(score),
              backgroundColor: `${getColor(score)}20`,
            }}
          >
            {getLabel(score)}
          </div>

          <div className="w-full bg-[#1E3A5F] rounded-full h-4 md:h-6 overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${score}%`,
                backgroundColor: getColor(score),
              }}
            />
          </div>

          <p className="text-[#CFFAFE] text-xs md:text-sm text-center">
            Updates every 3-5 seconds based on real-time analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
