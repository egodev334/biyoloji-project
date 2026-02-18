import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { modulesApi } from '../services/api';
import { Module } from '../types';
import { BookOpen, Search, FileText, Eye } from 'lucide-react';

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    modulesApi.getCategories().then(r => setCategories(r.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    modulesApi.getAll({ search: search || undefined, category: selectedCategory || undefined })
      .then(r => setModules(r.data.modules))
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <div className="page-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <h1 className="page-title">Eğitim Modülleri</h1>
        <p className="page-subtitle">Kapsamlı eğitim içeriklerine erişin ve öğrenmeye başlayın</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            placeholder="Modül ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>

        <select
          className="form-control"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : modules.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={40} color="var(--text-light)" style={{ marginBottom: 12 }} />
          <h3>Modül bulunamadı</h3>
          <p style={{ fontSize: 14 }}>Arama kriterlerini değiştirmeyi deneyin</p>
        </div>
      ) : (
        <div className="grid-3">
          {modules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ module }: { module: Module }) {
  return (
    <Link to={`/modules/${module.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: 22, height: '100%', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <BookOpen size={18} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            {module.category && (
              <span className="badge badge-primary" style={{ marginBottom: 6 }}>{module.category}</span>
            )}
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{module.title}</h3>
          </div>
        </div>

        {module.description && (
          <p style={{
            fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {module.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <FileText size={12} /> {module.file_count || 0} dosya
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={12} /> {module.view_count || 0} görüntüleme
          </span>
          {(module.exam_count || 0) > 0 && (
            <span className="badge badge-warning" style={{ fontSize: 11 }}>Sınav var</span>
          )}
        </div>
      </div>
    </Link>
  );
}
