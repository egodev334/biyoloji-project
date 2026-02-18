import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Kayıt başarılı, hoş geldiniz!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BookOpen size={28} color="var(--primary)" />
            <span style={{ fontSize: 22, fontWeight: 700 }}>EduPlatform</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Hesap Oluşturun</h1>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Ad Soyad</label>
              <input
                className="form-control"
                type="text"
                placeholder="Adınız Soyadınız"
                {...register('name', {
                  required: 'Ad soyad zorunlu',
                  minLength: { value: 2, message: 'En az 2 karakter' }
                })}
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label>E-posta</label>
              <input
                className="form-control"
                type="email"
                placeholder="ornek@mail.com"
                {...register('email', {
                  required: 'E-posta zorunlu',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Geçerli bir e-posta girin' }
                })}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label>Şifre</label>
              <input
                className="form-control"
                type="password"
                placeholder="En az 8 karakter"
                {...register('password', {
                  required: 'Şifre zorunlu',
                  minLength: { value: 8, message: 'Şifre en az 8 karakter olmalı' }
                })}
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label>Şifre Tekrar</label>
              <input
                className="form-control"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                {...register('confirmPassword', {
                  required: 'Şifre tekrarı zorunlu',
                  validate: val => val === password || 'Şifreler eşleşmiyor'
                })}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? <span className="spinner" /> : 'Kayıt Ol'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
        </p>
      </div>
    </div>
  );
}
