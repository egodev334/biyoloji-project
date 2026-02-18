import { Smartphone, Download, Cpu, Eye, Layers, Star } from 'lucide-react';

export default function MobileAppPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '72px 0' }}>
        <div className="container" style={{ maxWidth: 800, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <Smartphone size={38} color="white" />
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 14 }}>EduPlatform Mobil Uygulama</h1>
          <p style={{ fontSize: 16, opacity: 0.8, maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Eğitim modülü görsellerini 3D'ye dönüştüren yapay zeka destekli mobil uygulamamızı indirin.
            Öğrenme deneyiminizi bir üst seviyeye taşıyın.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/downloads/eduplatform.apk"
              download
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: '#16a34a', color: 'white', padding: '14px 28px',
                borderRadius: 'var(--radius)', fontWeight: 700, fontSize: 15, textDecoration: 'none'
              }}
            >
              <Download size={18} /> Android APK İndir
            </a>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
              padding: '14px 24px', borderRadius: 'var(--radius)', fontSize: 14,
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <Smartphone size={15} /> iOS - Yakında
            </div>
          </div>

          <p style={{ marginTop: 16, fontSize: 12, opacity: 0.5 }}>
            v1.0.0 · Android 8.0+ · APK boyutu ~24 MB
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 0' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Uygulama Özellikleri</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 15 }}>
            Gelişmiş teknoloji ile öğrenme deneyimi
          </p>

          <div className="grid-3">
            <AppFeature
              icon={<Cpu size={22} color="var(--primary)" />}
              title="Yapay Zeka Destekli"
              description="Eğitim görsellerini gerçek zamanlı olarak 3 boyutlu modellere dönüştüren AI teknolojisi."
            />
            <AppFeature
              icon={<Eye size={22} color="#d97706" />}
              title="3D Görselleştirme"
              description="Karmaşık kavramları 3D modellerle keşfedin, döndürün ve her açıdan inceleyin."
            />
            <AppFeature
              icon={<Layers size={22} color="#16a34a" />}
              title="Artırılmış Gerçeklik"
              description="AR teknolojisi ile 3D modelleri gerçek dünyaya yansıtın."
            />
            <AppFeature
              icon={<Download size={22} color="#0ea5e9" />}
              title="Çevrimdışı Erişim"
              description="Modülleri indirin, internet bağlantısı olmadan erişin."
            />
            <AppFeature
              icon={<Star size={22} color="#d97706" />}
              title="Platform Entegrasyonu"
              description="Hesabınıza bağlanın, sınav puanlarınızı ve rozetlerinizi takip edin."
            />
            <AppFeature
              icon={<Smartphone size={22} color="#8b5cf6" />}
              title="Hafif ve Hızlı"
              description="Optimize edilmiş performans ile pil tüketimini minimumda tutar."
            />
          </div>
        </div>
      </section>

      {/* Installation */}
      <section style={{ background: 'var(--bg)', padding: '64px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 36 }}>Kurulum Adımları</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { num: 1, title: 'APK\'yı İndirin', desc: 'Yukarıdaki "Android APK İndir" butonuna tıklayın ve dosyanın indirilmesini bekleyin.' },
              { num: 2, title: 'Bilinmeyen Kaynaklara İzin Verin', desc: 'Android Ayarları > Güvenlik bölümünden "Bilinmeyen Kaynaklardan Yükle" seçeneğini aktifleştirin.' },
              { num: 3, title: 'APK Dosyasını Açın', desc: 'İndirdiğiniz APK dosyasını dosya yöneticinizden bulup açın ve yükleme talimatlarını izleyin.' },
              { num: 4, title: 'Giriş Yapın', desc: 'Uygulamayı açın ve platform hesabınızla giriş yapın. Tüm modüllerinize ve ilerlemenize anında erişin.' },
            ].map(step => (
              <div key={step.num} style={{ display: 'flex', gap: 16, paddingBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 15, flexShrink: 0
                  }}>{step.num}</div>
                  {step.num < 4 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '6px 0' }} />}
                </div>
                <div style={{ paddingTop: 6, paddingBottom: 24 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <a
              href="/downloads/eduplatform.apk"
              download
              className="btn btn-primary btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              <Download size={18} /> APK'yı İndir - Ücretsiz
            </a>
          </div>
        </div>
      </section>

      {/* System requirements */}
      <section style={{ padding: '40px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Sistem Gereksinimleri</h2>
          <div className="grid-2">
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Minimum</div>
              {[
                'Android 8.0 (Oreo)',
                '2 GB RAM',
                '200 MB boş alan',
                'OpenGL ES 3.0 desteği'
              ].map(req => (
                <div key={req} style={{ fontSize: 13, color: 'var(--text-muted)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>{req}</div>
              ))}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Önerilen</div>
              {[
                'Android 11+',
                '4 GB RAM',
                '500 MB boş alan',
                'AR Core destekli cihaz'
              ].map(req => (
                <div key={req} style={{ fontSize: 13, color: 'var(--text-muted)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>{req}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AppFeature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
