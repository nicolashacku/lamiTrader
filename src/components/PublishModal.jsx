import { useState, useRef } from 'react';
import api from '../utils/api.js';

// Países clasificados al Mundial 2026 (base FIFA, ajustable)
const WORLD_CUP_TEAMS = [
  'Argentina','Australia','Brasil','Canadá','Colombia','Costa Rica',
  'Croacia','Ecuador','España','Estados Unidos','Francia','Ghana',
  'Holanda','Honduras','Hungría','Inglaterra','Irán','Italia','Japón',
  'Marruecos','México','Nigeria','Nueva Zelanda','Panamá','Paraguay',
  'Perú','Polonia','Portugal','Senegal','Serbia','Suiza','Turquía',
  'Uruguay','Venezuela',
];

const CATEGORIES = [
  { value: 'jugador',  label: '👤 Jugador'  },
  { value: 'escudo',   label: '🛡️ Escudo'   },
  { value: 'especial', label: '✨ Especial'  },
  { value: 'estadio',  label: '🏟️ Estadio'  },
  { value: 'leyenda',  label: '⭐ Leyenda'  },
];

const INITIAL = {
  number: '', playerName: '', team: '', section: '',
  category: 'jugador', type: 'have', notes: '',
};

export default function PublishModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState(INITIAL);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError('La imagen no puede superar 4 MB.');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.number || !form.playerName || !form.team) {
      return setError('Número, nombre y equipo son obligatorios.');
    }
    setLoading(true);
    setError('');

    try {
      // Usar FormData para enviar imagen + campos juntos
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (imageFile) body.append('image', imageFile);

      await api.post('/stickers', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink/60 backdrop-blur-sm">
      <div className="bg-paper border-t-4 sm:border-4 border-ink shadow-[0_-4px_0_0_#e63329] sm:shadow-[8px_8px_0px_0px_#e63329]
                      w-full sm:max-w-md max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-ink bg-ink sticky top-0 z-10">
          <h2 className="font-display text-2xl tracking-widest text-paper">PUBLICAR LÁMINA</h2>
          <button onClick={onClose} className="text-paper/60 hover:text-paper text-3xl leading-none">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type selector */}
          <div>
            <Label>Tipo *</Label>
            <div className="flex gap-3 mt-1.5">
              {[
                { value: 'have', label: 'TENGO', active: 'bg-ink text-paper' },
                { value: 'want', label: 'BUSCO',  active: 'bg-accent text-paper border-accent' },
              ].map(({ value, label, active }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('type', value)}
                  className={`flex-1 py-3 border-2 border-ink font-display text-xl tracking-widest
                               transition-all duration-150
                               ${form.type === value ? active : 'bg-paper text-muted hover:bg-cream'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Number + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Número *</Label>
              <input className="input-field mt-1.5" value={form.number}
                onChange={(e) => set('number', e.target.value)} placeholder="ej. 42" />
            </div>
            <div>
              <Label>Categoría</Label>
              <select className="input-field mt-1.5" value={form.category}
                onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Player name */}
          <div>
            <Label>Nombre / Descripción *</Label>
            <input className="input-field mt-1.5" value={form.playerName}
              onChange={(e) => set('playerName', e.target.value)}
              placeholder="ej. Lionel Messi / Estadio Metropolitano" />
          </div>

          {/* Team select */}
          <div>
            <Label>Equipo / País *</Label>
            <select className="input-field mt-1.5" value={form.team}
              onChange={(e) => set('team', e.target.value)} required>
              <option value="">Selecciona un país</option>
              {WORLD_CUP_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Section */}
          <div>
            <Label>Sección del álbum</Label>
            <input className="input-field mt-1.5" value={form.section}
              onChange={(e) => set('section', e.target.value)} placeholder="ej. Grupo A" />
          </div>

          {/* Image upload */}
          <div>
            <Label>Imagen de la lámina</Label>
            <div
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 border-2 border-dashed border-ink cursor-pointer hover:border-accent
                         transition-colors duration-150 flex items-center justify-center overflow-hidden
                         bg-cream"
              style={{ minHeight: '100px' }}
            >
              {preview ? (
                <img src={preview} alt="preview" className="w-full object-cover max-h-40" />
              ) : (
                <div className="flex flex-col items-center gap-1 py-5 text-muted select-none">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="font-mono text-xs tracking-widest">SUBIR IMAGEN</span>
                  <span className="font-mono text-xs text-muted/60">JPG · PNG · WebP · máx 4 MB</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleFile} />
            {preview && (
              <button
                onClick={() => { setImageFile(null); setPreview(''); }}
                className="mt-1 font-mono text-xs text-accent hover:underline"
              >
                Quitar imagen
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>Notas</Label>
            <textarea className="input-field mt-1.5 resize-none" rows={2}
              placeholder="¿Algo que quieras aclarar sobre el intercambio?"
              value={form.notes} onChange={(e) => set('notes', e.target.value)} maxLength={200} />
            <span className="font-mono text-xs text-muted">{form.notes.length}/200</span>
          </div>

          {error && (
            <p className="font-mono text-xs text-accent border border-accent px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1 pb-2">
            <button onClick={onClose} className="btn-ghost flex-1">CANCELAR</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'PUBLICANDO...' : 'PUBLICAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Label = ({ children }) => (
  <label className="block font-mono text-xs text-muted tracking-widest uppercase">{children}</label>
);
