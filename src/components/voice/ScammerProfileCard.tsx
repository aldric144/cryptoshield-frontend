import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScammerProfile } from '@/modules/voice/engine';

interface ScammerProfileCardProps {
  profile: ScammerProfile | null;
}

export function ScammerProfileCard({ profile }: ScammerProfileCardProps) {
  if (!profile) {
    return (
      <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
            <span>🕵️</span>
            Scammer Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#CFFAFE] text-center py-4">
            Building scammer profile...
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level: ScammerProfile['riskLevel']) => {
    switch (level) {
      case 'extreme':
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

  return (
    <Card className="bg-[#132B45] border-[#14B8A6]/30 border-2 rounded-[14px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg md:text-xl font-bold flex items-center gap-2">
          <span>🕵️</span>
          Scammer Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[#CFFAFE] text-sm md:text-base">Risk Level:</span>
            <Badge className={getRiskColor(profile.riskLevel)}>
              {profile.riskLevel.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#CFFAFE] text-sm">Archetype:</span>
              <span className="text-white font-semibold text-sm md:text-base">
                {profile.archetype}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#CFFAFE] text-sm">Primary Technique:</span>
              <span className="text-white font-semibold text-sm md:text-base">
                {profile.primaryTechnique}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#CFFAFE] text-sm">Secondary Technique:</span>
              <span className="text-white font-semibold text-sm md:text-base">
                {profile.secondaryTechnique}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[#CFFAFE] text-sm">Emotional Pattern:</span>
            <p className="text-white text-sm md:text-base italic">
              "{profile.emotionalPattern}"
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#CFFAFE] text-sm">Aggression Index:</span>
              <span className="text-white font-bold text-sm md:text-base">
                {profile.aggressionIndex}%
              </span>
            </div>
            <Progress
              value={profile.aggressionIndex}
              className="h-2 md:h-3"
              style={{
                backgroundColor: '#1E3A5F',
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
