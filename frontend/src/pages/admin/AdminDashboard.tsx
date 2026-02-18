import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { Users, BookOpen, FileQuestion, MessageSquare, TrendingUp, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Gösterge Paneli</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Platforma genel bakış</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard
          icon={<Users size={20} color="var(--primary)" />}
          label="Toplam Kullanıcı"
          value={stats?.users?.total || 0}
          sub={`${stats?.users?.new_this_week || 0} bu hafta yeni`}
          color="var(--primary-light)"
        />
        <StatCard
          icon={<BookOpen size={20} color="#16a34a" />}
          label="Modül"
          value={stats?.modules?.total || 0}
          sub={`${stats?.modules?.published || 0} yayında`}
          color="#dcfce7"
        />
        <StatCard
          icon={<FileQuestion size={20} color="#d97706" />}
          label="Sınav Girişi"
          value={stats?.exams?.total_attempts || 0}
          sub={`Ort. puan %${stats?.exams?.avg_score || 0}`}
          color="#fef3c7"
        />
        <StatCard
          icon={<MessageSquare size={20} color="#0ea5e9" />}
          label="Forum Konusu"
          value={stats?.forum?.topics || 0}
          sub={`${stats?.forum?.replies || 0} yanıt`}
          color="#e0f2fe"
        />
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Hızlı İşlemler</h2>
        <div className="grid-4" style={{ gap: 12 }}>
          <QuickAction icon={<Plus size={16} />} label="Yeni Modül" to="/admin/modules/new" />
          <QuickAction icon={<FileQuestion size={16} />} label="Sınav Yönet" to="/admin/exams" />
          <QuickAction icon={<Users size={16} />} label="Kullanıcılar" to="/admin/users" />
          <QuickAction icon={<MessageSquare size={16} />} label="Forum Modere" to="/admin/forum" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: any) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
        border: '1px solid var(--border)', borderRadius: 'var(--radius)',
        fontSize: 13, fontWeight: 500, color: 'var(--text)',
        background: 'white', transition: 'all 0.15s', cursor: 'pointer'
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
        {icon} {label}
      </div>
    </Link>
  );
}
