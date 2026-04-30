import { useState } from 'react';

const COLOMBIAN_UNIVERSITIES = [
  'U. Nacional de Colombia',
  'U. de los Andes',
  'Pontificia U. Javeriana',
  'U. del Rosario',
  'U. de Antioquia',
  'U. del Valle',
  'U. Industrial de Santander',
  'U. Pontificia Bolivariana',
  'U. EAFIT',
  'U. Externado de Colombia',
  'U. de la Sabana',
  'U. Distrital Francisco J. de Caldas',
];

const CATEGORIES = [
  { value: '',         label: 'Todas'    },
  { value: 'jugador',  label: '👤 Jugador'  },
  { value: 'escudo',   label: '🛡️ Escudo'   },
  { value: 'especial', label: '✨ Especial'  },
  { value: 'estadio',  label: '🏟️ Estadio'  },
  { value: 'leyenda',  label: '⭐ Leyenda'  },
];

const TYPES = [
  { value: '',     label: 'Todos'     },
  { value: 'have', label: '🟢 Tengo' },
  { value: 'want', label: '🔴 Busco' },
];

export default function FilterBar({ filters, onChange, onPublish }) {
  const [expanded, setExpanded] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const clearAll = () => onChange({ search: '', type: '', university: '', category: '' });

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-paper border-2 border-ink shadow-card mb-6">
      {/* Search row */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b-2 border-ink">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Jugador, equipo..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-2 border-2 border-ink font-mono text-xs
                       tracking-widest transition-colors duration-150
                       ${expanded ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-ink hover:text-paper'}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" />
          </svg>
          <span className="hidden sm:inline">FILTROS</span>
          {activeCount > 0 && (
            <span className="bg-accent text-paper rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none">
              {activeCount}
            </span>
          )}
        </button>

        <button onClick={onPublish}
          className="btn-primary shrink-0 flex items-center gap-1.5 !px-3 sm:!px-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline font-mono text-xs tracking-widest">PUBLICAR</span>
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b-2 border-ink/10">
          {/* Type */}
          <div>
            <p className="font-mono text-xs text-muted mb-2 tracking-widest uppercase">Tipo</p>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(({ value, label }) => (
                <button key={value} onClick={() => update('type', value)}
                  className={`px-3 py-1.5 border-2 border-ink font-mono text-xs tracking-wider
                               transition-colors duration-100
                               ${filters.type === value ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-cream'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="font-mono text-xs text-muted mb-2 tracking-widest uppercase">Categoría</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(({ value, label }) => (
                <button key={value} onClick={() => update('category', value)}
                  className={`px-3 py-1.5 border-2 border-ink font-mono text-xs tracking-wider
                               transition-colors duration-100 whitespace-nowrap
                               ${filters.category === value
                                 ? value === 'especial'
                                   ? 'bg-gold text-ink border-gold'
                                   : value === 'leyenda'
                                   ? 'bg-accent text-paper border-accent'
                                   : 'bg-ink text-paper'
                                 : 'bg-paper text-ink hover:bg-cream'
                               }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* University */}
          <div>
            <p className="font-mono text-xs text-muted mb-2 tracking-widest uppercase">Universidad</p>
            <select
              value={filters.university}
              onChange={(e) => update('university', e.target.value)}
              className="input-field"
            >
              <option value="">Todas</option>
              {COLOMBIAN_UNIVERSITIES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active chips */}
      {activeCount > 0 && (
        <div className="px-4 py-2 flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-muted">Activos:</span>
          {filters.search    && <Chip label={`"${filters.search}"`}    onRemove={() => update('search', '')} />}
          {filters.type      && <Chip label={filters.type === 'have' ? 'Tengo' : 'Busco'} onRemove={() => update('type', '')} />}
          {filters.category  && <Chip label={filters.category}         onRemove={() => update('category', '')} />}
          {filters.university && <Chip label={filters.university}      onRemove={() => update('university', '')} />}
          <button onClick={clearAll} className="font-mono text-xs text-accent hover:underline ml-auto">
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}

const Chip = ({ label, onRemove }) => (
  <span className="flex items-center gap-1 px-2 py-0.5 bg-ink text-paper font-mono text-xs">
    {label}
    <button onClick={onRemove} className="hover:text-accent ml-1 leading-none">×</button>
  </span>
);
