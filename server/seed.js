const supabase = require('./config/supabase');
require('dotenv').config();

async function seed() {
    console.log('📡 Seeding Supabase database...');

    // 1. Create Firm
    const { data: firm, error: firmError } = await supabase
        .from('law_firms')
        .insert({
            name: 'المرقاب للمحاماة',
            owner_email: 'admin@almurqab.com',
            subscription_status: 'active'
        })
        .select()
        .single();

    if (firmError) {
        console.error('❌ Error creating firm:', firmError.message);
        process.exit(1);
    }

    // 2. Create Admin User
    const { data: user, error: userError } = await supabase
        .from('profiles')
        .insert({
            name: 'المدير العام',
            email: 'admin@almurqab.com',
            password: 'admin123',
            role: 'Super Admin',
            law_firm_id: firm.id
        })
        .select()
        .single();

    if (userError) {
        console.error('❌ Error creating user:', userError.message);
        process.exit(1);
    }

    console.log('✅ Seed successful! User: admin@almurqab.com / admin123');
    process.exit(0);
}

seed().catch(err => {
    console.error('🔥 Unexpected Error:', err);
    process.exit(1);
});
