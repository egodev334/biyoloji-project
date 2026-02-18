import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { forumApi } from '../services/api';
import { ForumTopic, ForumReply } from '../types';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { ArrowLeft, Lock, Pin, Trash2, Shield } from 'lucide-react';

export default function ForumTopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user } = useAuthStore();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!topicId) return;
    forumApi.getTopic(topicId)
      .then(r => { setTopic(r.data.topic); setReplies(r.data.replies); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [topicId]);

  const handleReply = async () => {
    if (!topicId || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      await forumApi.createReply(topicId, replyContent);
      setReplyContent('');
      load();
      toast.success('Yanıt eklendi');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Yanıt gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Bu yanıtı silmek istediğinizden emin misiniz?')) return;
    try {
      await forumApi.deleteReply(replyId);
      setReplies(prev => prev.filter(r => r.id !== replyId));
      toast.success('Yanıt silindi');
    } catch { toast.error('Silinemedi'); }
  };

  const handlePin = async () => {
    if (!topicId) return;
    try {
      const r = await forumApi.pinTopic(topicId);
      setTopic(prev => prev ? { ...prev, is_pinned: r.data.is_pinned } : prev);
    } catch { toast.error('İşlem başarısız'); }
  };

  const handleLock = async () => {
    if (!topicId) return;
    try {
      const r = await forumApi.lockTopic(topicId);
      setTopic(prev => prev ? { ...prev, is_locked: r.data.is_locked } : prev);
    } catch { toast.error('İşlem başarısız'); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!topic) return null;

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link to="/forum" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={13} /> Forum
        </Link>
        <span>/</span>
        <Link to={`/forum/${topic.category_id}`} style={{ color: 'var(--text-muted)' }}>{topic.category_name}</Link>
      </div>

      {/* Topic */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {topic.is_pinned && <span className="badge badge-primary"><Pin size={10} /> Sabitlenmiş</span>}
              {topic.is_locked && <span className="badge badge-warning"><Lock size={10} /> Kilitli</span>}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>{topic.title}</h1>
          </div>

          {user?.role === 'admin' && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={handlePin} className="btn btn-secondary btn-sm" title={topic.is_pinned ? 'Sabiti kaldır' : 'Sabitle'}>
                <Pin size={13} /> {topic.is_pinned ? 'Sabiti Kaldır' : 'Sabitle'}
              </button>
              <button onClick={handleLock} className="btn btn-secondary btn-sm" title={topic.is_locked ? 'Kilidi kaldır' : 'Kilitle'}>
                <Lock size={13} /> {topic.is_locked ? 'Kilidi Kaldır' : 'Kilitle'}
              </button>
            </div>
          )}
        </div>

        <PostMeta name={topic.author_name} role={topic.author_role} date={formatDate(topic.created_at)} />

        <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text)', marginTop: 16 }}>
          {topic.content}
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, paddingLeft: 4 }}>
            {replies.length} Yanıt
          </div>
          {replies.map(reply => (
            <div key={reply.id} className="card" style={{ padding: 20, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <PostMeta name={reply.author_name} role={reply.author_role} date={formatDate(reply.created_at)} />
                {user && (user.id === reply.author_name || user.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 4 }}
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginTop: 12, color: 'var(--text)' }}>
                {reply.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      {user && !topic.is_locked && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Yanıt Yaz</h3>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Yanıtınızı yazın..."
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            style={{ resize: 'vertical', marginBottom: 12 }}
          />
          <button onClick={handleReply} className="btn btn-primary btn-sm" disabled={submitting || !replyContent.trim()}>
            {submitting ? <span className="spinner" /> : 'Yanıtı Gönder'}
          </button>
        </div>
      )}

      {!user && (
        <div style={{ textAlign: 'center', padding: 20, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', fontSize: 14, color: 'var(--text-muted)' }}>
          Yanıtlamak için <Link to="/login">giriş yapın</Link>.
        </div>
      )}
    </div>
  );
}

function PostMeta({ name, role, date }: { name?: string; role?: string; date: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
          {name?.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          {name}
          {role === 'admin' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, color: 'var(--primary)', background: 'var(--primary-light)', padding: '1px 6px', borderRadius: 10 }}>
              <Shield size={9} /> Admin
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date}</div>
      </div>
    </div>
  );
}
