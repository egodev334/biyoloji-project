import { useState, useEffect } from 'react';
import { modulesApi, examsApi } from '../../services/api';
import { Module, Exam, Question } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export default function AdminExams() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  // New exam form
  const [newExam, setNewExam] = useState({ title: '', description: '', duration_minutes: 30, pass_score: 70 });
  const [showExamForm, setShowExamForm] = useState(false);

  // New question form
  const [newQ, setNewQ] = useState({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });
  const [showQForm, setShowQForm] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [savingQ, setSavingQ] = useState(false);

  useEffect(() => {
    modulesApi.getAll().then(r => setModules(r.data.modules));
  }, []);

  const loadExams = async (moduleId: string) => {
    setSelectedModule(moduleId);
    setSelectedExam('');
    setQuestions([]);
    setExams([]);
    if (!moduleId) return;

    setLoading(true);
    try {
      const r = await modulesApi.getById(moduleId);
      setExams(r.data.exams);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (examId: string) => {
    setSelectedExam(examId);
    if (!examId) { setQuestions([]); return; }
    const r = await examsApi.getQuestions(examId);
    setQuestions(r.data.questions);
  };

  const handleCreateExam = async () => {
    if (!selectedModule || !newExam.title) { toast.error('Modül ve başlık zorunlu'); return; }
    setSavingExam(true);
    try {
      await examsApi.create({ module_id: selectedModule, ...newExam });
      toast.success('Sınav oluşturuldu');
      setShowExamForm(false);
      setNewExam({ title: '', description: '', duration_minutes: 30, pass_score: 70 });
      loadExams(selectedModule);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Hata');
    } finally {
      setSavingExam(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedExam) return;
    if (!newQ.question_text || !newQ.option_a || !newQ.option_b || !newQ.option_c || !newQ.option_d) {
      toast.error('Tüm alanlar zorunlu'); return;
    }
    setSavingQ(true);
    try {
      await examsApi.addQuestion(selectedExam, { ...newQ, order_index: questions.length });
      toast.success('Soru eklendi');
      setShowQForm(false);
      setNewQ({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '' });
      loadQuestions(selectedExam);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Soru eklenemedi');
    } finally {
      setSavingQ(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm('Soruyu silmek istiyor musunuz?')) return;
    try {
      await examsApi.deleteQuestion(qId);
      setQuestions(prev => prev.filter(q => q.id !== qId));
      toast.success('Soru silindi');
    } catch { toast.error('Silinemedi'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Sınav Yönetimi</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left sidebar: Module & Exam selection */}
        <div>
          <div className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Modül Seç</div>
            {modules.map(m => (
              <button key={m.id} onClick={() => loadExams(m.id)} style={{
                display: 'block', width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)',
                background: selectedModule === m.id ? 'var(--primary-light)' : 'none',
                color: selectedModule === m.id ? 'var(--primary)' : 'var(--text)',
                border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: selectedModule === m.id ? 600 : 400,
                marginBottom: 2
              }}>
                {m.title}
              </button>
            ))}
          </div>

          {selectedModule && exams.length > 0 && (
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sınavlar</div>
              {exams.map(e => (
                <button key={e.id} onClick={() => loadQuestions(e.id)} style={{
                  display: 'block', width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)',
                  background: selectedExam === e.id ? 'var(--primary-light)' : 'none',
                  color: selectedExam === e.id ? 'var(--primary)' : 'var(--text)',
                  border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: selectedExam === e.id ? 600 : 400,
                  marginBottom: 2
                }}>
                  {e.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div>
          {!selectedModule ? (
            <div className="empty-state"><h3>Soldan bir modül seçin</h3></div>
          ) : (
            <>
              {/* Exam creation */}
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showExamForm ? 16 : 0 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Sınavlar ({exams.length})</h2>
                  <button onClick={() => setShowExamForm(!showExamForm)} className="btn btn-primary btn-sm">
                    <Plus size={13} /> Sınav Ekle
                  </button>
                </div>

                {showExamForm && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div className="grid-2" style={{ gap: 12 }}>
                      <div className="form-group">
                        <label>Sınav Başlığı *</label>
                        <input className="form-control" value={newExam.title} onChange={e => setNewExam(p => ({ ...p, title: e.target.value }))} placeholder="Sınav adı" />
                      </div>
                      <div className="form-group">
                        <label>Açıklama</label>
                        <input className="form-control" value={newExam.description} onChange={e => setNewExam(p => ({ ...p, description: e.target.value }))} placeholder="Opsiyonel" />
                      </div>
                      <div className="form-group">
                        <label>Süre (dakika)</label>
                        <input className="form-control" type="number" value={newExam.duration_minutes} onChange={e => setNewExam(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 30 }))} />
                      </div>
                      <div className="form-group">
                        <label>Geçme Puanı (%)</label>
                        <input className="form-control" type="number" value={newExam.pass_score} onChange={e => setNewExam(p => ({ ...p, pass_score: parseInt(e.target.value) || 70 }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={handleCreateExam} className="btn btn-primary btn-sm" disabled={savingExam}>
                        {savingExam ? <span className="spinner" /> : 'Sınav Oluştur'}
                      </button>
                      <button onClick={() => setShowExamForm(false)} className="btn btn-secondary btn-sm">İptal</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions */}
              {selectedExam && (
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700 }}>Sorular ({questions.length})</h2>
                    <button onClick={() => setShowQForm(!showQForm)} className="btn btn-primary btn-sm">
                      <Plus size={13} /> Soru Ekle
                    </button>
                  </div>

                  {showQForm && (
                    <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 'var(--radius)', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Yeni Soru</h3>
                      <div className="form-group">
                        <label>Soru Metni *</label>
                        <textarea className="form-control" rows={2} value={newQ.question_text} onChange={e => setNewQ(p => ({ ...p, question_text: e.target.value }))} placeholder="Soru..." style={{ resize: 'vertical' }} />
                      </div>
                      <div className="grid-2" style={{ gap: 10 }}>
                        {(['a', 'b', 'c', 'd'] as const).map(opt => (
                          <div className="form-group" key={opt}>
                            <label>Seçenek {opt.toUpperCase()} *</label>
                            <input className="form-control" value={newQ[`option_${opt}` as keyof typeof newQ]} onChange={e => setNewQ(p => ({ ...p, [`option_${opt}`]: e.target.value }))} placeholder={`Seçenek ${opt.toUpperCase()}`} />
                          </div>
                        ))}
                      </div>
                      <div className="grid-2" style={{ gap: 10 }}>
                        <div className="form-group">
                          <label>Doğru Cevap *</label>
                          <select className="form-control" value={newQ.correct_answer} onChange={e => setNewQ(p => ({ ...p, correct_answer: e.target.value }))}>
                            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Açıklama (opsiyonel)</label>
                          <input className="form-control" value={newQ.explanation} onChange={e => setNewQ(p => ({ ...p, explanation: e.target.value }))} placeholder="Neden bu cevap?" />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={handleAddQuestion} className="btn btn-primary btn-sm" disabled={savingQ}>
                          {savingQ ? <span className="spinner" /> : 'Soruyu Kaydet'}
                        </button>
                        <button onClick={() => setShowQForm(false)} className="btn btn-secondary btn-sm">İptal</button>
                      </div>
                    </div>
                  )}

                  {questions.length === 0 ? (
                    <div className="empty-state" style={{ padding: 32 }}><h3>Henüz soru eklenmemiş</h3></div>
                  ) : questions.map((q, i) => (
                    <div key={q.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Soru {i + 1}</div>
                          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{q.question_text}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                            {(['A', 'B', 'C', 'D'] as const).map(opt => (
                              <span key={opt} style={{
                                padding: '3px 10px', borderRadius: 12,
                                background: opt === q.correct_answer ? '#dcfce7' : 'var(--bg)',
                                color: opt === q.correct_answer ? 'var(--success)' : 'var(--text-muted)',
                                fontWeight: opt === q.correct_answer ? 600 : 400,
                                border: opt === q.correct_answer ? '1px solid var(--success)' : '1px solid var(--border)'
                              }}>
                                {opt}: {q[`option_${opt.toLowerCase()}` as keyof Question] as string}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 4 }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
