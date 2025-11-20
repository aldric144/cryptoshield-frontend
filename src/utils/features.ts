/**
 * Centralized Subscription Features Configuration
 * Defines feature access requirements for each subscription tier
 */

export type SubscriptionTier = 'free' | 'premium' | 'ultra' | 'enterprise';

export interface FeatureConfig {
  requiredTier: SubscriptionTier;
  quota?: {
    free?: number;
    premium?: number;
    ultra?: number;
  };
  description: string;
}

/**
 * Feature access configuration map
 * Maps feature keys to their access requirements
 */
export const FEATURES: Record<string, FeatureConfig> = {
  manual_text_analysis: {
    requiredTier: 'free',
    description: 'Manual text scam analysis',
  },
  realtime_voice: {
    requiredTier: 'premium',
    description: 'Real-time voice stream analysis',
  },
  emotional_ai: {
    requiredTier: 'premium',
    description: 'Emotional manipulation detection',
  },
  dark_pattern_analysis: {
    requiredTier: 'premium',
    description: 'Dark pattern voice fingerprinting',
  },
  nationality_prediction: {
    requiredTier: 'premium',
    description: 'ML nationality prediction',
  },
  threat_level_calculation: {
    requiredTier: 'premium',
    description: 'Homeland Security threat level meter',
  },
  scammer_profile: {
    requiredTier: 'premium',
    description: 'Scammer profile builder',
  },
  voice_lineup: {
    requiredTier: 'ultra',
    description: 'Voice line-up matching',
  },

  wallet_risk_check: {
    requiredTier: 'free',
    quota: {
      free: 1,
      premium: -1, // unlimited
      ultra: -1,
    },
    description: 'Wallet risk score check',
  },
  wallet_lineage: {
    requiredTier: 'premium',
    description: 'Wallet lineage tracing',
  },
  scam_wallet_index: {
    requiredTier: 'premium',
    description: 'Known scam wallet database',
  },
  dark_web_monitoring: {
    requiredTier: 'ultra',
    description: 'Dark web wallet monitoring',
  },
  scammer_network_intel: {
    requiredTier: 'ultra',
    description: 'Scammer network intelligence',
  },

  gps_warnings: {
    requiredTier: 'free',
    description: 'GPS location warnings',
  },
  fraud_hotmap: {
    requiredTier: 'premium',
    description: 'Fraud HOTMAP visualization',
  },
  high_fraud_store_locator: {
    requiredTier: 'premium',
    description: 'High-fraud store locator',
  },
  travel_mode: {
    requiredTier: 'premium',
    description: 'Travel mode protection',
  },
  ultra_travel_mode: {
    requiredTier: 'ultra',
    description: 'Ultra travel mode with enhanced alerts',
  },

  family_center: {
    requiredTier: 'premium',
    quota: {
      free: 0,
      premium: 3,
      ultra: 10,
    },
    description: 'Family trusted contacts',
  },

  case_reports: {
    requiredTier: 'free',
    quota: {
      free: 1,
      premium: -1, // unlimited
      ultra: -1,
    },
    description: 'Case reports generation',
  },
  pdf_export: {
    requiredTier: 'free',
    quota: {
      free: 1,
      premium: -1,
      ultra: -1,
    },
    description: 'PDF report export',
  },
  qr_export: {
    requiredTier: 'free',
    quota: {
      free: 1,
      premium: -1,
      ultra: -1,
    },
    description: 'QR code generation',
  },
  case_timeline: {
    requiredTier: 'premium',
    description: 'Case session timeline',
  },
  police_grade_reports: {
    requiredTier: 'premium',
    description: 'Police-grade call reconstruction',
  },

  manual_freeze: {
    requiredTier: 'free',
    description: 'Manual freeze mode',
  },
  auto_freeze: {
    requiredTier: 'premium',
    description: 'Automatic freeze mode',
  },
  night_mode_protection: {
    requiredTier: 'premium',
    description: 'Enhanced night mode protection',
  },
};

/**
 * Session-based dismissal tracking for paywall
 * Prevents "Maybe Later" loop by tracking dismissed features
 */
const dismissedFeatures = new Set<string>();

export function dismissPaywall(feature: string) {
  dismissedFeatures.add(feature);
}

export function isPaywallDismissed(feature: string): boolean {
  return dismissedFeatures.has(feature);
}

export function clearDismissedPaywalls() {
  dismissedFeatures.clear();
}

/**
 * Get tier hierarchy level for comparison
 */
function getTierLevel(tier: SubscriptionTier): number {
  const levels: Record<SubscriptionTier, number> = {
    free: 0,
    premium: 1,
    ultra: 2,
    enterprise: 3,
  };
  return levels[tier] || 0;
}

/**
 * Check if user's tier meets the required tier for a feature
 */
export function hasTierAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  return getTierLevel(userTier) >= getTierLevel(requiredTier);
}

/**
 * Normalize tier name from backend to SubscriptionTier type
 */
export function normalizeTierName(tierName: string): SubscriptionTier {
  const normalized = tierName.toLowerCase().trim();
  if (normalized.includes('ultra')) return 'ultra';
  if (normalized.includes('premium') || normalized.includes('pro')) return 'premium';
  if (normalized.includes('enterprise')) return 'enterprise';
  return 'free';
}
