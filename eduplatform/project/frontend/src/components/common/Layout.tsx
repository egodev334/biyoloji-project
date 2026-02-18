import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { BookOpen, MessageSquare, User, LogOut, Settings, Smartphone, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: 60, gap: 32 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <BookOpen size={22} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)' }}>EduPlatform</span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: 4, flex: 1 }} className="desktop-nav">
            <NavLink to="/modules" active={isActive('/modules')}>Modüller</NavLink>
            <NavLink to="/forum" active={isActive('/forum')}>Forum</NavLink>
            <NavLink to="/calisma-sorulari" active={isActive('/calisma-sorulari')}>Çalışma Soruları</NavLink>
            <NavLink to="/mobil-uygulama" active={isActive('/mobil-uygulama')}>
              <Smartphone size={14} /> Mobil Uygulama
            </NavLink>
          </div>

          {/* User Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="btn btn-secondary btn-sm">
                    <Settings size={14} /> Admin
                  </Link>
                )}
                <Link
                  to={`/profil/${user.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text)' }}
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  ) : (
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, color: 'var(--primary)'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Çıkış">
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Giriş</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Kayıt Ol</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', padding: 4 }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link to="/modules" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text)', fontSize: 14 }}>Modüller</Link>
            <Link to="/forum" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text)', fontSize: 14 }}>Forum</Link>
            <Link to="/calisma-sorulari" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text)', fontSize: 14 }}>Çalışma Soruları</Link>
            <Link to="/mobil-uygulama" onClick={() => setMobileMenuOpen(false)} style={{ padding: '8px 0', color: 'var(--text)', fontSize: 14 }}>Mobil Uygulama</Link>
          </div>
        )}
      </nav>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} EduPlatform. Tüm hakları saklıdır.
          </span>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            <Link to="/modules">Modüller</Link>
            <Link to="/forum">Forum</Link>
            <Link to="/mobil-uygulama">Mobil Uygulama</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, active, children }: { to: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '6px 12px',
        borderRadius: 'var(--radius)',
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--primary)' : 'var(--text)',
        background: active ? 'var(--primary-light)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </Link>
  );
}
