# EduPlatform - Kurulum Kılavuzu

## Proje Klasör Yapısı

```
eduplatform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL bağlantısı
│   │   ├── controllers/
│   │   │   ├── authController.js    # Giriş/Kayıt
│   │   │   ├── moduleController.js  # Modül yönetimi
│   │   │   ├── examController.js    # Sınav sistemi
│   │   │   ├── forumController.js   # Forum
│   │   │   ├── userController.js    # Profil
│   │   │   ├── adminController.js   # Admin işlemleri
│   │   │   └── practiceController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT doğrulama
│   │   │   └── upload.js           # Dosya yükleme
│   │   ├── routes/                 # API rotaları
│   │   ├── utils/
│   │   │   └── seed.js             # İlk veri oluşturucu
│   │   └── index.js                # Sunucu başlatma
│   ├── uploads/                    # Yüklenen dosyalar
│   ├── database.sql                # Veritabanı şeması
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/Layout.tsx   # Üst menü + layout
    │   │   └── admin/AdminLayout.tsx
    │   ├── pages/                  # Tüm sayfalar
    │   ├── services/api.ts         # API çağrıları
    │   ├── store/authStore.ts      # Kullanıcı durumu
    │   ├── types/index.ts          # TypeScript tipleri
    │   └── App.tsx                 # Router
    ├── index.html
    └── package.json
```

---

## ADIM ADIM KURULUM

### ADIM 1: Gerekli Programları Yükleyin

#### Node.js (v18 veya üzeri)
1. https://nodejs.org adresine gidin
2. "LTS" yazan sürümü indirin
3. İndirilen dosyayı çalıştırın ve "Next" > "Next" > "Install" deyin
4. Kurulum bittikten sonra bilgisayarı yeniden başlatın

Doğrulama: Terminali açın ve şunu yazın:
```bash
node --version   # v18.x.x gibi bir şey görmeli
npm --version    # 9.x.x gibi bir şey görmeli
```

#### PostgreSQL (v14 veya üzeri)
1. https://www.postgresql.org/download adresine gidin
2. İşletim sisteminizi seçin (Windows / macOS / Linux)
3. İndirin ve çalıştırın
4. Kurulum sırasında:
   - Şifre sorarsa: güçlü bir şifre girin (not alın!)
   - Port: 5432 (değiştirmeyin)
   - pgAdmin da seçili bırakın

#### Visual Studio Code
1. https://code.visualstudio.com adresine gidin
2. İndirin ve kurun

---

### ADIM 2: Projeyi Visual Studio Code'da Açın

1. VS Code'u açın
2. `File` > `Open Folder` deyin
3. Proje klasörünü seçin (`eduplatform/` klasörü)
4. VS Code sol altta bir `Terminal` butonu var, ona tıklayın
   veya üst menüden `Terminal` > `New Terminal`

---

### ADIM 3: Veritabanını Oluşturun

PostgreSQL kurulduktan sonra:

**Windows'ta:**
1. Başlat menüsünden `pgAdmin` açın
2. Sol tarafta `Servers` > `PostgreSQL 14` > `Databases`
3. `Databases` üzerine sağ tıklayın > `Create` > `Database`
4. Database name: `eduplatform`
5. `Save` deyin

**Ya da komut satırından (tüm sistemler):**
```bash
psql -U postgres
# Şifrenizi girin
CREATE DATABASE eduplatform;
\q
```

---

### ADIM 4: SQL Şemasını Çalıştırın

