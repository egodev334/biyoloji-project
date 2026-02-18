import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';
import { Search, Shield, UserX, UserCheck } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = () => {
    adminApi.getUsers({ search: search || undefined, role: roleFilter || undefined })
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, roleFilter]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Kullanıcıyı ${currentStatus ? 'devre dışı bırakmak' : 'aktifleştirmek'} istiyor musunuz?`)) return;
    try {
      await adminApi.toggleStatus(userId);
      toast.success('Durum güncellendi');
      load();
    } catch { toast.error('İşlem başarısız'); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminApi.changeRole(userId, newRole);
      toast.success('Rol güncellendi');
      load();
    } catch { toast.error('Rol güncellenemedi'); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Kullanıcılar</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Platforma kayıtlı tüm kullanıcılar</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-control" placeholder="Ad veya e-posta ile ara..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <select className="form-control" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">Tüm Roller</option>
          <option value="student">Öğrenci</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
                <th>Sınav</th>
                <th>Rozet</th>
                <th>Kayıt Tarihi</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Kullanıcı bulunamadı</td></tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      style={{ fontSize: 12, padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white' }}
                    >
                      <option value="student">Öğrenci</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ fontSize: 13 }}>{(user as any).exam_count || 0}</td>
                  <td style={{ fontSize: 13 }}>{(user as any).badge_count || 0}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(user.created_at!).toLocaleDateString('tr-TR')}
                  </td>
                  <td>
                    <span className={`badge ${(user as any).is_active ? 'badge-success' : 'badge-danger'}`}>
                      {(user as any).is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(user.id, (user as any).is_active)}
                      className="btn btn-secondary btn-sm"
                      title={(user as any).is_active ? 'Devre dışı bırak' : 'Aktifleştir'}
                    >
                      {(user as any).is_active ? <UserX size={12} /> : <UserCheck size={12} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
