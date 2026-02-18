import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersApi } from '../services/api';
import { User, Badge, ExamAttempt } from '../types';
import { Award, BookOpen, FileQuestion, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    usersApi.getProfile(id)
      .then(r => {
        setUser(r.data.user);
        setBadges(r.data.badges);
        setAttempts(r.data.attempts);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!user) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Kullanıcı bulunamadı.</div>;

  const joinDate = new Date(user.created_at!).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 900 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left sidebar */}
        <div>
          <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block', border: '2px solid var(--border)' }} />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 700, color: 'white', margin: '0 auto 14px'
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{user.name}</div>
            {user.role === 'admin' && (
              <span className="badge badge-primary" style={{ marginBottom: 8 }}>Admin</span>
            )}
            {user.bio && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 8 }}>{user.bio}</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              <Calendar size={12} /> {joinDate} tarihinden beri üye
            </div>
          </div>

          {/* Stats */}
          <div className="card" style={{ padding: 16 }}>
            <StatRow icon={<BookOpen size={14} color="var(--primary)" />} label="İzlenen Modül" value={user.modules_viewed || 0} />
            <StatRow icon={<FileQuestion size={14} color="#d97706" />} label="Girilen Sınav" value={user.exam_count || 0} />
            <StatRow icon={<Award size={14} color="#16a34a" />} label="Kazanılan Rozet" value={user.badge_count || 0} />
          </div>
        </div>

        {/* Right content */}
        <div>
          {/* Badges */}
          {badges.length > 0 && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Rozetler</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {badges.map(badge => (
                  <div key={badge.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px', background: '#fef3c7', border: '1px solid #fcd34d',
                    borderRadius: 20, fontSize: 13, fontWeight: 500
                  }} title={badge.description}>
                    <Award size={14} color="#d97706" />
                    {badge.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam History */}
          {attempts.length > 0 && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Sınav Geçmişi</h2>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sınav</th>
                    <th>Modül</th>
                    <th>Puan</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 13, fontWeight: 500 }}>{attempt.exam_title}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{attempt.module_title}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {attempt.correct_answers === attempt.total_questions ? (
                            <CheckCircle size={14} color="var(--success)" />
                          ) : attempt.score >= 70 ? (
                            <CheckCircle size={14} color="#d97706" />
                          ) : (
                            <XCircle size={14} color="var(--danger)" />
                          )}
                          <span style={{ fontSize: 13 }}>%{attempt.score} ({attempt.correct_answers}/{attempt.total_questions})</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(attempt.completed_at).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {badges.length === 0 && attempts.length === 0 && (
            <div className="empty-state">
              <Award size={36} color="var(--text-light)" style={{ marginBottom: 10 }} />
              <h3>Henüz aktivite yok</h3>
              <p style={{ fontSize: 13 }}>Modülleri keşfedin ve sınavlara girerek rozetler kazanın.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 6px', borderBottom: '1px solid var(--border)' }}>
      {icon}
      <span style={{ fontSize: 13, flex: 1, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
