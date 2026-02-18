import { useState, useEffect } from 'react';
import { practiceApi, modulesApi } from '../../services/api';
import { PracticeQuestion, Module } from '../../types';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminPractice() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    module_id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '',
    correct_answer: 'A', explanation: '', difficulty: 'medium'
  });

  const load = () => {
    practiceApi.getAll().then(r => setQuestions(r.data.questions)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    modulesApi.getAll().then(r => setModules(r.data.modules));
  }, []);

  const handleSave = async () => {
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      toast.error('Tüm alanları doldurun'); return;
    }
    setSaving(true);
    try {
      await practiceApi.create({ ...form, module_id: form.module_id || undefined });
      toast.success('Soru eklendi');
      setShowForm(false);
      setForm({ module_id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A', explanation: '', difficulty: 'medium' });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Hata');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Soruyu silmek istiyor musunuz?')) return;
    try {
      await practiceApi.delete(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Soru silindi');
    } catch { toast.error('Silinemedi'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Çalışma Soruları</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Öğrencilere pratik sorular ekleyin</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
          <Plus size={14} /> Soru Ekle
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Yeni Soru</h3>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label>İlgili Modül (opsiyonel)</label>
              <select className="form-control" value={form.module_id} onChange={e => setForm(p => ({ ...p, module_id: e.target.value }))}>
                <option value="">Genel</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Zorluk</label>
              <select className="form-control" value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}>
                <option value="easy">Kolay</option>
                <option value="medium">Orta</option>
                <option value="hard">Zor</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Soru Metni *</label>
            <textarea className="form-control" rows={2} value={form.question_text} onChange={e => setForm(p => ({ ...p, question_text: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            {(['a', 'b', 'c', 'd'] as const).map(opt => (
              <div className="form-group" key={opt}>
                <label>Seçenek {opt.toUpperCase()} *</label>
                <input className="form-control" value={form[`option_${opt}` as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [`option_${opt}`]: e.target.value }))} />
              </div>
            ))}
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            <div className="form-group">
              <label>Doğru Cevap *</label>
              <select className="form-control" value={form.correct_answer} onChange={e => setForm(p => ({ ...p, correct_answer: e.target.value }))}>
                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
              </select>
            </div>
            <div className="form-group">
              <label>Açıklama</label>
              <input className="form-control" value={form.explanation} onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))} placeholder="Neden bu cevap?" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Kaydet'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">İptal</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Soru</th><th>Modül</th><th>Zorluk</th><th>Doğru Cevap</th><th>İşlem</th></tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Henüz soru eklenmemiş</td></tr>
              ) : questions.map(q => (
                <tr key={q.id}>
                  <td style={{ fontSize: 13, maxWidth: 320 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question_text}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.module_title || '—'}</td>
                  <td>
                    <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                      {q.difficulty === 'easy' ? 'Kolay' : q.difficulty === 'hard' ? 'Zor' : 'Orta'}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{q.correct_answer}</td>
                  <td>
                    <button onClick={() => handleDelete(q.id)} className="btn btn-danger btn-sm" title="Sil"><Trash2 size={12} /></button>
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
