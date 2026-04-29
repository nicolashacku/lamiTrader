import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const UNIVERSITIES = [
  'Universidad Nacional',
  'Universidad de los Andes',
  'Pontificia Universidad Javeriana',
  'Universidad de Antioquia',
  'Universidad del Valle',
  'Universidad del Rosario',
  'Universidad de la Sabana',
  'Universidad EAFIT',
  'Universidad Industrial de Santander',
  'Universidad del Norte',
  'Universidad Externado de Colombia',
  'Universidad Pontificia Bolivariana',
  'Universidad Santo Tomás',
  'Politécnico Grancolombiano',
  'Universidad Sergio Arboleda'
];

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', university: '', bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent flex items-center justify-center border-2 border-ink">
              <span className="font-display text-paper text-lg">P</span>
            </div>
            <span className="font-display text-ink text-xl tracking-widest">PANINI UNI-EXCHANGE</span>
          </div>
          <h2 className="font-display text-4xl tracking-widest">CREAR CUENTA</h2>
          <p className="font-body text-sm text-muted mt-1">Únete a la comunidad de intercambio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre completo *" type="text" value={form.name}
            onChange={(v) => set('name', v)} placeholder="Tu nombre" />
          <Field label="Email *" type="email" value={form.email}
            onChange={(v) => set('email', v)} placeholder="tu@universidad.edu" />
          <Field label="Contraseña *" type="password" value={form.password}
            onChange={(v) => set('password', v)} placeholder="Mínimo 6 caracteres" />

          <div>
            <label className="block font-mono text-xs text-muted tracking-widest uppercase mb-1.5">
              Universidad *
            </label>
            <select
              className="input-field"
              value={form.university}
              onChange={(e) => set('university', e.target.value)}
              required
            >
              <option value="">Selecciona tu universidad</option>
              {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs text-muted tracking-widest uppercase mb-1.5">
              Bio (opcional)
            </label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Cuéntanos algo sobre ti y tu colección..."
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              maxLength={160}
            />
          </div>

          {error && (
            <p className="font-mono text-xs text-accent border border-accent px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
          </button>
        </form>

        <p className="mt-6 font-body text-sm text-center text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

const Field = ({ label, type, value, onChange, placeholder }) => (
  <div>
    <label className="block font-mono text-xs text-muted tracking-widest uppercase mb-1.5">
      {label}
    </label>
    <input
      type={type}
      className="input-field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
    />
  </div>
);
