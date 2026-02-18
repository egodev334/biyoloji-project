import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, BookOpen, Users, FileQuestion, MessageSquare,
  ChevronRight, LogOut, Home, PenLine
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Gösterge Paneli', icon: LayoutDashboard, exact: true },
  { to: '/admin/modules', label: 'Modüller', icon: BookOpen },
  { to: '/admin/exams', label: 'Sınavlar', icon: FileQuestion },
  { to: '/admin/practice', label: 'Çalışma Soruları', icon: PenLine },
  { to: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { to: '/admin/forum', label: 'Forum', icon: MessageSquare },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'white',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>EduPlatform</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Admin Paneli</div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 12px', flex: 1, overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontWeight: isActive(to, exact) ? 600 : 400,
                color: isActive(to, exact) ? 'var(--primary)' : 'var(--text)',
                background: isActive(to, exact) ? 'var(--primary-light)' : 'transparent',
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              {label}
              {isActive(to, exact) && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--text-muted)',
            textDecoration: 'none', marginBottom: 4
          }}>
            <Home size={15} /> Siteye Dön
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderRadius: 'var(--radius)', fontSize: 13, color: 'var(--danger)',
              background: 'none', border: 'none', width: '100%', cursor: 'pointer'
            }}
          >
            <LogOut size={15} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Header */}
        <div style={{
          background: 'white', borderBottom: '1px solid var(--border)',
          padding: '14px 28px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'
        }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Hoş geldiniz, <strong>{user?.name}</strong>
          </span>
        </div>

        <main style={{ padding: 28, flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
