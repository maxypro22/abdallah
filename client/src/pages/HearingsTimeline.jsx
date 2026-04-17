import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, MapPin, Clock, Edit2, Trash2, X, Save } from 'lucide-react';

const HearingsTimeline = () => {
    const [hearings, setHearings] = useState([]);
    const [editingHearing, setEditingHearing] = useState(null);
    const [formData, setFormData] = useState({ date: '', time: '', court: '', result: '' });
    const [showEditForm, setShowEditForm] = useState(false);

    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchHearings();
    }, [dateRange]);

    const fetchHearings = async () => {
        try {
            const { start, end } = dateRange;
            let url = '/cases/hearings/all';
            const params = new URLSearchParams();
            if (start) params.append('startDate', start);
            if (end) params.append('endDate', end);
            if (params.toString()) url += `?${params.toString()}`;

            const { data } = await api.get(url);
            setHearings(data);
        } catch (error) {
            console.error('Failed to fetch hearings:', error);
        }
    };

    const handleOpenEdit = (h) => {
        setEditingHearing(h._id);
        setFormData({
            date: h.date ? h.date.split('T')[0] : '',
            time: h.time || '',
            court: h.court || '',
            result: h.result || ''
        });
        setShowEditForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/cases/hearings/${editingHearing}`, formData);
            setShowEditForm(false);
            fetchHearings();
            alert('تم تحديث بيانات الجلسة بنجاح');
        } catch (error) {
            alert('فشل تحديث بيانات الجلسة');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في إزالة هذه الجلسة من الأجندة؟ (ستبقى موجودة في سجل القضية)')) {
            try {
                await api.delete(`/cases/hearings/${id}`);
                fetchHearings();
            } catch (error) {
                alert('فشل إزالة الجلسة');
            }
        }
    };

    return (
        <div>
            <div className="header-bar">
                <div>
                    <h1 style={{ margin: 0 }}>أجندة الجلسات القادمة</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>متابعة مواعيد المحاكم القادمة</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>من:</span>
                        <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="input-field" style={{ marginBottom: 0, padding: '5px 10px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>إلى:</span>
                        <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="input-field" style={{ marginBottom: 0, padding: '5px 10px' }} />
                    </div>
                    {(dateRange.start || dateRange.end) && (
                        <button onClick={() => setDateRange({ start: '', end: '' })} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.85rem' }}>مسح الفلتر</button>
                    )}
                </div>
            </div>

            {showEditForm && (
                <div className="card" style={{ marginBottom: '2.5rem', border: '1px solid var(--gold)', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>تعديل بيانات الجلسة</h3>
                        <button onClick={() => setShowEditForm(false)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 600 }}>تاريخ الجلسة</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 600 }}>وقت الجلسة</label>
                            <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="input-field" required />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 600 }}>المحكمة / القاعة</label>
                            <input placeholder="مثلاً: المحكمة العامة الرياض - الدائرة الثالثة" value={formData.court} onChange={e => setFormData({ ...formData, court: e.target.value })} className="input-field" required />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 600 }}>ملاحظات / نتائج الجلسة</label>
                            <textarea
                                placeholder="اكتب ما تم في الجلسة أو الملاحظات الهامة..."
                                value={formData.result}
                                onChange={e => setFormData({ ...formData, result: e.target.value })}
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                            />
                        </div>

                        <button type="submit" className="button-primary" style={{ gridColumn: 'span 2' }}>
                            <Save size={18} /> حفظ التعديلات
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {hearings.map(h => (
                    <div key={h._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, minWidth: '300px' }}>
                            <div style={{ textAlign: 'center', background: 'rgba(197, 160, 33, 0.1)', padding: '1.25rem', borderRadius: '1rem', minWidth: '90px', border: '1px solid rgba(197, 160, 33, 0.2)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gold)' }}>{new Date(h.date).getDate()}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{new Date(h.date).toLocaleString('ar-EG', { month: 'short' })}</div>
                            </div>

                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>قضية رقم: {h.caseId?.caseNumber || '---'}</h4>
                                <p style={{ margin: '8px 0', color: 'var(--text-muted)', fontWeight: 500 }}>{h.caseId?.clientName}</p>
                                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--accent)', fontWeight: 600 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> {h.time}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {h.court}</span>
                                </div>
                                {h.result && (
                                    <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', borderRight: '2px solid var(--border)', paddingRight: '10px' }}>
                                        {h.result}
                                    </p>
                                )}
                                <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: 'var(--accent)', opacity: 0.8 }}>
                                    تسجيل: {h.createdBy_name || h.createdBy?.name || '---'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button onClick={() => handleOpenEdit(h)} style={{ background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer', padding: '5px' }} title="تعديل الجلسة">
                                    <Edit2 size={20} />
                                </button>
                                <button onClick={() => handleDelete(h._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '5px' }} title="إزالة من الأجندة">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <span className={`badge ${h.result ? 'badge-success' : 'badge-warning'}`}>
                                {h.result ? 'تمت الجلسة' : 'قيد الانتظار'}
                            </span>
                        </div>
                    </div>
                ))}
                {hearings.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <Calendar size={60} style={{ marginBottom: '1.5rem', opacity: 0.15 }} />
                        <p style={{ fontSize: '1.2rem' }}>لا توجد جلسات مجدولة حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HearingsTimeline;
