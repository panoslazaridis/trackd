import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('Missing Airtable credentials');
  process.exit(1);
}

const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

async function checkBase() {
  console.log('🔍 Checking Airtable base...');
  console.log(`Base ID: ${process.env.AIRTABLE_BASE_ID}\n`);
  
  // Try to list what tables might exist by attempting common names
  const tablesToTry = [
    'Subscription Tiers',
    'subscription_tiers',
    'SubscriptionTiers',
    'Tiers',
    'Table 1',
    'Table 2'
  ];
  
  console.log('Attempting to find existing tables...\n');
  
  for (const tableName of tablesToTry) {
    try {
      const records = await base(tableName).select({ maxRecords: 1 }).firstPage();
      console.log(`✅ Found table: "${tableName}" with ${records.length} records`);
      
      if (records.length > 0) {
        console.log('   Sample fields:', Object.keys(records[0].fields));
      }
    } catch (error: any) {
      // Table doesn't exist or can't be accessed
      if (error.statusCode !== 404) {
        console.log(`❌ "${tableName}": ${error.message}`);
      }
    }
  }
  
  console.log('\n📝 If no tables were found, you need to:');
  console.log('1. Open https://airtable.com/appS9wtrtaRrWcAIr');
  console.log('2. Create a table called "Subscription Tiers"');
  console.log('3. Add the required columns (I can provide the exact structure)');
  console.log('\nOr if you want, I can create CSV data for you to import directly!');
}

checkBase().catch(console.error);
