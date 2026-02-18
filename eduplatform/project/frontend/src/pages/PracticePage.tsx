import { useState, useEffect } from 'react';
import { practiceApi } from '../services/api';
import { PracticeQuestion } from '../types';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';

export default function PracticePage() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    practiceApi.getAll()
      .then(r => setQuestions(r.data.questions))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = (qId: string, opt: string) => {
    if (revealed[qId]) return;
    setAnswers(prev => ({ ...prev, [qId]: opt }));
  };

  const handleReveal = (qId: string) => {
    setRevealed(prev => ({ ...prev, [qId]: true }));
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 820 }}>
      <div className="page-header">
        <h1 className="page-title">Çalışma Soruları</h1>
        <p className="page-subtitle">Bilgilerinizi pekiştirin — cevapları görmek için soruyu yanıtlayın</p>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={36} color="var(--text-light)" style={{ marginBottom: 10 }} />
          <h3>Henüz çalışma sorusu eklenmemiş</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isRevealed = revealed[q.id];
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <div key={q.id} className="card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Soru {idx + 1} {q.module_title && `· ${q.module_title}`}
                    </span>
                    <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.6 }}>{q.question_text}</p>
                  </div>
                  <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`} style={{ flexShrink: 0, marginLeft: 12 }}>
                    {q.difficulty === 'easy' ? 'Kolay' : q.difficulty === 'hard' ? 'Zor' : 'Orta'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {(['A', 'B', 'C', 'D'] as const).map(opt => {
                    const text = q[`option_${opt.toLowerCase()}` as keyof PracticeQuestion] as string;
                    const isSelected = userAnswer === opt;
                    const isAnswerCorrect = opt === q.correct_answer;

                    let bg = 'white';
                    let border = 'var(--border)';
                    let color = 'var(--text)';

                    if (isRevealed) {
                      if (isAnswerCorrect) { bg = '#f0fdf4'; border = 'var(--success)'; color = 'var(--success)'; }
                      else if (isSelected && !isAnswerCorrect) { bg = '#fef2f2'; border = 'var(--danger)'; color = 'var(--danger)'; }
                    } else if (isSelected) {
                      bg = 'var(--primary-light)'; border = 'var(--primary)';
                    }

                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(q.id, opt)}
                        disabled={isRevealed}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          border: `2px solid ${border}`, borderRadius: 'var(--radius)',
                          background: bg, cursor: isRevealed ? 'default' : 'pointer', textAlign: 'left'
                        }}
                      >
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: isRevealed && isAnswerCorrect ? 'var(--success)' : isSelected ? 'var(--primary)' : 'var(--bg)',
                          color: (isSelected || (isRevealed && isAnswerCorrect)) ? 'white' : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700
                        }}>{opt}</span>
                        <span style={{ fontSize: 13, color }}>{text}</span>
                        {isRevealed && isAnswerCorrect && <CheckCircle size={15} color="var(--success)" style={{ marginLeft: 'auto' }} />}
                        {isRevealed && isSelected && !isAnswerCorrect && <XCircle size={15} color="var(--danger)" style={{ marginLeft: 'auto' }} />}
                      </button>
                    );
                  })}
                </div>

                {userAnswer && !isRevealed && (
                  <button onClick={() => handleReveal(q.id)} className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
                    Cevabı Göster
                  </button>
                )}

                {isRevealed && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13,
                      background: isCorrect ? '#f0fdf4' : '#fef2f2',
                      color: isCorrect ? 'var(--success)' : 'var(--danger)',
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6
                    }}>
                      {isCorrect ? <CheckCircle size={15} /> : <XCircle size={15} />}
                      {isCorrect ? 'Doğru cevap!' : `Yanlış. Doğru cevap: ${q.correct_answer}`}
                    </div>
                    {q.explanation && (
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, padding: '8px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                        <strong>Açıklama:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
