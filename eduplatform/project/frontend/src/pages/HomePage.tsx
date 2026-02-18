import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Award, Smartphone, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a56db 0%, #0ea5e9 100%)',
        color: 'white',
        padding: '72px 0'
      }}>
        <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Öğrenmeyi kolaylaştıran<br />eğitim platformu
          </h1>
          <p style={{ fontSize: 17, opacity: 0.9, marginBottom: 32, lineHeight: 1.7 }}>
            Eğitim modüllerine erişin, sınavlara girin, rozetler kazanın ve öğrenci topluluğuyla bağlantıda kalın.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/modules" style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '12px 28px',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}>
              Modülleri İncele <ArrowRight size={16} />
            </Link>
            {!user && (
              <Link to="/register" style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                padding: '12px 28px',
                borderRadius: 'var(--radius)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                Kayıt Ol
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
            Platform Özellikleri
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 40, fontSize: 15 }}>
            Öğrenme deneyiminizi zenginleştiren araçlar
          </p>

          <div className="grid-4" style={{ gap: 16 }}>
            <FeatureCard
              icon={<BookOpen size={22} color="var(--primary)" />}
              title="Eğitim Modülleri"
              description="PDF, video ve görsel içerikli kapsamlı eğitim modüllerine erişin ve indirin."
              link="/modules"
            />
            <FeatureCard
              icon={<Award size={22} color="#d97706" />}
              title="Sınav & Rozetler"
              description="Sınava girin, tüm soruları doğru yanıtlayarak modül rozeti kazanın."
              link="/modules"
            />
            <FeatureCard
              icon={<MessageSquare size={22} color="#16a34a" />}
              title="Forum"
              description="Diğer öğrencilerle tartışın, soru sorun ve deneyimlerinizi paylaşın."
              link="/forum"
            />
            <FeatureCard
              icon={<Smartphone size={22} color="#0ea5e9" />}
              title="Mobil Uygulama"
              description="Modül görsellerini 3D'ye dönüştüren özel mobil uygulamamızı indirin."
              link="/mobil-uygulama"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ background: 'var(--primary-light)', padding: '48px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Hemen başlayın</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15 }}>
              Ücretsiz hesap oluşturun ve tüm içeriklere erişin.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function FeatureCard({ icon, title, description, link }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ padding: 24, height: '100%', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius)',
          background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>{title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</p>
      </div>
    </Link>
  );
}
