import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TimelineEntry } from '@/modules/voice/engine';

interface ManipulationTimelineProps {
  timeline: TimelineEntry[];
}

export function ManipulationTimeline({ timeline }: ManipulationTimelineProps) {
  const getSeverityColor = (severity: TimelineEntry['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-[#DC2626] text-white';
      case 'high':
        return 'bg-[#EF4444] text-white';
      case 'medium':
        return 'bg-[#F59E0B] text-white';
      case 'low':
        return 'bg-[#00B4A0] text-white';
      default:
        return 'bg-[#6B7280] text-white';
    }
  };

  const getTypeLabel = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'manipulation':
        return '⚠️ Manipulation';
      case 'urgency':
        return '🚨 Urgency';
      case 'impersonation':
        return '🎭 Impersonation';
      case 'coercion':
        return '❗ Coercion';
      case 'grooming':
        return '💔 Grooming';
      default:
        return '⚠️ Alert';
    }
  };

  return (
    <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
          <span>📊</span>
          Manipulation Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="text-[#CFFAFE] text-center py-4">
            No manipulation patterns detected yet
          </p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {timeline.slice().reverse().map((entry, index) => (
              <div
                key={index}
                className="border-l-4 pl-4 py-2"
                style={{
                  borderColor:
                    entry.severity === 'critical'
                      ? '#DC2626'
                      : entry.severity === 'high'
                      ? '#EF4444'
                      : entry.severity === 'medium'
                      ? '#F59E0B'
                      : '#00B4A0',
                }}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className={getSeverityColor(entry.severity)}>
                    {entry.severity.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-[#CFFAFE]">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-xs text-[#CFFAFE]">
                    {getTypeLabel(entry.type)}
                  </span>
                </div>
                <p className="text-white text-sm md:text-base mb-2 font-semibold">
                  "{entry.utterance}"
                </p>
                <p className="text-[#CFFAFE] text-xs md:text-sm italic">
                  AI Analysis: {entry.interpretation}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
