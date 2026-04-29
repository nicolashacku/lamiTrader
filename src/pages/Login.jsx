import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-accent border-2 border-paper flex items-center justify-center">
              <span className="font-display text-paper text-2xl">P</span>
            </div>
          </div>
          <h1 className="font-display text-7xl text-paper tracking-widest leading-none mt-8">
            PANINI<br />
            <span className="text-accent">UNI</span><br />
            EXCHANGE
          </h1>
        </div>
        <div className="space-y-3">
          {['Intercambia láminas entre universidades', 'Matches automáticos inteligentes', 'Chat en tiempo real'].map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-2 h-2 ${i === 0 ? 'bg-accent' : i === 1 ? 'bg-gold' : 'bg-paper'}`} />
              <p className="font-body text-paper/70 text-sm">{t}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10">
            <h2 className="font-display text-4xl tracking-widest">INICIAR SESIÓN</h2>
            <p className="font-body text-sm text-muted mt-1">Bienvenido de vuelta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-muted tracking-widest uppercase mb-1.5">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="tu@universidad.edu"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-muted tracking-widest uppercase mb-1.5">Contraseña</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-accent border border-accent px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'ENTRANDO...' : 'ENTRAR'}
            </button>
          </form>

          <p className="mt-6 font-body text-sm text-center text-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-accent font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
