import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.warn('Airtable credentials not configured. Using default tier settings.');
}

const base = process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID
  ? new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
  : null;

export interface TierConfig {
  tierName: string; // 'trial', 'basic', 'pro'
  displayName: string;
  pricing: {
    gbp: number;
    eur: number;
    usd: number;
  };
  trialDurationDays?: number;
  maxJobsPerMonth: number | null; // null = unlimited
  maxCompetitors: number;
  aiCreditsPerMonth: number;
  insightGenerationSchedule: 'daily' | 'every_3_days' | 'weekly' | 'monthly';
  insightGenerationTime: string; // e.g., '09:00'
  aiModel: string; // e.g., 'gpt-4o-mini', 'gpt-4o'
  features: {
    advancedAnalytics: boolean;
    competitorAlerts: boolean;
    exportReports: boolean;
    apiAccess: boolean;
    whatsappIntegration: boolean;
    prioritySupport: boolean;
  };
}

// Default configuration if Airtable is not available
const DEFAULT_TIER_CONFIG: TierConfig[] = [
  {
    tierName: 'trial',
    displayName: 'Free Trial',
    pricing: { gbp: 0, eur: 0, usd: 0 },
    trialDurationDays: 30,
    maxJobsPerMonth: 50,
    maxCompetitors: 3,
    aiCreditsPerMonth: 3,
    insightGenerationSchedule: 'weekly',
    insightGenerationTime: '09:00',
    aiModel: 'gpt-4o-mini',
    features: {
      advancedAnalytics: false,
      competitorAlerts: false,
      exportReports: false,
      apiAccess: false,
      whatsappIntegration: false,
      prioritySupport: false,
    },
  },
  {
    tierName: 'basic',
    displayName: 'Basic',
    pricing: { gbp: 8.99, eur: 10.99, usd: 12.99 },
    maxJobsPerMonth: 50,
    maxCompetitors: 5,
    aiCreditsPerMonth: 7,
    insightGenerationSchedule: 'every_3_days',
    insightGenerationTime: '09:00',
    aiModel: 'gpt-4o-mini',
    features: {
      advancedAnalytics: false,
      competitorAlerts: true,
      exportReports: false,
      apiAccess: false,
      whatsappIntegration: false,
      prioritySupport: false,
    },
  },
  {
    tierName: 'pro',
    displayName: 'Pro',
    pricing: { gbp: 16.99, eur: 19.99, usd: 23.99 },
    maxJobsPerMonth: 200,
    maxCompetitors: 10,
    aiCreditsPerMonth: 20,
    insightGenerationSchedule: 'daily',
    insightGenerationTime: '09:00',
    aiModel: 'gpt-4o-mini',
    features: {
      advancedAnalytics: true,
      competitorAlerts: true,
      exportReports: true,
      apiAccess: true,
      whatsappIntegration: true,
      prioritySupport: true,
    },
  },
];

