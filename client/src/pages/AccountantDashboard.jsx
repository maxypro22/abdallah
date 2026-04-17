import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DollarSign, FileText, Plus, Check, Edit2, Trash2, X, Save, Search } from 'lucide-react';

const AccountantDashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [cases, setCases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingInvoiceId, setEditingInvoiceId] = useState(null);
    const [formData, setFormData] = useState({ caseId: '', amount: '', description: '', dueDate: '', status: 'pending' });

    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        try {
            const [invRes, caseRes] = await Promise.all([
                api.get(`/finance/invoices${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`),
                api.get('/cases')
            ]);
            setInvoices(invRes.data);
            setCases(caseRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleOpenCreate = () => {
        setEditingInvoiceId(null);
        setFormData({ caseId: '', amount: '', description: '', dueDate: '', status: 'pending' });
        setShowForm(true);
    };

    const handleOpenEdit = (inv) => {
        setEditingInvoiceId(inv._id);
        setFormData({
            caseId: inv.caseId?._id || '',
            amount: inv.amount,
            description: inv.description,
            dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
            status: inv.status
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingInvoiceId) {
                await api.put(`/finance/invoices/${editingInvoiceId}`, formData);
                alert('تم تحديث الفاتورة بنجاح');
            } else {
                await api.post('/finance/invoices', formData);
                alert('تم إصدار الفاتورة بنجاح');
            }
            setShowForm(false);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('فشل حفظ البيانات. تأكد من إكمال جميع البيانات.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
            try {
                await api.delete(`/finance/invoices/${id}`);
                fetchData();
            } catch (error) {
                alert('فشل حذف الفاتورة');
            }
        }
    };

    const markAsPaid = async (id) => {
        try {
            await api.put(`/finance/invoices/${id}`, { status: 'paid' });
            fetchData();
        } catch (error) {
            alert('فشل التحديث');
        }
    };

    return (
        <div>
            <div className="header-bar">
                <div>
                    <h1 style={{ margin: 0 }}>الإدارة المالية</h1>
                    <p style={{ color: '#9CA3AF', margin: '5px 0 0 0' }}>متابعة الفواتير والتحصيلات</p>
                </div>
                <button onClick={handleOpenCreate} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    <span>إصدار فاتورة جديدة</span>
                </button>
            </div>

            <div className="grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ borderRight: '4px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className="stat-label">المبالغ المحصلة</span>
                        <DollarSign size={20} color="#10B981" />
                    </div>
                    <div className="stat-value">{invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0).toLocaleString()} ر.ق</div>
                </div>
                <div className="stat-card" style={{ borderRight: '4px solid #F59E0B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span className="stat-label">مبالغ قيد الانتظار</span>
                        <FileText size={20} color="#F59E0B" />
                    </div>
                    <div className="stat-value" style={{ color: '#F59E0B' }}>{invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0).toLocaleString()} ر.ق</div>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', border: `1px solid ${editingInvoiceId ? '#F59E0B' : '#3B82F6'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>{editingInvoiceId ? 'تعديل الفاتورة' : 'تفاصيل الفاتورة الجديدة'}</h3>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#9CA3AF' }}>القضية المرتبطة</label>
                            <select value={formData.caseId} onChange={e => setFormData({ ...formData, caseId: e.target.value })} className="input-field" required>
                                <option value="">اختر القضية</option>
                                {cases.map(c => <option key={c._id} value={c._id}>{c.caseNumber} - {c.clientName}</option>)}
                            </select>
                        </div>
                        <input placeholder="المبلغ (ر.ق)" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="input-field" required />
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="input-field" required>
                            <option value="pending">معلقة</option>
                            <option value="paid">مدفوعة</option>
                        </select>
                        <input placeholder="الوصف (مثلاً: أتعاب قضية، استشارة...)" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="input-field" style={{ gridColumn: 'span 2' }} required />
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#9CA3AF' }}>تاريخ الاستحقاق</label>
                            <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="input-field" required />
                        </div>
                        <button type="submit" className="button-primary" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                            <Save size={18} />
                            <span>{editingInvoiceId ? 'تحديث الفاتورة' : 'إصدار الفاتورة'}</span>
                        </button>
                    </form>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ margin: 0 }}>سجل الفواتير</h3>
                    <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, width: '150px' }}
                        >
                            <option value="all">عرض الكل</option>
                            <option value="paid">المدفوعة فقط</option>
                            <option value="pending">المعلقة فقط</option>
                        </select>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <input
                                placeholder="بحث برقم القضية أو الموكل..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="input-field"
                                style={{ marginBottom: 0, paddingRight: '40px' }}
                            />
                            <Search size={18} style={{ position: 'absolute', right: '12px', top: '12px', color: '#9CA3AF' }} />
                        </div>
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>رقم القضية</th>
                                <th>الموكل</th>
                                <th>الهاتف</th>
                                <th>الوصف</th>
                                <th>المبلغ</th>
                                <th>الحالة</th>
                                <th>التاريخ</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.filter(i =>
                                (i.caseId?.caseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (i.caseId?.clientName || '').toLowerCase().includes(searchTerm.toLowerCase())
                            ).map(i => (
                                <tr key={i._id}>
                                    <td style={{ fontWeight: 600 }}>{i.caseId?.caseNumber || '---'}</td>
                                    <td>{i.caseId?.clientName || '---'}</td>
                                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{i.caseId?.clientPhone || '---'}</td>
                                    <td>{i.description}</td>
                                    <td>{i.amount.toLocaleString()} ر.ق</td>
                                    <td>
                                        <span className={`badge ${i.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                            {i.status === 'paid' ? 'مدفوعة' : 'معلقة'}
                                        </span>
                                    </td>
                                    <td>{new Date(i.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            {i.status === 'pending' && (
                                                <button onClick={() => markAsPaid(i._id)} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', padding: 0 }} title="تحديد كمدفوعة">
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            <button onClick={() => handleOpenEdit(i)} style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', padding: 0 }} title="تعديل">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(i._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }} title="حذف">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>لا يوجد فواتير مسجلة حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccountantDashboard;
