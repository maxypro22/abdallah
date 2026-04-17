import React, { useState } from 'react';
import api from '../services/api';
import { Lock, ShieldCheck, X, Save, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'كلمات المرور الجديدة غير متطابقة' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
            setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح!' });
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'فشل تغيير كلمة المرور. تأكد من كلمة المرور القديمة.'
            });
        }
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '100%', width: '600px', margin: '0 auto' }}>
            <div className="header-bar">
                <div>
                    <h1 style={{ margin: 0 }}>تأمين الحساب</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>تغيير كلمة المرور الخاصة بك</p>
                </div>
            </div>

            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        background: 'rgba(197, 160, 33, 0.1)',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        border: '1px solid rgba(197, 160, 33, 0.2)'
                    }}>
                        <ShieldCheck size={30} color="var(--gold)" />
                    </div>
                    <h3 style={{ margin: 0 }}>تغيير كلمة المرور</h3>
                </div>

                {message.text && (
                    <div style={{
                        padding: '1.25rem',
                        borderRadius: '0.75rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 600 }}>كلمة المرور القديمة</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                placeholder="ادخل كلمة المرور الحالية"
                                value={formData.oldPassword}
                                onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                                className="input-field"
                                style={{ paddingRight: '45px', margin: 0 }}
                                required
                            />
                            <Key size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 600 }}>كلمة المرور الجديدة</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                placeholder="ادخل كلمة المرور الجديدة"
                                value={formData.newPassword}
                                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                className="input-field"
                                style={{ paddingRight: '45px', margin: 0 }}
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 600 }}>تأكيد كلمة المرور الجديدة</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                placeholder="أعد كتابة كلمة المرور الجديدة"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="input-field"
                                style={{ paddingRight: '45px', margin: 0 }}
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="button-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'جاري الحفظ...' : <><Save size={20} /> تحديث كلمة المرور</>}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            fontSize: '1rem',
                            background: 'none',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                            cursor: 'pointer',
                            borderRadius: '0.75rem',
                            marginTop: '0.5rem',
                            fontWeight: 700,
                            transition: 'var(--transition)'
                        }}
                    >
                        إلغاء التعديل
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
