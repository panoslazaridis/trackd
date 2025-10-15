import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

async function debug() {
  console.log('🔍 Debugging Airtable table structure...\n');
  
  try {
    const records = await base('subscription tiers').select().all();
    
    console.log(`Found ${records.length} records\n`);
    
    records.forEach((record, i) => {
      console.log(`Record ${i + 1}:`);
      console.log('  ID:', record.id);
      console.log('  Fields:', JSON.stringify(record.fields, null, 2));
      console.log('');
    });
    
    if (records.length > 0) {
      console.log('📋 Available field names in Airtable:');
      console.log(Object.keys(records[0].fields));
      
      console.log('\n🔧 Expected field names by our code:');
      console.log([
        'Tier Name',
        'Display Name', 
        'Monthly Price',
        'Trial Duration Days',
        'Max Jobs Per Month',
        'Max Competitors',
        'AI Credits Per Month',
        'Insights Schedule',
        'Insights Time',
        'AI Model',
        'Advanced Analytics',
        'Competitor Alerts',
        'Export Reports',
        'API Access',
        'WhatsApp Integration',
        'Priority Support'
      ]);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

debug();
