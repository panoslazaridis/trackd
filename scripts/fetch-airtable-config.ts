import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

async function fetchConfig() {
  console.log('📋 Fetching your Airtable configuration...\n');
  
  try {
    const records = await base('subscription tiers').select().all();
    
    console.log(`✅ Found ${records.length} tier(s)\n`);
    
    records.forEach((record, i) => {
      console.log(`\n📊 Tier ${i + 1}:`);
      const fields = record.fields;
      Object.entries(fields).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    });
    
    console.log('\n\n🔧 I will now update the code to match this structure.');
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchConfig();
