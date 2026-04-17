import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Building2, User, Mail, Lock } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        firmName: '', ownerName: '', email: '', password: ''
    });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        try {
            const { data } = await api.post('/auth/register', formData);
            login(data.user, data.token);
            navigate('/admin');
        } catch (error) {
            console.error('Registration Error:', error);
            const message = error.response?.data?.error || error.message || 'فشل إنشاء الحساب. تأكد من البيانات.';
            alert(`خطأ: ${message}\nتأكد من إعدادات VITE_API_URL في Vercel`);
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="card auth-card" style={{ maxWidth: '500px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>المرقاب للمحاماة والاستشارات القانونية</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1rem' }}>انضم إلى المنصة وتحكم في مكتبك بذكاء</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>اسم مكتب المحاماة</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                placeholder="مثلاً: شركة المحامي لخدمات القانون"
                                value={formData.firmName}
                                onChange={e => setFormData({ ...formData, firmName: e.target.value })}
                                className="input-field"
                                style={{ paddingRight: '45px' }}
                                required
                            />
                            <Building2 size={18} style={{ position: 'absolute', right: '15px', top: '12px', color: 'var(--accent)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>اسم المدير المسؤول</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                placeholder="الاسم الكامل"
                                value={formData.ownerName}
                                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                                className="input-field"
                                style={{ paddingRight: '45px' }}
                                required
                            />
                            <User size={18} style={{ position: 'absolute', right: '15px', top: '12px', color: 'var(--accent)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>البريد الإلكتروني للعمل</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                placeholder="info@yourfirm.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                style={{ paddingRight: '45px' }}
                                required
                            />
                            <Mail size={18} style={{ position: 'absolute', right: '15px', top: '12px', color: 'var(--accent)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>كلمة المرور</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="input-field"
                                style={{ paddingRight: '45px' }}
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', right: '15px', top: '12px', color: 'var(--accent)' }} />
                        </div>
                    </div>

                    <button type="submit" className="button-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        بدأ الاستخدام المجاني
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    لديك حساب بالفعل؟ <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>تسجيل الدخول</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
