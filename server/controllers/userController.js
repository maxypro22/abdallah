const supabase = require('../config/supabase');

exports.getUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('law_firm_id', req.user.law_firm_id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: 'فشل جلب قائمة المستخدمين', details: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        console.log('👤 Creating new user:', req.body.email);
        
        const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', req.body.email)
            .single();

        if (existing) return res.status(400).send({ error: 'البريد الإلكتروني مستخدم بالفعل' });

        const { data: user, error } = await supabase
            .from('profiles')
            .insert({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role,
                law_firm_id: req.user.law_firm_id
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send({ error: 'فشل إنشاء المستخدم', details: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        console.log(`📝 Updating User: ${req.params.id}`);
        
        const { data: user, error } = await supabase
            .from('profiles')
            .update({
                name: req.body.name,
                role: req.body.role,
                email: req.body.email
            })
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id)
            .select()
            .single();

        if (error || !user) return res.status(404).send({ error: 'المستخدم غير موجود' });
        res.send(user);
    } catch (error) {
        res.status(400).send({ error: 'فشل تحديث بيانات المستخدم', details: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        console.log(`🗑️ Deleting User: ${req.params.id}`);
        if (req.params.id === req.user.id) {
            return res.status(400).send({ error: 'لا يمكنك حذف حسابك الحالي' });
        }

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id);

        if (error) throw error;
        res.send({ message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        res.status(500).send({ error: 'فشل حذف المستخدم', details: error.message });
    }
};
