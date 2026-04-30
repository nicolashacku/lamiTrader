import { useState, useEffect } from 'react';
import api from '../utils/api.js';

const WORLD_CUP_TEAMS = [
  'Argentina','Australia','Brasil','Canadá','Colombia','Costa Rica',
  'Croacia','Ecuador','España','Estados Unidos','Francia','Ghana',
  'Holanda','Honduras','Hungría','Inglaterra','Irán','Italia','Japón',
  'Marruecos','México','Nigeria','Nueva Zelanda','Panamá','Paraguay',
  'Perú','Polonia','Portugal','Senegal','Serbia','Suiza','Turquía',
  'Uruguay','Venezuela',
];

export default function WishlistPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ number: '', playerName: '', team: '' });
  const [adding,  setAdding]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/wishlist')
      .then(({ data }) => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const number = form.number.trim();
    if (!number) return setError('El número es requerido');

    setAdding(true); setError(''); setSuccess('');
    try {
      const { data } = await api.post('/wishlist', { ...form, number });
      setItems((prev) => [data, ...prev]);
      setForm({ number: '', playerName: '', team: '' });
      setSuccess(`Lámina #${number} añadida. Te avisaremos cuando aparezca en el mural.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      // 409 = ya existe, mostramos el mensaje del servidor directamente
      setError(err.response?.data?.message || 'Error al añadir');
    } finally { setAdding(false); }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleAdd(); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-5xl sm:text-7xl tracking-widest leading-none">WISHLIST</h1>
        <p className="font-mono text-xs text-muted mt-1 tracking-widest">
          LÁMINAS QUE TE FALTAN — RECIBES UNA ALERTA AUTOMÁTICA CUANDO ALGUIEN LAS PUBLIQUE
        </p>
      </div>

      {/* Info banner */}
      <div className="border-2 border-ink bg-cream px-4 py-3 mb-6 flex items-start gap-3">
        <span className="text-lg shrink-0">💡</span>
        <p className="font-body text-sm text-muted">
          Cada vez que alguien publique una lámina marcada como <strong>TENGO</strong> que coincida
          con tu wishlist, verás un aviso flotante en cualquier parte de la app.
          El aviso también aparece en la esquina inferior derecha de tu pantalla.
        </p>
      </div>

      {/* Formulario */}
      <div className="card p-5 mb-6">
        <p className="font-mono text-xs tracking-widest text-muted mb-4 uppercase">Añadir lámina</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block font-mono text-xs text-muted mb-1 tracking-widest uppercase">
              Número *
            </label>
            <input
              className="input-field"
              placeholder="ej. 42"
              value={form.number}
              onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
              onKeyDown={handleKey}
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-muted mb-1 tracking-widest uppercase">
              Jugador / Desc.
            </label>
            <input
              className="input-field"
              placeholder="ej. Falcao"
              value={form.playerName}
              onChange={(e) => setForm((f) => ({ ...f, playerName: e.target.value }))}
              onKeyDown={handleKey}
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-muted mb-1 tracking-widest uppercase">
              Equipo
            </label>
            <select
              className="input-field"
              value={form.team}
              onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
            >
              <option value="">Selecciona</option>
              {WORLD_CUP_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <p className="font-mono text-xs text-accent border border-accent px-3 py-2 mb-3">
            ⚠ {error}
          </p>
        )}
        {success && (
          <p className="font-mono text-xs text-ink border border-ink px-3 py-2 mb-3 bg-cream">
            ✓ {success}
          </p>
        )}

        <button onClick={handleAdd} disabled={adding} className="btn-primary w-full sm:w-auto">
          {adding ? 'AÑADIENDO...' : '+ AÑADIR A WISHLIST'}
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-2 border-ink p-4 animate-pulse h-16 bg-cream" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-ink/20">
          <p className="font-display text-3xl tracking-widest text-ink/30 mb-2">VACÍA</p>
          <p className="font-mono text-xs text-muted">
            Añade las láminas que te faltan para recibir alertas automáticas
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-mono text-xs text-muted tracking-widest mb-3">
            {items.length} LÁMINA{items.length !== 1 ? 'S' : ''} EN SEGUIMIENTO
          </p>
          {items.map((item) => (
            <div key={item._id} className="card p-0 overflow-hidden flex items-stretch">
              <div className="bg-accent w-12 shrink-0 flex items-center justify-center
                              text-paper font-display text-sm border-r-2 border-ink px-1 text-center">
                #{item.number}
              </div>
              <div className="flex-1 px-4 py-3 flex items-center justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-body text-sm font-semibold truncate">
                    {item.playerName || `Lámina #${item.number}`}
                  </p>
                  {item.team && (
                    <p className="font-mono text-xs text-muted">{item.team}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(item._id)}
                  className="shrink-0 w-8 h-8 border-2 border-ink flex items-center justify-center
                             hover:bg-accent hover:text-paper hover:border-accent transition-colors"
                  title="Quitar de wishlist"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
