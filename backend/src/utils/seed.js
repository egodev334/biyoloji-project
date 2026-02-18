/**
 * Seed scripti: İlk admin kullanıcısını oluşturur
 * Kullanım: node src/utils/seed.js
 */

const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

async function seed() {
  console.log('Seed işlemi başlıyor...');

  try {
    // Check if admin exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@eduplatform.com'"
    );

    if (existing.rows.length > 0) {
      console.log('Admin kullanıcısı zaten mevcut: admin@eduplatform.com');
    } else {
      const hash = await bcrypt.hash('Admin123!', 10);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin@eduplatform.com', $1, 'admin')`,
        [hash]
      );
      console.log('✓ Admin oluşturuldu: admin@eduplatform.com / Admin123!');
    }

    // Sample module
    const modCheck = await pool.query('SELECT id FROM modules LIMIT 1');
    if (modCheck.rows.length === 0) {
      const adminResult = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      const adminId = adminResult.rows[0].id;

      const mod = await pool.query(
        `INSERT INTO modules (title, description, content, category, order_index, is_published, created_by)
         VALUES ('Giriş Modülü', 'Platform kullanımı hakkında temel bilgiler', 'Platforma hoş geldiniz. Bu modülde sistemi nasıl kullanacağınızı öğreneceksiniz.', 'Genel', 1, TRUE, $1)
         RETURNING id`,
        [adminId]
      );
      const moduleId = mod.rows[0].id;
      console.log('✓ Örnek modül oluşturuldu');

      // Sample exam
      const exam = await pool.query(
        `INSERT INTO exams (module_id, title, description, duration_minutes, pass_score)
         VALUES ($1, 'Giriş Sınavı', 'Platform temel bilgilerini test eder', 10, 70)
         RETURNING id`,
        [moduleId]
      );
      const examId = exam.rows[0].id;

      // Sample questions
      await pool.query(
        `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index)
         VALUES ($1, 'EduPlatform ne tür bir platformdur?', 'Oyun platformu', 'Eğitim platformu', 'Alışveriş platformu', 'Sosyal medya', 'B', 1)`,
        [examId]
      );
      await pool.query(
        `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_index)
         VALUES ($1, 'Modüllere nereden erişilir?', 'Profil sayfasından', 'Admin panelinden', 'Modüller sayfasından', 'Forum''dan', 'C', 2)`,
        [examId]
      );
      console.log('✓ Örnek sınav ve sorular oluşturuldu');
    }

    console.log('\nSeed tamamlandı!');
    console.log('Giriş bilgileri: admin@eduplatform.com / Admin123!');
    console.log('Lütfen şifreyi değiştirin!');
  } catch (error) {
    console.error('Seed hatası:', error.message);
    console.error('Veritabanı bağlantısını ve .env dosyasını kontrol edin');
  } finally {
    await pool.end();
  }
}

seed();
