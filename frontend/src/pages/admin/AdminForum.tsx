import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forumApi } from '../../services/api';
import { ForumCategory, ForumTopic } from '../../types';
import toast from 'react-hot-toast';
import { Pin, Lock, Trash2, ExternalLink } from 'lucide-react';

export default function AdminForum() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    forumApi.getCategories().then(r => setCategories(r.data.categories)).finally(() => setLoading(false));
  }, []);

  const loadTopics = (catId: string) => {
    setSelectedCategory(catId);
    if (!catId) { setTopics([]); return; }
    forumApi.getTopics(catId).then(r => setTopics(r.data.topics));
  };

  const handlePin = async (topicId: string) => {
    try {
      const r = await forumApi.pinTopic(topicId);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, is_pinned: r.data.is_pinned } : t));
    } catch { toast.error('İşlem başarısız'); }
  };

  const handleLock = async (topicId: string) => {
    try {
      const r = await forumApi.lockTopic(topicId);
      setTopics(prev => prev.map(t => t.id === topicId ? { ...t, is_locked: r.data.is_locked } : t));
    } catch { toast.error('İşlem başarısız'); }
  };

  const handleDelete = async (topicId: string) => {
    if (!confirm('Bu konuyu silmek istiyor musunuz?')) return;
    try {
      await forumApi.deleteTopic(topicId);
      setTopics(prev => prev.filter(t => t.id !== topicId));
      toast.success('Konu silindi');
    } catch { toast.error('Silinemedi'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Forum Moderasyonu</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Categories sidebar */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kategoriler</div>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => loadTopics(cat.id)} style={{
              display: 'block', width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)',
              background: selectedCategory === cat.id ? 'var(--primary-light)' : 'none',
              color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text)',
              border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13,
              fontWeight: selectedCategory === cat.id ? 600 : 400, marginBottom: 2
            }}>
              {cat.name}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>({cat.topic_count})</span>
            </button>
          ))}
        </div>

        {/* Topics list */}
        <div>
          {!selectedCategory ? (
            <div className="empty-state"><h3>Soldan bir kategori seçin</h3></div>
          ) : topics.length === 0 ? (
            <div className="empty-state"><h3>Bu kategoride konu yok</h3></div>
          ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr><th>Konu</th><th>Yazar</th><th>Yanıt</th><th>Durum</th><th>İşlemler</th></tr>
                </thead>
                <tbody>
                  {topics.map(topic => (
                    <tr key={topic.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13, maxWidth: 320 }}>
                          <Link to={`/forum/topic/${topic.id}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {topic.title} <ExternalLink size={11} color="var(--text-light)" />
                          </Link>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(topic.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{topic.author_name}</td>
                      <td style={{ fontSize: 13 }}>{topic.reply_count || 0}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {topic.is_pinned && <span className="badge badge-primary" style={{ fontSize: 10 }}>Sabitli</span>}
                          {topic.is_locked && <span className="badge badge-warning" style={{ fontSize: 10 }}>Kilitli</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handlePin(topic.id)} className="btn btn-secondary btn-sm" title={topic.is_pinned ? 'Sabiti kaldır' : 'Sabitle'}>
                            <Pin size={11} color={topic.is_pinned ? 'var(--primary)' : 'inherit'} />
                          </button>
                          <button onClick={() => handleLock(topic.id)} className="btn btn-secondary btn-sm" title={topic.is_locked ? 'Kilidi kaldır' : 'Kilitle'}>
                            <Lock size={11} color={topic.is_locked ? 'var(--warning)' : 'inherit'} />
                          </button>
                          <button onClick={() => handleDelete(topic.id)} className="btn btn-danger btn-sm" title="Sil">
                            <Trash2 size={11} />
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
      </div>
    </div>
  );
}
