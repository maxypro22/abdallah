const supabase = require('../config/supabase');

exports.getStats = async (req, res) => {
    try {
        const lawFirmId = req.user.law_firm_id;

        const [
            { count: lawyerCount },
            { count: caseCount },
            { data: paidInvoices },
            { data: pendingInvoices }
        ] = await Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('law_firm_id', lawFirmId).eq('role', 'Lawyer'),
            supabase.from('cases').select('*', { count: 'exact', head: true }).eq('law_firm_id', lawFirmId),
            ['Super Admin', 'Accountant'].includes(req.user.role)
                ? supabase.from('invoices').select('amount').eq('law_firm_id', lawFirmId).eq('status', 'paid')
                : Promise.resolve({ data: [] }),
            ['Super Admin', 'Accountant'].includes(req.user.role)
                ? supabase.from('invoices').select('amount').eq('law_firm_id', lawFirmId).eq('status', 'pending')
                : Promise.resolve({ data: [] })
        ]);

        const totalRevenue = (paidInvoices || []).reduce((acc, inv) => acc + Number(inv.amount), 0);
        const totalPending = (pendingInvoices || []).reduce((acc, inv) => acc + Number(inv.amount), 0);

        // Map response to match frontend expectations
        res.send({
            lawyerCount: lawyerCount || 0,
            caseCount: caseCount || 0,
            totalRevenue: ['Super Admin', 'Accountant'].includes(req.user.role) ? totalRevenue : 0,
            totalPending: ['Super Admin', 'Accountant'].includes(req.user.role) ? totalPending : 0,
            recentActivity: [] // Optional: map activity logs if implemented
        });
    } catch (error) {
        console.error('🔥 Dashboard Stats Error:', error);
        res.status(500).send({ error: 'فشل جلب الإحصائيات', details: error.message });
    }
};
