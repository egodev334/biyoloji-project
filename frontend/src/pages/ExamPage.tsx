import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examsApi } from '../services/api';
import { Exam, Question } from '../types';
import toast from 'react-hot-toast';
import { Clock, Award, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

type ExamState = 'loading' | 'ready' | 'active' | 'submitted';

interface ExamResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  isPerfect: boolean;
  passed: boolean;
  badgeAwarded: { name: string; description: string } | null;
  answers: Array<{ questionId: string; selected: string | null; isCorrect: boolean; correctAnswer: string }>;
}

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [examState, setExamState] = useState<ExamState>('loading');
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!id) return;
    examsApi.getById(id)
      .then(r => {
        setExam(r.data.exam);
        setQuestions(r.data.questions);
        setTimeLeft(r.data.exam.duration_minutes * 60);
        setExamState('ready');
      })
      .catch(err => {
        toast.error(err.response?.data?.error || 'Sınav yüklenemedi');
        navigate(-1);
      });
  }, [id]);

  const handleSubmit = useCallback(async () => {
    if (!id || submitting) return;
    setSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const response = await examsApi.submit(id, { answers, timeTaken });
      setResult(response.data);
      setExamState('submitted');

      if (response.data.isPerfect) {
        toast.success('Mükemmel! Tüm soruları doğru yanıtladınız!', { duration: 5000 });
      } else if (response.data.passed) {
        toast.success('Tebrikler! Sınavı geçtiniz!');
      } else {
        toast.error('Sınavı geçemediniz. Tekrar deneyebilirsiniz.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Sınav gönderilemedi');
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, submitting]);

  useEffect(() => {
    if (examState === 'active') {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examState, handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const answeredCount = Object.keys(answers).length;

  if (examState === 'loading') return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (examState === 'submitted' && result) {
    return (
      <div className="container" style={{ padding: '48px 24px', maxWidth: 700 }}>
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          {result.isPerfect ? (
            <>
              <Award size={56} color="#d97706" style={{ marginBottom: 16 }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d97706', marginBottom: 8 }}>Mükemmel Sonuç!</h1>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Tüm soruları doğru yanıtladınız.</p>
              {result.badgeAwarded && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24 }}>
                  <Award size={28} color="#d97706" style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 16 }}>Rozet Kazandınız!</div>
                  <div style={{ color: '#92400e', fontSize: 14, marginTop: 4 }}>{result.badgeAwarded.name}</div>
                </div>
              )}
            </>
          ) : result.passed ? (
            <>
              <CheckCircle size={56} color="var(--success)" style={{ marginBottom: 16 }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)', marginBottom: 8 }}>Geçtiniz!</h1>
            </>
          ) : (
            <>
              <XCircle size={56} color="var(--danger)" style={{ marginBottom: 16 }} />
              <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>Başarısız</h1>
            </>
          )}

          {/* Score */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)' }}>{result.score}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Puan</div>
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{result.correctCount}/{result.totalQuestions}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Doğru Cevap</div>
            </div>
          </div>

          {/* Answer review */}
          <div style={{ textAlign: 'left', marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Cevap Özeti</h3>
            {result.answers.map((a, i) => (
              <div key={a.questionId} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                background: a.isCorrect ? '#f0fdf4' : '#fef2f2', borderRadius: 'var(--radius)',
                marginBottom: 6, fontSize: 13
              }}>
                {a.isCorrect ? <CheckCircle size={15} color="var(--success)" /> : <XCircle size={15} color="var(--danger)" />}
                <span>Soru {i + 1}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {a.selected ? `Yanıtınız: ${a.selected}` : 'Yanıtlanmadı'} → Doğru: {a.correctAnswer}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">Geri Dön</button>
            <button onClick={() => window.location.reload()} className="btn btn-primary">Tekrar Dene</button>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'ready') {
    return (
      <div className="container" style={{ padding: '48px 24px', maxWidth: 600 }}>
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <Award size={44} color="var(--primary)" style={{ marginBottom: 16 }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{exam?.title}</h1>
          {exam?.description && <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{exam.description}</p>}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{questions.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Soru</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{exam?.duration_minutes}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dakika</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>%{exam?.pass_score}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Geçme Puanı</div>
            </div>
          </div>

          <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 24, fontSize: 13, color: 'var(--primary)', textAlign: 'left' }}>
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
            Tüm soruları doğru yanıtlarsanız modül rozeti kazanırsınız. Süre dolduğunda sınav otomatik gönderilir.
          </div>

          <button onClick={() => setExamState('active')} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
            Sınava Başla
          </button>
        </div>
      </div>
    );
  }

  // Active exam
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, background: 'white',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '14px 20px', marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{exam?.title}</div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)' }}>{answeredCount}/{questions.length} yanıtlandı</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700,
            color: timeLeft < 60 ? 'var(--danger)' : 'var(--text)',
            fontSize: 16
          }}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, idx) => (
        <div key={q.id} className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Soru {idx + 1}</div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, lineHeight: 1.6 }}>{q.question_text}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(['A', 'B', 'C', 'D'] as const).map(opt => {
              const text = q[`option_${opt.toLowerCase()}` as keyof Question] as string;
              const selected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                    border: `2px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)', background: selected ? 'var(--primary-light)' : 'white',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: selected ? 'var(--primary)' : 'var(--bg)',
                    color: selected ? 'white' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700
                  }}>{opt}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text)' }}>{text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit */}
      <div style={{ position: 'sticky', bottom: 16 }}>
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-lg"
          disabled={submitting}
          style={{ width: '100%', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}
        >
          {submitting ? <span className="spinner" /> : `Sınavı Tamamla (${answeredCount}/${questions.length} yanıtlandı)`}
        </button>
      </div>
    </div>
  );
}