// Cache for tier configurations
let cachedTierConfig: TierConfig[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch tier configurations from Airtable
 * Expected Airtable table: "Subscription Tiers" with columns:
 * - Tier Name (single line text): 'trial', 'basic', 'pro'
 * - Display Name (single line text): 'Free Trial', 'Basic', 'Professional'
 * - Monthly Price (number): 0, 9, 19
 * - Trial Duration Days (number): 30
 * - Max Jobs Per Month (number): 20, 50, or leave empty for unlimited
 * - Max Competitors (number): 3, 5, 10
 * - AI Credits Per Month (number): 3, 5, 10
 * - Insights Schedule (single select): 'daily', 'every_3_days', 'weekly', 'monthly'
 * - Insights Time (single line text): '09:00'
 * - AI Model (single line text): 'gpt-4o-mini', 'gpt-4o'
 * - Advanced Analytics (checkbox)
 * - Competitor Alerts (checkbox)
 * - Export Reports (checkbox)
 * - API Access (checkbox)
 * - WhatsApp Integration (checkbox)
 * - Priority Support (checkbox)
 */
export async function fetchTierConfigFromAirtable(): Promise<TierConfig[]> {
  if (!base) {
    console.log('Airtable not configured, using default tier settings');
    return DEFAULT_TIER_CONFIG;
  }

  // Return cached config if still fresh
  const now = Date.now();
  if (cachedTierConfig && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedTierConfig;
  }

  try {
    const records = await base('Subscription Tiers').select().all();
    
    const tiers: TierConfig[] = records.map(record => ({
      tierName: (record.get('Tier Name') as string)?.toLowerCase() || '',
      displayName: record.get('Display Name') as string,
      pricing: {
        gbp: (record.get('Monthly Price GBP') as number) || 0,
        eur: (record.get('Monthly Price EUR') as number) || 0,
        usd: (record.get('Monthly Price USD') as number) || 0,
      },
      trialDurationDays: record.get('Trial Duration Days') as number | undefined,
      maxJobsPerMonth: record.get('Max Jobs Per Month') 
        ? (record.get('Max Jobs Per Month') as number)
        : null, // null = unlimited
      maxCompetitors: (record.get('Max Competitors') as number) || 3,
      aiCreditsPerMonth: (record.get('AI Credits Per Month') as number) || 0,
      insightGenerationSchedule: (record.get('Insights Schedule') as any) || 'weekly',
      insightGenerationTime: (record.get('Insights Time') as string) || '09:00',
      aiModel: (record.get('AI Model') as string) || 'gpt-4o-mini',
      features: {
        advancedAnalytics: !!record.get('Advanced Analytics'),
        competitorAlerts: !!record.get('Competitor Alerts'),
        exportReports: !!record.get('Export Reports'),
        apiAccess: !!record.get('API Access'),
        whatsappIntegration: !!record.get('WhatsApp Integration'),
        prioritySupport: !!record.get('Priority Support'),
      },
    }));

    // Cache the results
    cachedTierConfig = tiers;
    lastFetchTime = now;

    console.log(`Fetched ${tiers.length} tier configurations from Airtable`);
    return tiers;
  } catch (error) {
    console.error('Error fetching tier config from Airtable:', error);
    console.log('Falling back to default tier configuration');
    return DEFAULT_TIER_CONFIG;
  }
}

/**
 * Get configuration for a specific tier
 */
export async function getTierConfig(tierName: string): Promise<TierConfig | null> {
  const allTiers = await fetchTierConfigFromAirtable();
  return allTiers.find(tier => tier.tierName === tierName) || null;
}

/**
 * Get all available tier configurations
 */
export async function getAllTierConfigs(): Promise<TierConfig[]> {
  return await fetchTierConfigFromAirtable();
}

/**
 * Clear the cache (useful for admin operations)
 */
export function clearTierConfigCache(): void {
  cachedTierConfig = null;
  lastFetchTime = 0;
}

/**
 * Update a tier configuration in Airtable
 */
export async function updateTierConfigInAirtable(
  tierName: string,
  updates: Partial<TierConfig>
): Promise<void> {
  if (!base) {
    throw new Error('Airtable not configured');
  }

  try {
    const records = await base('Subscription Tiers')
      .select({ filterByFormula: `{Tier Name} = '${tierName}'` })
      .all();

    if (records.length === 0) {
      throw new Error(`Tier '${tierName}' not found in Airtable`);
    }

    const record = records[0];
    const fields: any = {};

    if (updates.displayName) fields['Display Name'] = updates.displayName;
    if (updates.monthlyPriceGbp !== undefined) fields['Monthly Price'] = updates.monthlyPriceGbp;
    if (updates.trialDurationDays !== undefined) fields['Trial Duration Days'] = updates.trialDurationDays;
    if (updates.maxJobsPerMonth !== undefined) fields['Max Jobs Per Month'] = updates.maxJobsPerMonth;
    if (updates.maxCompetitors !== undefined) fields['Max Competitors'] = updates.maxCompetitors;
    if (updates.aiCreditsPerMonth !== undefined) fields['AI Credits Per Month'] = updates.aiCreditsPerMonth;
    if (updates.insightGenerationSchedule) fields['Insights Schedule'] = updates.insightGenerationSchedule;
    if (updates.insightGenerationTime) fields['Insights Time'] = updates.insightGenerationTime;
    if (updates.aiModel) fields['AI Model'] = updates.aiModel;
    
    if (updates.features) {
      fields['Advanced Analytics'] = updates.features.advancedAnalytics;
      fields['Competitor Alerts'] = updates.features.competitorAlerts;
      fields['Export Reports'] = updates.features.exportReports;
      fields['API Access'] = updates.features.apiAccess;
      fields['WhatsApp Integration'] = updates.features.whatsappIntegration;
      fields['Priority Support'] = updates.features.prioritySupport;
    }

    await base('Subscription Tiers').update([{ id: record.id, fields }]);
    
    // Clear cache to force refresh
    clearTierConfigCache();
    
    console.log(`Updated tier '${tierName}' in Airtable`);
  } catch (error) {
    console.error(`Error updating tier '${tierName}' in Airtable:`, error);
    throw error;
  }
}