1. pgAdmin'de `eduplatform` veritabanına sağ tıklayın
2. `Query Tool` deyin
3. `backend/database.sql` dosyasını açın (VS Code'da içeriğini kopyalayın)
4. pgAdmin'deki Query Tool'a yapıştırın
5. F5'e basın veya üstteki "çalıştır" (▶) butonuna tıklayın
6. Alt kısımda "Query returned successfully" yazmalı

**Komut satırından alternatif:**
```bash
psql -U postgres -d eduplatform -f backend/database.sql
```

---

### ADIM 5: Backend Kurulumu

VS Code terminalinde:

```bash
# Backend klasörüne gir
cd backend

# Gerekli paketleri yükle
npm install

# .env dosyasını oluştur
# Windows:
copy .env.example .env
# macOS/Linux:
cp .env.example .env
```

Şimdi `.env` dosyasını düzenleyin:
1. VS Code'un sol tarafındaki dosya listesinde `backend/.env` dosyasına çift tıklayın
2. Şu değerleri değiştirin:

```env
DB_PASSWORD=PostgreSQL_kurulumunda_girdiginiz_sifre
JWT_SECRET=en_az_32_karakterlik_rastgele_bir_metin_yazin_buraya
```

JWT_SECRET için rastgele güçlü bir metin yazın. Örnek:
`JWT_SECRET=xK9mR2vL5pN8qW1eH4jB7cF3aY6uD0sZ_eduplatform_2024`

---

### ADIM 6: İlk Admin Kullanıcısını Oluşturun

Backend klasöründeyken terminale yazın:
```bash
node src/utils/seed.js
```

Çıktı şunu göstermelidir:
```
✓ PostgreSQL bağlantısı kuruldu
✓ Admin oluşturuldu: admin@eduplatform.com / Admin123!
✓ Örnek modül oluşturuldu
✓ Örnek sınav ve sorular oluşturuldu
Seed tamamlandı!
```

**ÖNEMLİ:** İlk girişten sonra admin şifresini değiştirin!

---

### ADIM 7: Backend Sunucusunu Başlatın

```bash
# Hâlâ backend klasöründeyken:
npm run dev
```

Şunu görmelisiniz:
```
✓ EduPlatform API sunucusu çalışıyor: http://localhost:5000
✓ PostgreSQL bağlantısı kuruldu
```

Bu terminali kapatmayın! Backend çalışmaya devam ediyor.

---

### ADIM 8: Frontend Kurulumu

VS Code'da **yeni bir terminal** açın (+ ikonu veya Terminal > New Terminal):

```bash
# Frontend klasörüne gir
cd frontend

# Gerekli paketleri yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Şunu görmelisiniz:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

### ADIM 9: Platformu Açın

Tarayıcınızda şu adrese gidin:
```
http://localhost:5173
```

Platform açılmış olmalı!

---

### ADIM 10: Admin Paneline Giriş

1. Sağ üstteki "Giriş" butonuna tıklayın
2. E-posta: `admin@eduplatform.com`
3. Şifre: `Admin123!`
4. Giriş yaptıktan sonra üst menüde "Admin" butonu görünür
5. http://localhost:5173/admin adresine gidin

---

## ÇALIŞMA SIRASI

Her oturumda bu sırayla başlatın:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Her ikisi de çalışırken platform hazır.

---

## SIK KARŞILAŞILAN HATALAR

### "Cannot connect to database"
- PostgreSQL servisinin çalıştığından emin olun
- `.env` dosyasındaki DB_PASSWORD doğru mu?
- `eduplatform` veritabanı oluşturuldu mu?

### "Port 5000 already in use"
- Başka bir uygulama 5000 portunu kullanıyor
- `.env` dosyasında `PORT=5001` yapın
- Frontend `vite.config.ts` dosyasındaki proxy'i de güncelleyin

### "npm install" hatası
- Node.js sürümünüzü kontrol edin (`node --version`)
- v18 veya üzeri olmalı

### Dosya yükleme çalışmıyor
- `backend/uploads` klasörünün var olduğundan emin olun
- Klasör yoksa oluşturun: `mkdir -p backend/uploads/modules backend/uploads/avatars`

---

## PRODUCTION'A ALMA (Opsiyonel)

1. Frontend build: `cd frontend && npm run build`
2. Çıktı `frontend/dist` klasörüne gelir
3. Bu klasörü bir web sunucusunda (nginx, Apache) yayınlayın
4. Backend için `pm2` veya benzeri bir process manager kullanın
5. `.env` dosyasında `NODE_ENV=production` yapın

---

## GELİŞTİRİCİ NOTLARI

- Backend API: `http://localhost:5000/api`
- Frontend: `http://localhost:5173`
- Admin Panel: `http://localhost:5173/admin`
- API sağlık kontrolü: `http://localhost:5000/api/health`
- Yüklenen dosyalar: `http://localhost:5000/uploads/...`

JWT token süresi: 7 gün (`.env` dosyasında `JWT_EXPIRES_IN` ile değiştirilebilir)
