import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
            const { data } = await api.post('/auth/login', formData);
            login(data.user, data.token);
            navigate('/');
        } catch (error) {
            console.error('Auth Error:', error);
            const message = error.response?.data?.error || error.message || 'فشل تسجيل الدخول. يرجى التأكد من البيانات.';
            alert(`خطأ: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="card auth-card" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.7rem', fontWeight: 800 }}>المرقاب للمحاماة والاستشارات القانونية</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>نظام إدارة القانون المتكامل</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
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
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
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
                        {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    نظام المرقاب لإدارة مكاتب المحاماة
                </div>
            </div>
        </div>
    );
};

export default Login;
    );
};

export default Login;

