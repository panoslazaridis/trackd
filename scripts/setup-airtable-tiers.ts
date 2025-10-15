import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('Missing Airtable credentials');
  process.exit(1);
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function setupTiers() {
  console.log('Creating Subscription Tiers table...');
  
  // Airtable doesn't support creating tables via API, so we'll create records
  // The user needs to create the table first with the right structure
  
  const tierRecords = [
    {
      fields: {
        'Tier Name': 'trial',
        'Display Name': 'Free Trial',
        'Monthly Price': 0,
        'Trial Duration Days': 30,
        'Max Jobs Per Month': 20,
        'Max Competitors': 3,
        'AI Credits Per Month': 3,
        'Insights Schedule': 'daily',
        'Insights Time': '09:00',
        'AI Model': 'gpt-4o-mini',
        'Advanced Analytics': false,
        'Competitor Alerts': false,
        'Export Reports': false,
        'API Access': false,
        'WhatsApp Integration': false,
        'Priority Support': false,
      }
    },
    {
      fields: {
        'Tier Name': 'basic',
        'Display Name': 'Basic',
        'Monthly Price': 9,
        'Max Jobs Per Month': 50,
        'Max Competitors': 5,
        'AI Credits Per Month': 5,
        'Insights Schedule': 'every_3_days',
        'Insights Time': '09:00',
        'AI Model': 'gpt-4o-mini',
        'Advanced Analytics': true,
        'Competitor Alerts': false,
        'Export Reports': true,
        'API Access': false,
        'WhatsApp Integration': false,
        'Priority Support': false,
      }
    },
    {
      fields: {
        'Tier Name': 'pro',
        'Display Name': 'Professional',
        'Monthly Price': 19,
        // Max Jobs Per Month is unlimited (leave empty/null)
        'Max Competitors': 10,
        'AI Credits Per Month': 10,
        'Insights Schedule': 'daily',
        'Insights Time': '09:00',
        'AI Model': 'gpt-4o-mini',
        'Advanced Analytics': true,
        'Competitor Alerts': true,
        'Export Reports': true,
        'API Access': true,
        'WhatsApp Integration': true,
        'Priority Support': true,
      }
    }
  ];

  try {
    // Try to create records in the Subscription Tiers table
    console.log('Adding tier configurations...');
    const records = await base('Subscription Tiers').create(tierRecords);
    console.log(`✅ Successfully created ${records.length} tier configurations!`);
    
    // Verify by fetching them back
    console.log('\nVerifying tier configurations:');
    const allRecords = await base('Subscription Tiers').select().all();
    allRecords.forEach(record => {
      const tierName = record.get('Tier Name');
      const displayName = record.get('Display Name');
      const price = record.get('Monthly Price');
      console.log(`  - ${displayName} (${tierName}): £${price}/month`);
    });
    
    console.log('\n✅ Airtable table setup complete!');
  } catch (error: any) {
    if (error.statusCode === 404) {
      console.error('\n❌ Error: Table "Subscription Tiers" does not exist in your Airtable base.');
      console.error('\nPlease create the table manually with these fields:');
      console.error('  - Tier Name (Single line text)');
      console.error('  - Display Name (Single line text)');
      console.error('  - Monthly Price (Number)');
      console.error('  - Trial Duration Days (Number)');
      console.error('  - Max Jobs Per Month (Number)');
      console.error('  - Max Competitors (Number)');
      console.error('  - AI Credits Per Month (Number)');
      console.error('  - Insights Schedule (Single select: daily, every_3_days, weekly, monthly)');
      console.error('  - Insights Time (Single line text)');
      console.error('  - AI Model (Single line text)');
      console.error('  - Advanced Analytics (Checkbox)');
      console.error('  - Competitor Alerts (Checkbox)');
      console.error('  - Export Reports (Checkbox)');
      console.error('  - API Access (Checkbox)');
      console.error('  - WhatsApp Integration (Checkbox)');
      console.error('  - Priority Support (Checkbox)');
      console.error('\nThen run this script again.');
    } else {
      console.error('Error setting up tiers:', error.message);
    }
    process.exit(1);
  }
}

setupTiers();
