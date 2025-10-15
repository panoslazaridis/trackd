import Airtable from 'airtable';

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('Missing Airtable credentials');
  process.exit(1);
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function testConnection() {
  console.log('Testing Airtable connection...');
  console.log(`Base ID: ${process.env.AIRTABLE_BASE_ID}`);
  
  try {
    // Try to read from the table
    console.log('\nAttempting to read "Subscription Tiers" table...');
    const records = await base('Subscription Tiers').select({ maxRecords: 3 }).all();
    
    if (records.length === 0) {
      console.log('✅ Table exists but is empty. We can add records.');
      console.log('\nAttempting to create a test record...');
      
      const testRecord = await base('Subscription Tiers').create([{
        fields: {
          'Tier Name': 'test',
          'Display Name': 'Test',
          'Monthly Price': 0,
        }
      }]);
      
      console.log('✅ Successfully created test record!');
      
      // Clean up test record
      await base('Subscription Tiers').destroy([testRecord[0].id]);
      console.log('✅ Cleaned up test record');
      
    } else {
      console.log(`✅ Found ${records.length} existing records:`);
      records.forEach(record => {
        const tierName = record.get('Tier Name');
        const displayName = record.get('Display Name');
        console.log(`  - ${tierName}: ${displayName}`);
      });
    }
    
  } catch (error: any) {
    if (error.statusCode === 404) {
      console.error('❌ Table "Subscription Tiers" does not exist');
      console.error('\n📝 CREATE THE TABLE MANUALLY:');
      console.error('1. Go to https://airtable.com');
      console.error(`2. Open your base (ID: ${process.env.AIRTABLE_BASE_ID})`);
      console.error('3. Create a new table called "Subscription Tiers"');
      console.error('4. Add these fields (exact names):');
      console.error('   • Tier Name (Single line text)');
      console.error('   • Display Name (Single line text)');
      console.error('   • Monthly Price (Number)');
      console.error('   • Trial Duration Days (Number)');
      console.error('   • Max Jobs Per Month (Number)');
      console.error('   • Max Competitors (Number)');
      console.error('   • AI Credits Per Month (Number)');
      console.error('   • Insights Schedule (Single select with options: daily, every_3_days, weekly, monthly)');
      console.error('   • Insights Time (Single line text)');
      console.error('   • AI Model (Single line text)');
      console.error('   • Advanced Analytics (Checkbox)');
      console.error('   • Competitor Alerts (Checkbox)');
      console.error('   • Export Reports (Checkbox)');
      console.error('   • API Access (Checkbox)');
      console.error('   • WhatsApp Integration (Checkbox)');
      console.error('   • Priority Support (Checkbox)');
    } else if (error.statusCode === 401 || error.statusCode === 403) {
      console.error('❌ Authorization error');
      console.error('\n🔑 UPDATE YOUR API KEY PERMISSIONS:');
      console.error('1. Go to https://airtable.com/create/tokens');
      console.error('2. Edit your existing token (or create a new one)');
      console.error('3. Make sure these permissions are enabled:');
      console.error('   ✅ data.records:read');
      console.error('   ✅ data.records:write');
      console.error('   ✅ schema.bases:read');
      console.error('4. Make sure the token has access to your base');
      console.error('5. Copy the new token and update your AIRTABLE_API_KEY secret');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testConnection();
