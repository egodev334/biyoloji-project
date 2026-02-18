import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { forumApi } from '../services/api';
import { ForumTopic } from '../types';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, Pin, Lock, Plus, ArrowLeft, Clock } from 'lucide-react';

export default function ForumCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuthStore();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!categoryId) return;
    forumApi.getTopics(categoryId).then(r => {
      setTopics(r.data.topics);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Get category name from first topic or from categories
    forumApi.getCategories().then(r => {
      const cat = r.data.categories.find((c: any) => c.id === categoryId);
      if (cat) setCategoryName(cat.name);
    });
  }, [categoryId]);

  const handleNewTopic = async () => {
    if (!categoryId || !newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);
    try {
      const r = await forumApi.createTopic({ category_id: categoryId, title: newTitle, content: newContent });
      setShowNewForm(false);
      setNewTitle('');
      setNewContent('');
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/forum" style={{ color: 'var(--text-muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={14} /> Forum
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{categoryName}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{categoryName}</h1>
        {user && (
          <button onClick={() => setShowNewForm(!showNewForm)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Yeni Konu
          </button>
        )}
      </div>

      {/* New topic form */}
      {showNewForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Yeni Konu Oluştur</h3>
          <div className="form-group">
            <label>Başlık</label>
            <input className="form-control" placeholder="Konu başlığı..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label>İçerik</label>
            <textarea className="form-control" rows={5} placeholder="Konu içeriğini yazın..." value={newContent} onChange={e => setNewContent(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleNewTopic} className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Konuyu Gönder'}
            </button>
            <button onClick={() => setShowNewForm(false)} className="btn btn-secondary btn-sm">İptal</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : topics.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={36} color="var(--text-light)" style={{ marginBottom: 10 }} />
          <h3>Henüz konu yok</h3>
          <p style={{ fontSize: 13 }}>{user ? 'İlk konuyu siz açın!' : 'Konu açmak için giriş yapın.'}</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          {topics.map((topic, idx) => (
            <Link
              key={topic.id}
              to={`/forum/topic/${topic.id}`}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px',
                borderBottom: idx < topics.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none', color: 'inherit', transition: 'background 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  {topic.author_name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {topic.is_pinned && <Pin size={12} color="var(--primary)" />}
                  {topic.is_locked && <Lock size={12} color="var(--text-muted)" />}
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{topic.title}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {topic.author_name} · {formatDate(topic.created_at)}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MessageSquare size={11} /> {topic.reply_count || 0}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>
                  {topic.view_count} görüntüleme
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
