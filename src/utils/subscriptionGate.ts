/**
 * Subscription Gate Helper
 * Centralized subscription gating with dismissal tracking
 */

import {
  FEATURES,
  dismissPaywall,
  isPaywallDismissed,
  hasTierAccess,
  normalizeTierName,
  type SubscriptionTier,
} from './features';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Usage counters for FREE tier quotas
 * In production, these should be tracked by the backend
 */
const usageCounters = {
  walletScans: 0,
  reports: 0,
};

export function resetUsageCounters() {
  usageCounters.walletScans = 0;
  usageCounters.reports = 0;
}

export function incrementWalletScan() {
  usageCounters.walletScans++;
}

export function incrementReport() {
  usageCounters.reports++;
}

export function getWalletScansRemaining(tier: SubscriptionTier): number {
  if (tier !== 'free') return -1; // unlimited
  const quota = FEATURES.wallet_risk_check.quota?.free || 1;
  return Math.max(0, quota - usageCounters.walletScans);
}

export function getReportsRemaining(tier: SubscriptionTier): number {
  if (tier !== 'free') return -1; // unlimited
  const quota = FEATURES.case_reports.quota?.free || 1;
  return Math.max(0, quota - usageCounters.reports);
}

/**
 * Gate result interface
 */
export interface GateResult {
  allowed: boolean;
  reason?: string;
  upgradeMessage?: string;
  remaining?: number;
}

/**
 * Check if user has access to a feature
 * This is the centralized gating function that should be used everywhere
 */
export async function gate(
  featureKey: string,
  userId: string,
  userTier?: SubscriptionTier
): Promise<GateResult> {
  if (isPaywallDismissed(featureKey)) {
    return {
      allowed: false,
      reason: 'dismissed',
      upgradeMessage: 'You dismissed this upgrade prompt. Refresh to see it again.',
    };
  }

  const feature = FEATURES[featureKey];
  if (!feature) {
    console.warn(`Unknown feature: ${featureKey}`);
    return { allowed: true }; // Allow unknown features by default
  }

  let tier = userTier;
  if (!tier) {
    try {
      const response = await fetch(`${API_URL}/api/subscription/user/${userId}`);
      const data = await response.json();
      tier = normalizeTierName(data.tier_name || 'free');
    } catch (error) {
      console.error('Error fetching user tier:', error);
      tier = 'free'; // Default to free on error
    }
  }

  if (!hasTierAccess(tier, feature.requiredTier)) {
    return {
      allowed: false,
      reason: 'tier',
      upgradeMessage: `${feature.description} requires ${feature.requiredTier.toUpperCase()} tier or higher.`,
    };
  }

  if (tier === 'free' && feature.quota) {
    const quota = feature.quota.free || 0;
    
    if (featureKey === 'wallet_risk_check') {
      if (usageCounters.walletScans >= quota) {
        return {
          allowed: false,
          reason: 'quota',
          upgradeMessage: `You've used your ${quota} free wallet scan${quota > 1 ? 's' : ''} this session. Upgrade to PREMIUM for unlimited scans.`,
          remaining: 0,
        };
      }
      return {
        allowed: true,
        remaining: quota - usageCounters.walletScans,
      };
    }
    
    if (featureKey === 'case_reports' || featureKey === 'pdf_export' || featureKey === 'qr_export') {
      if (usageCounters.reports >= quota) {
        return {
          allowed: false,
          reason: 'quota',
          upgradeMessage: `You've used your ${quota} free report${quota > 1 ? 's' : ''} this session. Upgrade to PREMIUM for unlimited reports.`,
          remaining: 0,
        };
      }
      return {
        allowed: true,
        remaining: quota - usageCounters.reports,
      };
    }
  }

  return { allowed: true };
}

/**
 * Handle paywall dismissal
 * Tracks dismissed features to prevent "Maybe Later" loop
 */
export function handlePaywallDismissal(featureKey: string) {
  dismissPaywall(featureKey);
}

/**
 * Check if feature should show paywall
 * Returns true if paywall should be shown
 */
export async function shouldShowPaywall(
  featureKey: string,
  userId: string,
  userTier?: SubscriptionTier
): Promise<boolean> {
  const result = await gate(featureKey, userId, userTier);
  return !result.allowed && result.reason !== 'dismissed';
}
