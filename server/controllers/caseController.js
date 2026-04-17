const supabase = require('../config/supabase');

exports.createCase = async (req, res) => {
    try {
        console.log('📝 Creating new case:', req.body);

        if (!req.user || !req.user.law_firm_id) {
            return res.status(400).send({ error: 'بيانات المكتب غير متوفرة' });
        }

        const { data, error } = await supabase
            .from('cases')
            .insert({
                case_number: req.body.caseNumber,
                client_name: req.body.clientName,
                client_phone: req.body.clientPhone,
                type: req.body.type,
                court: req.body.court,
                status: req.body.status || 'new',
                memo: req.body.memo,
                law_firm_id: req.user.law_firm_id,
                created_by_id: req.user.id,
                created_by_name: req.user.name
            })
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Case created successfully');
        res.status(201).send(data);
    } catch (error) {
        console.error('🔥 Create Case Error:', error);
        res.status(400).send({ error: 'فشل حفظ القضية', details: error.message });
    }
};

exports.getCases = async (req, res) => {
    try {
        if (!req.user || !req.user.law_firm_id) {
            return res.status(401).send({ error: 'جلسة العمل انتهت، يرجى تسجيل الدخول مجدداً' });
        }

        let query = supabase
            .from('cases')
            .select('*, created_by:profiles(name)')
            .eq('law_firm_id', req.user.law_firm_id)
            .order('created_at', { ascending: false });

        if (req.query.status && req.query.status !== 'all') {
            query = query.eq('status', req.query.status);
        }

        if (req.user.role === 'Lawyer') {
            query = query.eq('created_by_id', req.user.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.send(data);
    } catch (error) {
        console.error('🔥 Get Cases Error:', error);
        res.status(500).send({ error: 'فشل استرجاع القضايا', details: error.message });
    }
};

exports.getCase = async (req, res) => {
    try {
        let query = supabase
            .from('cases')
            .select('*, created_by:profiles(name)')
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id);

        if (req.user.role === 'Lawyer') {
            query = query.eq('created_by_id', req.user.id);
        }

        const { data: caseItem, error } = await query.single();
        if (error) throw error;

        const { data: hearings, error: hError } = await supabase
            .from('hearings')
            .select('*')
            .eq('case_id', req.params.id);
        
        if (hError) throw hError;

        res.send({ caseItem, hearings });
    } catch (error) {
        console.error('🔥 Get Case Error:', error);
        res.status(404).send({ error: 'حدث خطأ أثناء جلب القضية', details: error.message });
    }
};

exports.updateCase = async (req, res) => {
    try {
        const updateData = {
            case_number: req.body.caseNumber,
            client_name: req.body.clientName,
            client_phone: req.body.clientPhone,
            type: req.body.type,
            court: req.body.court,
            status: req.body.status,
            memo: req.body.memo
        };

        // If assigned lawyer is being updated
        if (req.body.assignedLawyer) {
            const { data: lawyer } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', req.body.assignedLawyer)
                .single();
            if (lawyer) {
                updateData.assigned_lawyer_id = req.body.assignedLawyer;
                updateData.assigned_lawyer_name = lawyer.name;
            }
        }

        let query = supabase
            .from('cases')
            .update(updateData)
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id);

        if (req.user.role === 'Lawyer') {
            query = query.eq('created_by_id', req.user.id);
        }

        const { data, error } = await query.select().single();
        if (error) throw error;

        res.send(data);
    } catch (error) {
        console.error('🔥 Update Case Error:', error);
        res.status(400).send({ error: 'فشل تحديث بيانات القضية', details: error.message });
    }
};

exports.deleteCase = async (req, res) => {
    try {
        let query = supabase
            .from('cases')
            .delete()
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id);

        if (req.user.role === 'Lawyer') {
            query = query.eq('created_by_id', req.user.id);
        }

        const { error } = await query;
        if (error) throw error;

        res.send({ message: 'تم حذف القضية بنجاح' });
    } catch (error) {
        console.error('🔥 Delete Case Error:', error);
        res.status(500).send({ error: 'فشل حذف القضية', details: error.message });
    }
};

exports.addHearing = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('hearings')
            .insert({
                case_id: req.body.caseId,
                date: req.body.date,
                time: req.body.time,
                court: req.body.court,
                result: req.body.result,
                next_hearing_date: req.body.nextHearingDate,
                show_in_agenda: true,
                law_firm_id: req.user.law_firm_id,
                created_by_id: req.user.id,
                created_by_name: req.user.name
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).send(data);
    } catch (error) {
        console.error('🔥 Add Hearing Error:', error);
        res.status(400).send({ error: 'فشل إضافة الجلسة', details: error.message });
    }
};

exports.getHearings = async (req, res) => {
    try {
        let query = supabase
            .from('hearings')
            .select('*, case:cases(case_number, client_name)')
            .eq('law_firm_id', req.user.law_firm_id)
            .eq('show_in_agenda', true);

        if (req.query.startDate) query = query.gte('date', req.query.startDate);
        if (req.query.endDate) query = query.lte('date', req.query.endDate);

        if (req.user.role === 'Lawyer') {
            query = query.eq('created_by_id', req.user.id);
        }

        const { data, error } = await query.order('date', { ascending: true });
        if (error) throw error;

        res.send(data);
    } catch (error) {
        res.status(500).send({ error: 'فشل جلب الجلسات', details: error.message });
    }
};

exports.updateHearing = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('hearings')
            .update(req.body)
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id)
            .select()
            .single();
        if (error) throw error;
        res.send(data);
    } catch (error) {
        res.status(400).send({ error: 'فشل تحديث الجلسة', details: error.message });
    }
};

exports.deleteHearing = async (req, res) => {
    try {
        const { error } = await supabase
            .from('hearings')
            .update({ show_in_agenda: false })
            .eq('id', req.params.id)
            .eq('law_firm_id', req.user.law_firm_id);
        if (error) throw error;
        res.send({ message: 'تمت إزالة الجلسة من الأجندة بنجاح' });
    } catch (error) {
        res.status(500).send({ error: 'فشل إزالة الجلسة', details: error.message });
    }
};
