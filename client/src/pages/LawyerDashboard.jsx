import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Gavel, Plus, Clock, CheckCircle, ExternalLink, Edit2, X, Save, Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';

const LawyerDashboard = () => {
    const [cases, setCases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCase, setEditingCase] = useState(null);
    const [formData, setFormData] = useState({
        caseNumber: '',
        clientName: '',
        clientPhone: '',
        type: '',
        court: '',
        status: 'new',
        memo: ''
    });

    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCases = async (force = false) => {
        try {
            const statusParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
            const tParam = force ? (statusParam ? `&t=${Date.now()}` : `?t=${Date.now()}`) : '';
            const { data } = await api.get('/cases' + statusParam + tParam);
            setCases(data);
        } catch (e) {
            console.error(e);
            if (e.response?.status === 401) {
                window.location.href = '/login';
            }
        }
    };

    useEffect(() => {
        fetchCases();
        setCurrentPage(1);
    }, [statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, monthFilter, yearFilter]);

    const handleOpenCreate = () => {
        setEditingCase(null);
        setFormData({ caseNumber: '', clientName: '', clientPhone: '', type: '', court: '', status: 'new', memo: '' });
        setShowForm(true);
    };

    const handleOpenEdit = (c) => {
        setEditingCase(c._id);
        setFormData({
            caseNumber: c.caseNumber,
            clientName: c.clientName,
            clientPhone: c.clientPhone || '',
            type: c.type,
            court: c.court || '',
            status: c.status,
            memo: c.memo || ''
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCase) {
                await api.put(`/cases/${editingCase}`, formData);
            } else {
                await api.post('/cases', formData);
            }
            setShowForm(false);
            fetchCases();
        } catch (error) {
            console.error('🔥 Save Case Error:', error.response?.data || error.message);
            const msg = error.response?.data?.error || error.response?.data?.details || error.message || 'فشل حفظ البيانات';
            alert(`خطأ: ${msg}`);
        }
    };

    const filteredCases = cases.filter(c => {
        const matchSearch = (c.caseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.clientName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchDate = true;
        if (monthFilter !== 'all' || yearFilter !== 'all') {
            const date = new Date(c.createdAt || c.created_at || Date.now());
            if (monthFilter !== 'all' && date.getMonth() + 1 !== parseInt(monthFilter)) matchDate = false;
            if (yearFilter !== 'all' && date.getFullYear() !== parseInt(yearFilter)) matchDate = false;
        }

        return matchSearch && matchDate;
    });

    const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
    const paginatedCases = filteredCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="header-bar">
                <div>
                    <h1 style={{ margin: 0 }}>نظرة عامة على القضايا</h1>
                    <p style={{ color: '#9CA3AF', margin: '5px 0 0 0' }}>متابعة القضايا والجلسات النشطة</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => fetchCases(true)} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: '#9CA3AF' }}>
                        <RefreshCw size={18} />
                        تحديث
                    </button>
                    <button onClick={handleOpenCreate} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        <span>إضافة قضية جديدة</span>
                    </button>
                </div>
            </div>

            <div className="grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ borderRight: '4px solid #3B82F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">إجمالي القضايا</span>
                        <Gavel size={20} color="#3B82F6" />
                    </div>
                    <div className="stat-value">{cases.length}</div>
                </div>
                <div className="stat-card" style={{ borderRight: '4px solid #F59E0B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">قضايا مؤجلة</span>
                        <Clock size={20} color="#F59E0B" />
                    </div>
                    <div className="stat-value">{cases.filter(c => c.status === 'adjourned').length}</div>
                </div>
                <div className="stat-card" style={{ borderRight: '4px solid #10B981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">قضايا منتهية</span>
                        <CheckCircle size={20} color="#10B981" />
                    </div>
                    <div className="stat-value">{cases.filter(c => c.status === 'closed').length}</div>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', border: '1px solid #3B82F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>{editingCase ? 'تعديل بيانات القضية' : 'تفاصيل القضية الجديدة'}</h3>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input placeholder="رقم القضية" value={formData.caseNumber} onChange={e => setFormData({ ...formData, caseNumber: e.target.value })} className="input-field" required />
                        <input placeholder="اسم الموكل" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} className="input-field" required />
                        <input placeholder="رقم هاتف الموكل" value={formData.clientPhone} onChange={e => setFormData({ ...formData, clientPhone: e.target.value })} className="input-field" />
                        <input placeholder="نوع القضية" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="input-field" required />
                        <input placeholder="المحكمة" value={formData.court} onChange={e => setFormData({ ...formData, court: e.target.value })} className="input-field" />

                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="input-field" required>
                            <option value="new">جديدة</option>
                            <option value="adjourned">مؤجلة</option>
                            <option value="closed">منتهية</option>
                        </select>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#9CA3AF' }}>مذكرة القضية</label>
                            <textarea
                                placeholder="اكتب تفاصيل أو ملاحظات إضافية هنا..."
                                value={formData.memo}
                                onChange={e => setFormData({ ...formData, memo: e.target.value })}
                                className="input-field"
                                style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
                            />
                        </div>

                        <button type="submit" className="button-primary" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} />
                            <span>{editingCase ? 'تحديث البيانات' : 'حفظ القضية'}</span>
                        </button>
                    </form>
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
                    <h3 style={{ margin: 0 }}>قائمة القضايا</h3>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, width: '130px' }}
                        >
                            <option value="all">كل الحالات</option>
                            <option value="new">جديدة</option>
                            <option value="adjourned">مؤجلة</option>
                            <option value="closed">منتهية</option>
                        </select>
                        <select
                            value={monthFilter}
                            onChange={e => setMonthFilter(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, width: '130px' }}
                        >
                            <option value="all">كل الأشهر</option>
                            {[...Array(12).keys()].map(m => (
                                <option key={m + 1} value={m + 1}>{new Date(0, m).toLocaleString('ar-EG', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select
                            value={yearFilter}
                            onChange={e => setYearFilter(e.target.value)}
                            className="input-field"
                            style={{ marginBottom: 0, width: '120px' }}
                        >
                            <option value="all">كل السنوات</option>
                            {[...Array(15).keys()].map(i => 2026 + i).map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <input
                                placeholder="بحث برقم القضية أو اسم الموكل..."
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
                                <th>النوع</th>
                                <th>المحامي المسجل</th>
                                <th>المحكمة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCases.map(c => (
                                <tr key={c._id}>
                                    <td style={{ fontWeight: 600 }}>{c.caseNumber}</td>
                                    <td>{c.clientName}</td>
                                    <td style={{ direction: 'ltr', textAlign: 'right' }}>{c.clientPhone || '---'}</td>
                                    <td>{c.type}</td>
                                    <td>{c.createdBy_name || c.createdBy?.name || '---'}</td>
                                    <td>{c.court || '---'}</td>
                                    <td>
                                        <span className={`badge ${c.status === 'adjourned' ? 'badge-warning' : c.status === 'closed' ? 'badge-success' : 'badge-danger'}`}>
                                            {c.status === 'new' ? 'جديدة' : c.status === 'adjourned' ? 'مؤجلة' : 'منتهية'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '15px' }}>
                                            <button onClick={() => handleOpenEdit(c)} style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', padding: 0 }} title="تعديل">
                                                <Edit2 size={16} />
                                            </button>
                                            <Link to={`/cases/${c._id}`} style={{ color: '#3B82F6' }} title="عرض التفاصيل والجلسات">
                                                <ExternalLink size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCases.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', color: '#9CA3AF', padding: '2rem' }}>
                                        {searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد قضايا مضافة بعد'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.7rem', color: '#4B5563' }}>
                    Dashboard V1.5 - Import Fix Live
                </div>
            </div>
        </div>
    );
};

export default LawyerDashboard;
