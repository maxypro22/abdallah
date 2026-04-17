import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.user, data.token);
            navigate('/');
        } catch (error) {
            console.error('Login Error:', error);
            const message = error.response?.data?.error || error.message || 'فشل تسجيل الدخول. يرجى التأكد من البيانات.';
            alert(`خطأ: ${message}\nتأكد من إعدادات VITE_API_URL في Vercel`);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ color: '#FFFFFF', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>المرقاب للمحاماة والاستشارات القانونية</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '1rem' }}>نظام إدارة القانون المتكامل</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>البريد الإلكتروني</label>
                        <input
                            type="email"
                            placeholder="example@murqab.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>كلمة المرور</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                style={{ paddingRight: '45px' }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '23px',
                                    transform: 'translateY(-50%)',
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
                    <button type="submit" className="button-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1.1rem' }}>
                        تسجيل الدخول
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    نظام المرقاب لإدارة مكاتب المحاماة
                </div>
            </div>
        </div>
    );
};

export default Login;
