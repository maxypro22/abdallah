/**
 * Utility to map Supabase snake_case data to the frontend's expected camelCase/Legacy format.
 */

const mapCase = (c) => {
    if (!c) return null;
    return {
        _id: c.id,
        caseNumber: c.case_number,
        clientName: c.client_name,
        clientPhone: c.client_phone,
        type: c.type,
        court: c.court,
        status: c.status,
        memo: c.memo,
        law_firm_id: c.law_firm_id,
        created_by_id: c.created_by_id,
        created_by_name: c.created_by_name || (c.created_by ? c.created_by.name : null),
        assigned_lawyer_id: c.assigned_lawyer_id,
        assigned_lawyer_name: c.assigned_lawyer_name,
        createdAt: c.created_at,
        updatedAt: c.updated_at
    };
};

const mapHearing = (h) => {
    if (!h) return null;
    return {
        _id: h.id,
        caseId: h.case_id,
        date: h.date,
        time: h.time,
        court: h.court,
        result: h.result,
        nextHearingDate: h.next_hearing_date,
        showInAgenda: h.show_in_agenda,
        law_firm_id: h.law_firm_id,
        case: h.case ? {
            caseNumber: h.case.case_number,
            clientName: h.case.client_name
        } : null,
        createdAt: h.created_at
    };
};

const mapInvoice = (i) => {
    if (!i) return null;
    return {
        _id: i.id,
        caseId: i.case_id,
        description: i.description,
        amount: i.amount,
        status: i.status,
        dueDate: i.due_date,
        law_firm_id: i.law_firm_id,
        case: i.case ? {
            caseNumber: i.case.case_number,
            clientName: i.case.client_name
        } : null,
        createdAt: i.created_at
    };
};

const mapUser = (u) => {
    if (!u) return null;
    return {
        _id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        law_firm_id: u.law_firm_id,
        createdAt: u.created_at
    };
};

module.exports = {
    mapCase,
    mapHearing,
    mapInvoice,
    mapUser
};
