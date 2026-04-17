const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { mapUser } = require('../utils/mapper');

exports.register = async (req, res) => {
    try {
        const { firmName, ownerName, email, password } = req.body;
        console.log(`📝 Registration attempt for: ${email} (${firmName})`);

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log('❌ Registration failed: Email already exists');
            return res.status(400).send({ error: 'البريد الإلكتروني مسجل مسبقاً' });
        }

        // Create Firm
        const { data: firm, error: firmError } = await supabase
            .from('law_firms')
            .insert({ name: firmName, owner_email: email })
            .select()
            .single();

        if (firmError) throw firmError;

        // Create Admin User
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .insert({
                name: ownerName,
                email,
                password, // Note: Should be hashed in production
                role: 'Super Admin',
                law_firm_id: firm.id
            })
            .select()
            .single();

        if (userError) throw userError;

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        console.log('✅ Registration successful');
        res.status(201).send({ user: mapUser(user), token });
    } catch (error) {
        console.error('🔥 Registration Error:', error);
        res.status(400).send({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`🔑 Login attempt for: ${email}`);

        if (!email || !password) {
            return res.status(400).send({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
        }

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.log('❌ User not found');
            return res.status(401).send({ error: 'بيانات الدخول غير صحيحة' });
        }

        if (user.password !== password) {
            console.log('❌ Password mismatch');
            return res.status(401).send({ error: 'بيانات الدخول غير صحيحة' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        console.log('✅ Login successful');
        res.send({ user: mapUser(user), token });
    } catch (error) {
        console.error('🔥 Login Error:', error);
        res.status(500).send({ error: error.message || 'حدث خطأ أثناء تسجيل الدخول' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        let { oldPassword, newPassword } = req.body;
        oldPassword = (oldPassword || '').trim();
        newPassword = (newPassword || '').trim();

        console.log(`🔐 Change password request for User ID: ${req.user.id}`);

        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).send({ error: 'المستخدم غير موجود' });
        }

        if (user.password.trim() !== oldPassword) {
            return res.status(400).send({ error: 'كلمة المرور القديمة غير صحيحة' });
        }

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ password: newPassword })
            .eq('id', req.user.id);

        if (updateError) throw updateError;

        console.log(`🔐 Password changed successfully for user: ${user.email}`);
        res.send({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        console.error('🔥 Change Password Error:', error);
        res.status(500).send({ error: error.message });
    }
};
