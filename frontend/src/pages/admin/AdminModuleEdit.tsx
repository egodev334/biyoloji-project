import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modulesApi } from '../../services/api';
import { ModuleFile } from '../../types';
import toast from 'react-hot-toast';
import { Upload, Trash2, ArrowLeft, FileText, Video, Image } from 'lucide-react';

export default function AdminModuleEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    title: '', description: '', content: '', category: '',
    order_index: 0, is_published: false
  });
  const [files, setFiles] = useState<ModuleFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew && id) {
      modulesApi.getById(id).then(r => {
        const m = r.data.module;
        setForm({
          title: m.title, description: m.description || '', content: m.content || '',
          category: m.category || '', order_index: m.order_index, is_published: m.is_published
        });
        setFiles(r.data.files);
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Başlık zorunlu'); return; }
    setSaving(true);
    try {
      if (isNew) {
        const r = await modulesApi.create(form as any);
        toast.success('Modül oluşturuldu');
        navigate(`/admin/modules/${r.data.module.id}/edit`);
      } else {
        await modulesApi.update(id!, form);
        toast.success('Modül güncellendi');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'İşlem başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const r = await modulesApi.uploadFile(id, formData);
      setFiles(prev => [...prev, r.data.file]);
      toast.success('Dosya yüklendi');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Dosya yüklenemedi');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!id || !confirm('Dosyayı silmek istiyor musunuz?')) return;
    try {
      await modulesApi.deleteFile(id, fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('Dosya silindi');
    } catch { toast.error('Dosya silinemedi'); }
  };

  const fileIcons: Record<string, React.ReactNode> = {
    pdf: <FileText size={15} color="var(--danger)" />,
    video: <Video size={15} color="var(--primary)" />,
    image: <Image size={15} color="#16a34a" />,
    document: <FileText size={15} color="var(--warning)" />,
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/admin/modules')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={13} />
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{isNew ? 'Yeni Modül' : 'Modül Düzenle'}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>
        {/* Left: Form */}
        <div className="card" style={{ padding: 24 }}>
          <div className="form-group">
            <label>Başlık *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Modül başlığı" />
          </div>

          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label>Kategori</label>
              <input className="form-control" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="ör. Matematik" />
            </div>
            <div className="form-group">
              <label>Sıra</label>
              <input className="form-control" type="number" value={form.order_index} onChange={e => setForm(p => ({ ...p, order_index: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>

          <div className="form-group">
            <label>Kısa Açıklama</label>
            <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Modül hakkında kısa açıklama" style={{ resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label>İçerik</label>
            <textarea className="form-control" rows={8} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Detaylı modül içeriği..." style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input type="checkbox" id="published" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} style={{ width: 16, height: 16 }} />
            <label htmlFor="published" style={{ fontSize: 14, cursor: 'pointer', userSelect: 'none' }}>Yayınla (öğrenciler görebilsin)</label>
          </div>

          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : isNew ? 'Modülü Oluştur' : 'Değişiklikleri Kaydet'}
          </button>
        </div>

        {/* Right: Files */}
        <div>
          {!isNew && (
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Dosyalar</h2>

              {files.map(file => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  {fileIcons[file.file_type]}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.original_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatSize(file.file_size)}</div>
                  </div>
                  <button onClick={() => handleDeleteFile(file.id)} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 4 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              <div style={{ marginTop: 16 }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                  cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', justifyContent: 'center',
                  transition: 'border-color 0.2s'
                }}>
                  {uploading ? <><span className="spinner" /> Yükleniyor...</> : <><Upload size={14} /> Dosya Yükle (PDF, Video, Görsel)</>}
                  <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} accept=".pdf,.mp4,.webm,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx" />
                </label>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>Maks. 100 MB</p>
              </div>
            </div>
          )}

          {isNew && (
            <div className="card" style={{ padding: 20, background: 'var(--bg)', border: '1px dashed var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                Modülü oluşturduktan sonra dosya yükleyebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
