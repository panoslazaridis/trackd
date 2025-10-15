import { fetchTierConfigFromAirtable } from '../server/airtable';

async function verify() {
  console.log('🔍 Fetching tier configurations from Airtable...\n');
  
  try {
    const tiers = await fetchTierConfigFromAirtable();
    
    console.log(`✅ Successfully fetched ${tiers.length} tiers!\n`);
    
    tiers.forEach(tier => {
      console.log(`📊 ${tier.displayName} (${tier.tierName})`);
      console.log(`   Price: £${tier.monthlyPriceGbp}/month`);
      console.log(`   Jobs: ${tier.maxJobsPerMonth || 'Unlimited'}`);
      console.log(`   Competitors: ${tier.maxCompetitors}`);
      console.log(`   AI Credits: ${tier.aiCreditsPerMonth}`);
      console.log(`   Insights: ${tier.insightGenerationSchedule} at ${tier.insightGenerationTime}`);
      console.log(`   Features:`, {
        analytics: tier.features.advancedAnalytics,
        alerts: tier.features.competitorAlerts,
        export: tier.features.exportReports,
        api: tier.features.apiAccess,
        whatsapp: tier.features.whatsappIntegration,
        support: tier.features.prioritySupport
      });
      console.log('');
    });
    
    console.log('🎉 Airtable integration is working perfectly!');
    console.log('💡 You can now update tier limits in Airtable and they\'ll sync automatically (5-min cache).');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

verify();
