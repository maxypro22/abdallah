import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Building2, Briefcase } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firmName: '',
        ownerName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const { data } = await api.post(endpoint, formData);
            
            login(data.user, data.token);
            navigate('/');
        } catch (error) {
            console.error('Auth Error:', error);
            const message = error.response?.data?.error || error.message || 'حدث خطأ. يرجى التأكد من البيانات.';
            alert(`خطأ: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card auth-card" style={{ width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.7rem', fontWeight: 800 }}>المرقاب للمحاماة والاستشارات القانونية</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>
                        {isLogin ? 'نظام إدارة القانون المتكامل' : 'انضم إلينا وتحكم في مكتبك بذكاء'}
                    </p>
                </div>

                {/* Tab Toggle */}
                <div style={{ 
                    display: 'flex', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '12px', 
                    padding: '4px', 
                    marginBottom: '2rem' 
                }}>
                    <button 
                        onClick={() => setIsLogin(true)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            background: isLogin ? 'var(--accent)' : 'transparent',
                            color: isLogin ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        تسجيل الدخول
                    </button>
                    <button 
                        onClick={() => setIsLogin(false)}
                        style={{
                            flex: 1,
                            padding: '10px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            background: !isLogin ? 'var(--accent)' : 'transparent',
                            color: !isLogin ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        إنشاء حساب
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>اسم مكتب المحاماة</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        name="firmName"
                                        placeholder="اسم المكتب"
                                        value={formData.firmName}
                                        onChange={handleChange}
                                        className="input-field"
                                        style={{ paddingRight: '40px' }}
                                        required
                                    />
                                    <Building2 size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--accent)' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>اسم المدير المسؤول</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        name="ownerName"
                                        placeholder="الاسم الكامل"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        className="input-field"
                                        style={{ paddingRight: '40px' }}
                                        required
                                    />
                                    <User size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--accent)' }} />
                                </div>
                            </div>
                        </>
                    )}

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>البريد الإلكتروني</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="email"
                                type="email"
                                placeholder="example@murqab.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                style={{ paddingRight: '40px' }}
                                required
                            />
                            <Mail size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--accent)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>كلمة المرور</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                style={{ paddingRight: '40px' }}
                                required
                            />
                            <Lock size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--accent)' }} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '12px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="button-primary" 
                        disabled={loading}
                        style={{ width: '100%', padding: '0.9rem', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'جاري التحميل...' : (isLogin ? 'تسجيل الدخول' : 'بدأ الاستخدام المجاني')}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
                    <span 
                        onClick={() => setIsLogin(!isLogin)} 
                        style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}
                    >
                        {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;

