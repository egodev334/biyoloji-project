import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { BookOpen } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Giriş başarılı');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <BookOpen size={28} color="var(--primary)" />
            <span style={{ fontSize: 22, fontWeight: 700 }}>EduPlatform</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Hesabınıza Giriş Yapın</h1>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                placeholder="••••••••"
                {...register('password', { required: 'Şifre zorunlu' })}
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            >
              {loading ? <span className="spinner" /> : 'Giriş Yap'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
        </p>
      </div>
    </div>
  );
}
