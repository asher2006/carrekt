const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Read the Indian cars JSON data
    const carsDataPath = path.join(__dirname, 'indian-cars.json');
    const carsData = JSON.parse(fs.readFileSync(carsDataPath, 'utf8'));

    // Check if cars table exists by running a simple query
    const { error: checkError } = await supabase.from('cars').select('id').limit(1);
    
    if (checkError) {
      console.error('❌ Error accessing cars table. Did you run the SQL migration first?', checkError.message);
      process.exit(1);
    }

    console.log(`Found ${carsData.length} cars to seed...`);

    // Insert cars (upsert based on slug)
    const { data, error } = await supabase
      .from('cars')
      .upsert(carsData, { onConflict: 'slug' })
      .select();

    if (error) throw error;

    console.log(`✅ Successfully seeded ${data.length} cars into the database!`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
