const supabase = require('./config/supabase');
require('dotenv').config();

const upgradeUserToSuperAdmin = async (email) => {
    try {
        console.log(`📡 Upgrading user ${email} in Supabase...`);

        const { data, error } = await supabase
            .from('profiles')
            .update({ role: 'Super Admin' })
            .eq('email', email)
            .select()
            .single();

        if (error) {
            console.error(`❌ Error or user not found:`, error.message);
        } else {
            console.log(`🚀 User ${email} upgraded to Super Admin successfully!`);
        }
    } catch (error) {
        console.error('🔥 Unexpected Error:', error.message);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Please provide a user email: node upgrade_user.js email@example.com');
} else {
    upgradeUserToSuperAdmin(email);
}
