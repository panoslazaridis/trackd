import { getTierConfig, getAllTierConfigs, type TierConfig } from './airtable';
import type { Express } from 'express';

/**
 * Check if user has exceeded their tier limits
 */
export async function checkTierLimits(
  userId: string,
  tierName: string,
  limitType: 'jobs' | 'ai' | 'competitors'
): Promise<{ allowed: boolean; limit: number | null; current: number; message?: string }> {
  const tierConfig = await getTierConfig(tierName);
  
  if (!tierConfig) {
    return { allowed: false, limit: 0, current: 0, message: 'Invalid tier' };
  }

  // TODO: Fetch actual usage from database
  // For now, return default values
  switch (limitType) {
    case 'jobs':
      return {
        allowed: true,
        limit: tierConfig.maxJobsPerMonth,
        current: 0,
        message: tierConfig.maxJobsPerMonth 
          ? `You can create up to ${tierConfig.maxJobsPerMonth} jobs per month`
          : 'Unlimited jobs',
      };
    case 'ai':
      return {
        allowed: true,
        limit: tierConfig.aiCreditsPerMonth,
        current: 0,
        message: `You have ${tierConfig.aiCreditsPerMonth} AI credits per month`,
      };
    case 'competitors':
      return {
        allowed: true,
        limit: tierConfig.maxCompetitors,
        current: 0,
        message: `You can track up to ${tierConfig.maxCompetitors} competitors`,
      };
    default:
      return { allowed: false, limit: 0, current: 0, message: 'Unknown limit type' };
  }
}

/**
 * Register config API routes
 */
export async function registerConfigRoutes(app: Express) {
  // Get all tier configurations
  app.get('/api/config/tiers', async (req, res) => {
    try {
      const tiers = await getAllTierConfigs();
      res.json({ tiers });
    } catch (error: any) {
      console.error('Error fetching tier configs:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific tier configuration
  app.get('/api/config/tiers/:tierName', async (req, res) => {
    try {
      const { tierName } = req.params;
      const tierConfig = await getTierConfig(tierName);
      
      if (!tierConfig) {
        return res.status(404).json({ error: 'Tier not found' });
      }
      
      res.json({ tier: tierConfig });
    } catch (error: any) {
      console.error('Error fetching tier config:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check user's tier limits
  app.post('/api/config/check-limit', async (req, res) => {
    try {
      const { userId, tierName, limitType } = req.body;
      
      if (!userId || !tierName || !limitType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const result = await checkTierLimits(userId, tierName, limitType);
      res.json(result);
    } catch (error: any) {
      console.error('Error checking tier limits:', error);
      res.status(500).json({ error: error.message });
    }
  });
}
