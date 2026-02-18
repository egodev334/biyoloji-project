import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forumApi } from '../services/api';
import { ForumCategory } from '../types';
import { MessageSquare, ChevronRight } from 'lucide-react';

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    forumApi.getCategories()
      .then(r => setCategories(r.data.categories))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 800 }}>
      <div className="page-header">
        <h1 className="page-title">Forum</h1>
        <p className="page-subtitle">Öğrenci topluluğuyla etkileşime geçin, sorularınızı sorun</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {categories.map((cat, idx) => (
            <Link
              key={cat.id}
              to={`/forum/${cat.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px',
                borderBottom: idx < categories.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none', color: 'inherit', transition: 'background 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius)',
                background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <MessageSquare size={20} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{cat.name}</div>
                {cat.description && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.description}</div>
                )}
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>
                <div>{cat.topic_count || 0} konu</div>
                <div>{cat.reply_count || 0} yanıt</div>
              </div>
              <ChevronRight size={16} color="var(--text-light)" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
