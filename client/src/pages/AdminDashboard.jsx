import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Gavel, TrendingUp, AlertCircle, RefreshCw, Edit2, ExternalLink, X, Save, Trash2, Search, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const [stats, setStats] = useState({
        lawyerCount: 0,
        caseCount: 0,
        totalRevenue: 0,
        totalPending: 0
    });
    const [cases, setCases] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [hearings, setHearings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingCaseId, setEditingCaseId] = useState(null);
    const [formData, setFormData] = useState({
        caseNumber: '', clientName: '', clientPhone: '', type: '', court: '', status: 'new', memo: ''
    });

    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchData = async (force = false) => {
        setLoading(true);
        try {
            const statusParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
            const tParam = force ? (statusParam ? `&t=${Date.now()}` : `?t=${Date.now()}`) : '';

            const promises = [
                api.get('/dashboard/stats' + (force ? `?t=${Date.now()}` : '')),
                api.get('/cases' + statusParam + tParam),
                api.get('/cases/hearings/all')
            ];

            if (currentUser?.role === 'Super Admin') {
                promises.push(api.get('/finance/invoices'));
            }

            const results = await Promise.all(promises);
            setStats(results[0].data);
            setCases(results[1].data);
            setHearings(results[2].data || []);
            
            if (currentUser?.role === 'Super Admin' && results[3]) {
                setInvoices(results[3].data || []);
            } else {
                setInvoices([]);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
        setLoading(false);
    };

    const handleExportCSV = () => {
        try {
            if (cases.length === 0) {
                alert('لا توجد بيانات لتصديرها حالياً');
                return;
            }

            // Headers in Arabic
            const headers = ['رقم القضية', 'اسم الموكل', 'الهاتف', 'نوع القضية', 'المحكمة', 'الحالة', 'المبلغ المدفوع (ر.ق)', 'المبلغ المتبقي (ر.ق)', 'سجل الجلسات', 'تاريخ التسجيل'];
            
            // Map rows and escape data for CSV
            const rows = cases.map(c => {
                // Calculate finances for this specific case
                const caseInvoices = invoices.filter(inv => inv.caseId === c._id);
                const paid = caseInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0);
                const pending = caseInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + Number(inv.amount), 0);

                // Format hearings
                const caseHearings = hearings.filter(h => h.caseId === c._id);
                const hearingsText = caseHearings.map(h => {
                    const d = new Date(h.date).toLocaleDateString('ar-EG');
                    const st = h.result ? '(تمت)' : '(انتظار)';
                    return `${d} ${st}`;
                }).join(' | ') || 'لا توجد جلسات';

                return [
                    `"${c.caseNumber || ''}"`,
                    `"${c.clientName || ''}"`,
                    `"${c.clientPhone || ''}"`,
                    `"${c.type || ''}"`,
                    `"${c.court || ''}"`,
                    `"${c.status === 'new' ? 'جديدة' : c.status === 'adjourned' ? 'مؤجلة' : 'منتهية'}"`,
                    `"${paid}"`,
                    `"${pending}"`,
                    `"${hearingsText}"`,
                    `"${new Date(c.createdAt).toLocaleDateString('ar-EG')}"`
                ];
            });

            // Combine into string with UTF-8 BOM for Excel Arabic support
            const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            
            // Create blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            const fileName = `المرقاب_تقرير_شامل_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.csv`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export Error:', error);
            alert('حدث خطأ أثناء محاولة تصدير البيانات');
        }
    };

    useEffect(() => {
        fetchData();
        setCurrentPage(1);
    }, [statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, monthFilter, yearFilter]);

    const handleOpenEdit = (c) => {
        setEditingCaseId(c._id);
        setFormData({
            caseNumber: c.caseNumber,
            clientName: c.clientName,
            clientPhone: c.clientPhone || '',
            type: c.type,
            court: c.court || '',
            status: c.status,
            memo: c.memo || ''
        });
        setShowEditForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/cases/${editingCaseId}`, formData);
            setShowEditForm(false);
            fetchData();
        } catch (error) {
            console.error('🔥 Admin Update Error:', error.response?.data || error.message);
            const msg = error.response?.data?.error || error.response?.data?.details || error.message || 'فشل تحديث البيانات';
            alert(`خطأ: ${msg}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه القضية نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                await api.delete(`/cases/${id}`);
                fetchData();
            } catch (error) {
                alert('فشل حذف القضية');
            }
        }
    };

    const filteredCases = cases.filter(c => {
        const matchSearch = (c.caseNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.clientName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchDate = true;
        if (monthFilter !== 'all' || yearFilter !== 'all') {
            const date = new Date(c.createdAt || c.created_at || Date.now()); // Fallback
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h1 style={{ margin: 0 }}>لوحة إدارة النظام</h1>
                        <span className={`badge ${currentUser?.role === 'Super Admin' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.8rem' }}>
                            {currentUser?.role === 'Super Admin' ? 'سوبر أدمن' : 'مدير نظام'}
                        </span>
                    </div>
                    <p style={{ color: '#9CA3AF', margin: '5px 0 0 0' }}>إحصائيات مباشرة وأداء المكتب</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handleExportCSV} 
                        className="button-primary" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: 'rgba(16, 185, 129, 0.15)', 
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <Download size={18} />
                        نسخة احتياطية (Excel)
                    </button>
                    <button 
                        onClick={() => fetchData(true)} 
                        className="button-primary" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px', 
                            background: 'rgba(255,255,255,0.05)', 
                            color: '#9CA3AF' 
                        }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        تحديث البيانات
                    </button>
                </div>
            </div>

            <div className="grid">
                <div className="stat-card" style={{ borderRight: '4px solid #3B82F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">المحامين المقيدين</span>
                        <Users size={20} color="#3B82F6" />
                    </div>
                    <div className="stat-value">{stats.lawyerCount}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>إجمالي الفريق النشط</div>
                </div>

                <div className="stat-card" style={{ borderRight: '4px solid #F59E0B' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="stat-label">إجمالي القضايا</span>
                        <Gavel size={20} color="#F59E0B" />
                    </div>
                    <div className="stat-value">{stats.caseCount}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>جميع القضايا المسجلة</div>
                </div>

                {currentUser?.role === 'Super Admin' && (
                    <>
                        <div className="stat-card" style={{ borderRight: '4px solid #10B981' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="stat-label">الإيرادات المحصلة</span>
                                <TrendingUp size={20} color="#10B981" />
                            </div>
                            <div className="stat-value">{stats.totalRevenue.toLocaleString()} ر.ق</div>
                            <div style={{ color: '#10B981', fontSize: '0.8rem' }}>الفواتير المسددة بالكامل</div>
                        </div>

                        <div className="stat-card" style={{ borderRight: '4px solid #EF4444' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="stat-label">مبالغ قيد الانتظار</span>
                                <AlertCircle size={20} color="#EF4444" />
                            </div>
                            <div className="stat-value">{stats.totalPending.toLocaleString()} ر.ق</div>
                            <div style={{ color: '#EF4444', fontSize: '0.8rem' }}>فواتير لم يتم تحصيلها</div>
                        </div>
                    </>
                )}
            </div>

            {
                showEditForm && (
                    <div className="card" style={{ marginTop: '2rem', border: '1px solid #F59E0B' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>تعديل بيانات القضية عبر الإدارة</h3>
                            <button onClick={() => setShowEditForm(false)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                    placeholder="الملاحظات القانونية..."
                                    value={formData.memo}
                                    onChange={e => setFormData({ ...formData, memo: e.target.value })}
                                    className="input-field"
                                    style={{ minHeight: '100px', resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="button-primary" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                <Save size={18} /> تحديث البيانات
                            </button>
                        </form>
                    </div>
                )
            }

            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap', flexDirection: 'row-reverse' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0 }}>مراجعة وإدارة القضايا</h3>
                        <Link to="/lawyer" style={{ color: '#3B82F6', fontSize: '0.85rem' }}><ExternalLink size={14} /></Link>
                    </div>
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
                                <th>الحالة</th>
                                <th>إجراءات</th>
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
                                            <button onClick={() => handleDelete(c._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 0 }} title="حذف">
                                                <Trash2 size={16} />
                                            </button>
                                            <Link to={`/cases/${c._id}`} style={{ color: '#3B82F6' }} title="عرض التفاصيل">
                                                <ExternalLink size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCases.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF' }}>لا يوجد بيانات تطابق بحثك</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.7rem', color: '#4B5563' }}>
                    Admin Portal V1.4 - Real-time Enabled
                </div>
            </div>
        </div >
    );
};

export default AdminDashboard;
