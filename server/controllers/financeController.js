const supabase = require('../config/supabase');

exports.getInvoices = async (req, res) => {
    try {
        let query = supabase
            .from('invoices')
            .select('*, case:cases(case_number, client_name)')
            .eq('law_firm_id', req.user.law_firm_id)
            .order('created_at', { ascending: false });

        if (req.query.status && req.query.status !== 'all') {
            query = query.eq('status', req.query.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(500).send({ error: 'فشل جلب الفواتير', details: error.message });
    }
};

exports.createInvoice = async (req, res) => {
    try {
        console.log('💰 Creating invoice:', req.body);
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                case_id: req.body.caseId,
                description: req.body.description,
                amount: req.body.amount,
                status: req.body.status || 'pending',
                due_date: req.body.dueDate,
                law_firm_id: req.user.law_firm_id
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).send(data);
    } catch (error) {
        res.status(400).send({ error: 'فشل إنشاء الفاتورة', details: error.message });
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .update({
                description: req.body.description,
                amount: req.body.amount,
                status: req.body.status,
                due_date: req.body.dueDate
            })
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id)
            .select()
            .single();

        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(400).send({ error: 'فشل تحديث الفاتورة', details: error.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id);

        if (error) throw error;
        res.send({ message: 'تم حذف الفاتورة بنجاح' });
    } catch (error) {
        res.status(500).send({ error: 'فشل حذف الفاتورة', details: error.message });
    }
};
