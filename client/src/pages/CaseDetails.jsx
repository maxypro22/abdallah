import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Save, ArrowRight, Gavel, FileText } from 'lucide-react';

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [newHearing, setNewHearing] = useState({ date: '', time: '', court: '', result: '' });

    useEffect(() => {
        fetchCaseDetails();
    }, [id]);

    const fetchCaseDetails = async () => {
        const { data } = await api.get(`/cases/${id}`);
        setData(data);
    };

    const handleAddHearing = async (e) => {
        e.preventDefault();
        await api.post('/cases/hearings', { ...newHearing, caseId: id });
        setNewHearing({ date: '', time: '', court: '', result: '' });
        fetchCaseDetails();
    };

    if (!data) return <div className="card">جاري التحميل...</div>;

    const statusLabels = {
        'new': 'جديدة',
        'adjourned': 'مؤجلة',
        'closed': 'منتهية'
    };

    return (
        <div>
            <div className="header-bar">
                <button onClick={() => navigate(-1)} className="button-primary" style={{ background: 'transparent', color: '#9CA3AF', padding: '0 1rem' }}>
                    <ArrowRight size={18} /> العودة
                </button>
                <h2 style={{ margin: 0 }}>تفاصيل القضية: {data.caseItem.caseNumber}</h2>
            </div>

            <div className="grid">
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Gavel size={20} color="#3B82F6" />
                        <h3 style={{ margin: 0 }}>معلومات القضية</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <p><strong>الموكل:</strong> {data.caseItem.clientName}</p>
                        <p><strong>هاتف الموكل:</strong> <span style={{ direction: 'ltr', display: 'inline-block' }}>{data.caseItem.clientPhone || '---'}</span></p>
                        <p><strong>النوع:</strong> {data.caseItem.type}</p>
                        <p><strong>المحكمة:</strong> {data.caseItem.court || '---'}</p>
                        <p>
                            <strong>الحالة:</strong>
                            <span className={`badge ${data.caseItem.status === 'adjourned' ? 'badge-warning' : data.caseItem.status === 'closed' ? 'badge-success' : 'badge-danger'}`} style={{ marginRight: '10px' }}>
                                {statusLabels[data.caseItem.status] || data.caseItem.status}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <Calendar size={20} color="#F59E0B" />
                        <h3 style={{ margin: 0 }}>إضافة جلسة جديدة</h3>
                    </div>
                    <form onSubmit={handleAddHearing}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input type="date" value={newHearing.date} onChange={e => setNewHearing({ ...newHearing, date: e.target.value })} className="input-field" required />
                            <input type="time" value={newHearing.time} onChange={e => setNewHearing({ ...newHearing, time: e.target.value })} className="input-field" required />
                        </div>
                        <input placeholder="قاعة المحكمة / الدائرة" value={newHearing.court} onChange={e => setNewHearing({ ...newHearing, court: e.target.value })} className="input-field" />
                        <button type="submit" className="button-primary" style={{ width: '100%' }}>حفظ الجلسة</button>
                    </form>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                    <FileText size={20} color="#10B981" />
                    <h3 style={{ margin: 0 }}>مذكرة القضية</h3>
                </div>
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '1.5rem',
                    borderRadius: '0.8rem',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    color: '#D1D5DB',
                    minHeight: '100px'
                }}>
                    {data.caseItem.memo || 'لا توجد مذكرات مسجلة لهذه القضية.'}
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h3>سجل الجلسات</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الوقت</th>
                                <th>المحكمة</th>
                                <th>النتيجة</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.hearings.map(h => (
                                <tr key={h._id}>
                                    <td>{new Date(h.date).toLocaleDateString('ar-EG')}</td>
                                    <td>{h.time}</td>
                                    <td>{h.court}</td>
                                    <td>{h.result || 'بانتظار النتيجة'}</td>
                                </tr>
                            ))}
                            {data.hearings.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', color: '#9CA3AF', padding: '1.5rem' }}>لا توجد جلسات مسجلة</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CaseDetails;
