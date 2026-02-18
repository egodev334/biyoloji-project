import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { modulesApi } from '../services/api';
import { Module, ModuleFile, Exam } from '../types';
import { useAuthStore } from '../store/authStore';
import { FileText, Video, Image, Download, Clock, Award, ArrowLeft, BookOpen } from 'lucide-react';

export default function ModuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [module, setModule] = useState<Module | null>(null);
  const [files, setFiles] = useState<ModuleFile[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    modulesApi.getById(id)
      .then(r => {
        setModule(r.data.module);
        setFiles(r.data.files);
        setExams(r.data.exams);
      })
      .catch(err => setError(err.response?.data?.error || 'Modül yüklenemedi'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: '48px 24px', textAlign: 'center' }}>
      <p style={{ color: 'var(--danger)' }}>{error}</p>
      <Link to="/modules" className="btn btn-secondary" style={{ marginTop: 16 }}>
        <ArrowLeft size={14} /> Modüllere Dön
      </Link>
    </div>
  );

  if (!module) return null;

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 900 }}>
      <Link to="/modules" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        <ArrowLeft size={14} /> Modüllere Dön
      </Link>

      {/* Header */}
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <BookOpen size={24} color="var(--primary)" />
          </div>
          <div style={{ flex: 1 }}>
            {module.category && (
              <span className="badge badge-primary" style={{ marginBottom: 8 }}>{module.category}</span>
            )}
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{module.title}</h1>
            {module.description && (
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>{module.description}</p>
            )}
          </div>
        </div>

        {module.content && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>İçerik</h2>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{module.content}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: files.length > 0 ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* Files */}
        {files.length > 0 && (
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Dosyalar</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map(file => (
                <FileItem key={file.id} file={file} canAccess={!!user} />
              ))}
            </div>
            {!user && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, padding: 12, background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                Dosyaları indirmek için <Link to="/login">giriş yapın</Link>.
              </p>
            )}
          </div>
        )}

        {/* Exams */}
        <div>
          {exams.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Sınavlar</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {exams.map(exam => (
                  <ExamCard key={exam.id} exam={exam} canTake={!!user} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileItem({ file, canAccess }: { file: ModuleFile; canAccess: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    pdf: <FileText size={18} color="var(--danger)" />,
    video: <Video size={18} color="var(--primary)" />,
    image: <Image size={18} color="#16a34a" />,
    document: <FileText size={18} color="var(--warning)" />,
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white'
    }}>
      {icons[file.file_type] || <FileText size={18} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.original_name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatSize(file.file_size)}</div>
      </div>
      {canAccess && (
        <a
          href={file.url}
          download={file.original_name}
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          title="İndir"
        >
          <Download size={13} />
        </a>
      )}
    </div>
  );
}

function ExamCard({ exam, canTake }: { exam: Exam; canTake: boolean }) {
  return (
    <div style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Award size={16} color="#d97706" />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{exam.title}</span>
      </div>
      {exam.description && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{exam.description}</p>
      )}
      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} /> {exam.duration_minutes} dk
        </span>
        <span>{exam.question_count || 0} soru</span>
        <span>Geçme: %{exam.pass_score}</span>
      </div>
      {canTake ? (
        <Link to={`/exam/${exam.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          Sınava Gir
        </Link>
      ) : (
        <Link to="/login" className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          Giriş Yaparak Sınava Gir
        </Link>
      )}
    </div>
  );
}
