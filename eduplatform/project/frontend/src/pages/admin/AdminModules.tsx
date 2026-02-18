import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { modulesApi } from '../../services/api';
import { Module } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react';

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    modulesApi.getAll().then(r => setModules(r.data.modules)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" modülünü silmek istediğinizden emin misiniz?`)) return;
    try {
      await modulesApi.delete(id);
      toast.success('Modül silindi');
      load();
    } catch { toast.error('Modül silinemedi'); }
  };

  const handleTogglePublish = async (mod: Module) => {
    try {
      await modulesApi.update(mod.id, {
        title: mod.title, description: mod.description, content: mod.content,
        category: mod.category, order_index: mod.order_index, is_published: !mod.is_published
      });
      toast.success(!mod.is_published ? 'Modül yayınlandı' : 'Yayından kaldırıldı');
      load();
    } catch { toast.error('İşlem başarısız'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Modüller</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{modules.length} modül</p>
        </div>
        <Link to="/admin/modules/new" className="btn btn-primary btn-sm">
          <Plus size={14} /> Yeni Modül
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Kategori</th>
                <th>Dosyalar</th>
                <th>Görüntüleme</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Henüz modül eklenmemiş</td></tr>
              ) : modules.map(mod => (
                <tr key={mod.id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{mod.title}</div>
                    {mod.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.description}</div>}
                  </td>
                  <td>{mod.category ? <span className="badge badge-primary">{mod.category}</span> : <span style={{ color: 'var(--text-light)', fontSize: 13 }}>—</span>}</td>
                  <td style={{ fontSize: 13 }}>{mod.file_count || 0}</td>
                  <td style={{ fontSize: 13 }}>{mod.view_count || 0}</td>
                  <td>
                    <span className={`badge ${mod.is_published ? 'badge-success' : 'badge-warning'}`}>
                      {mod.is_published ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/admin/modules/${mod.id}/edit`} className="btn btn-secondary btn-sm" title="Düzenle">
                        <Edit size={12} />
                      </Link>
                      <button onClick={() => handleTogglePublish(mod)} className="btn btn-secondary btn-sm" title={mod.is_published ? 'Yayından kaldır' : 'Yayınla'}>
                        {mod.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => handleDelete(mod.id, mod.title)} className="btn btn-danger btn-sm" title="Sil">
                        <Trash2 size={12} />
                      </button>
                    </div>
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
