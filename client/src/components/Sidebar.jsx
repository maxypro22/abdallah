import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Gavel, Users, CreditCard, LogOut, Calendar, Lock, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = {
        'Super Admin': [
            { name: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
            { name: 'فريق العمل', path: '/users', icon: Users },
            { name: 'إدارة القضايا', path: '/lawyer', icon: Gavel },
            { name: 'أجندة الجلسات', path: '/hearings', icon: Calendar },
            { name: 'الإدارة المالية', path: '/accountant', icon: CreditCard },
        ],
        Admin: [
            { name: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
            { name: 'فريق العمل', path: '/users', icon: Users },
            { name: 'إدارة القضايا', path: '/lawyer', icon: Gavel },
            { name: 'أجندة الجلسات', path: '/hearings', icon: Calendar },
        ],
        Lawyer: [
            { name: 'قضاياي', path: '/lawyer', icon: Gavel },
            { name: 'أجندة الجلسات', path: '/hearings', icon: Calendar },
        ]
    };

    const commonItems = [
        { name: 'تغيير كلمة المرور', path: '/change-password', icon: Lock },
    ];

    const items = navItems[user?.role] || [];

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="sidebar-brand" style={{ marginBottom: 0, textAlign: 'right', fontSize: '1.3rem' }}>المرقاب للمحاماة</div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: window.innerWidth <= 1024 ? 'block' : 'none'
                    }}
                >
                    <X size={24} />
                </button>
            </div>

            <nav style={{ flex: 1 }}>
                {items.map(item => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </div>
                        </NavLink>
                    );
                })}

                <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 0', paddingTop: '1rem' }}>
                    {commonItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Icon size={18} />
                                    <span>{item.name}</span>
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            <button onClick={handleLogout} className="nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer', textAlign: 'right', width: '100%', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)' }}>
                    <LogOut size={18} />
                    <span>تسجيل الخروج</span>
                </div>
            </button>
        </aside>
    );
};

export default Sidebar;
