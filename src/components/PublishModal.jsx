import { useState } from 'react';
import api from '../utils/api.js';

const TEAMS = [
  "Argentina", "Alemania", "Arabia Saudita", "Australia", "Bélgica", "Brasil", 
  "Camerún", "Canadá", "Corea del Sur", "Costa Rica", "Croacia", "Dinamarca", 
  "Ecuador", "España", "Estados Unidos", "Francia", "Gales", "Ghana", 
  "Holanda", "Inglaterra", "Irán", "Japón", "Marruecos", "México", 
  "Polonia", "Portugal", "Qatar", "Senegal", "Serbia", "Suiza", "Túnez", "Uruguay"
].sort();


const INITIAL = {
  number: '', playerName: '', team: '', section: '',
  image: '', rarity: 'common', type: 'have', notes: '',
};

export default function PublishModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.number || !form.playerName || !form.team) {
      return setError('Número, jugador y equipo son obligatorios.');
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/stickers', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
      <div className="bg-paper border-4 border-ink shadow-[8px_8px_0px_0px_#e63329] w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-ink bg-ink">
          <h2 className="font-display text-2xl tracking-widest text-paper">PUBLICAR LÁMINA</h2>
          <button
            onClick={onClose}
            className="text-paper/60 hover:text-paper text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Type selector */}
          <div>
            <label className="label-field">Tipo *</label>
            <div className="flex gap-3 mt-1.5">
              {[
                { value: 'have', label: 'TENGO', cls: 'bg-ink text-paper' },
                { value: 'want', label: 'BUSCO', cls: 'bg-accent text-paper border-accent' },
              ].map(({ value, label, cls }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('type', value)}
                  className={`flex-1 py-3 border-2 border-ink font-display text-xl tracking-widest
                               transition-all duration-150
                               ${form.type === value ? cls : 'bg-paper text-muted hover:bg-cream'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Row: number + rarity */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Número *" value={form.number} onChange={(v) => set('number', v)} placeholder="ej. 42" />
<div>
  <label className="label-field">Categoría de Lámina</label>
  <select
    className="input-field mt-1.5"
    value={form.rarity} // Mantengo 'rarity' como nombre de variable para no romper tu base de datos, pero cambio las opciones
    onChange={(e) => set('rarity', e.target.value)}
  >
    <option value="jugador">Jugador Base</option>
    <option value="escudo">Escudo / Holográfica </option>
    <option value="especial">Jugador Especial (Top Master/Action)</option>
    <option value="estadio">Estadio / Ciudad</option>
    <option value="leyenda">Leyenda / Extra Sticker </option>
  </select>
</div>
          </div>

          <Field label="Jugador *" value={form.playerName} onChange={(v) => set('playerName', v)} placeholder="ej. Lionel Messi" />
          <div>
            <label className="label-field">Equipo *</label>
            <select
              className="input-field mt-1.5"
              value={form.team}
              onChange={(e) => set('team', e.target.value)}
            >
              <option value="">Selecciona un país...</option>
              {TEAMS.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <Field label="Sección del álbum" value={form.section} onChange={(v) => set('section', v)} placeholder="ej. Grupo A" />
          <Field label="URL de imagen (opcional)" value={form.image} onChange={(v) => set('image', v)} placeholder="https://..." />

          <div>
            <label className="label-field">Notas</label>
            <textarea
              className="input-field mt-1.5 resize-none"
              rows={2}
              placeholder="¿Algo que quieras aclarar sobre el intercambio?"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              maxLength={200}
            />
            <span className="font-mono text-xs text-muted">{form.notes.length}/200</span>
          </div>

          {error && (
            <p className="font-mono text-xs text-accent border border-accent px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-ghost flex-1">CANCELAR</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'PUBLICANDO...' : 'PUBLICAR'}
            </button>
          </div>
        </div>
      </div>

      <style>{`.label-field { display: block; font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: #8a8680; }`}</style>
    </div>
  );
}

const Field = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="label-field">{label}</label>
    <input
      className="input-field mt-1.5"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);
