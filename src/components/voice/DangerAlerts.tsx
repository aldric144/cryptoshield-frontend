import { Alert, AlertDescription } from '@/components/ui/alert';
import { DangerAlert } from '@/modules/voice/engine';
import { AlertTriangle, Shield, UserX, Zap, Heart } from 'lucide-react';

interface DangerAlertsProps {
  alerts: DangerAlert[];
}

export function DangerAlerts({ alerts }: DangerAlertsProps) {
  if (alerts.length === 0) return null;

  const getAlertIcon = (type: DangerAlert['type']) => {
    switch (type) {
      case 'manipulation':
        return <AlertTriangle className="w-5 h-5" />;
      case 'urgency':
        return <Zap className="w-5 h-5" />;
      case 'impersonation':
        return <UserX className="w-5 h-5" />;
      case 'coercion':
        return <Shield className="w-5 h-5" />;
      case 'grooming':
        return <Heart className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: DangerAlert['type']) => {
    switch (type) {
      case 'manipulation':
        return 'bg-[#F59E0B] border-[#F59E0B]';
      case 'urgency':
        return 'bg-[#EF4444] border-[#EF4444]';
      case 'impersonation':
        return 'bg-[#EF4444] border-[#EF4444]';
      case 'coercion':
        return 'bg-[#DC2626] border-[#DC2626]';
      case 'grooming':
        return 'bg-[#F59E0B] border-[#F59E0B]';
      default:
        return 'bg-[#EF4444] border-[#EF4444]';
    }
  };

  const recentAlerts = alerts.slice(-3).reverse();

  return (
    <div className="space-y-2">
      {recentAlerts.map((alert) => (
        <Alert
          key={alert.id}
          className={`${getAlertColor(alert.type)} border-2 text-white animate-pulse`}
        >
          <div className="flex items-center gap-3">
            {getAlertIcon(alert.type)}
            <AlertDescription className="text-white font-bold text-sm md:text-base">
              {alert.message}
            </AlertDescription>
          </div>
        </Alert>
      ))}
    </div>
  );
}
