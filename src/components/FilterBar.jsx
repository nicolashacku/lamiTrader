import { useState } from 'react';

const UNIVERSITIES = [
  'Todas',
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

const RARITIES = [
  { value: '', label: 'Todas' },
  { value: 'common', label: 'Común' },
  { value: 'rare', label: 'Rara' },
  { value: 'legendary', label: 'Legendaria' },
];

const TYPES = [
  { value: '', label: 'Todos' },
  { value: 'have', label: '🟢 Tengo' },
  { value: 'want', label: '🔴 Busco' },
];

/**
 * FilterBar
 * Props:
 *  - filters    { search, type, university, rarity }
 *  - onChange   callback(newFilters)
 *  - onPublish  callback() — abre el modal de publicar
 */
export default function FilterBar({ filters, onChange, onPublish }) {
  const [expanded, setExpanded] = useState(false);

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const clearAll = () =>
    onChange({ search: '', type: '', university: '', rarity: '' });

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-paper border-2 border-ink shadow-card mb-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink">
        {/* Search */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar jugador, equipo..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* Toggle filters */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-2 px-4 py-2 border-2 border-ink font-mono text-xs
                       tracking-widest transition-colors duration-150
                       ${expanded ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-ink hover:text-paper'}`}
        >
          FILTROS
          {activeCount > 0 && (
            <span className="bg-accent text-paper rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeCount}
            </span>
          )}
        </button>

        {/* Publish button */}
        <button onClick={onPublish} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline font-mono text-xs tracking-widest">PUBLICAR</span>
        </button>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b-2 border-ink/20">
          {/* Type filter */}
          <div>
            <label className="block font-mono text-xs text-muted mb-2 tracking-widest uppercase">
              Tipo
            </label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update('type', value)}
                  className={`px-3 py-1.5 border-2 border-ink font-mono text-xs tracking-wider
                               transition-colors duration-100
                               ${filters.type === value
                                 ? 'bg-ink text-paper'
                                 : 'bg-paper text-ink hover:bg-cream'
                               }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity filter */}
          <div>
            <label className="block font-mono text-xs text-muted mb-2 tracking-widest uppercase">
              Rareza
            </label>
            <div className="flex gap-2 flex-wrap">
              {RARITIES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update('rarity', value)}
                  className={`px-3 py-1.5 border-2 border-ink font-mono text-xs tracking-wider
                               transition-colors duration-100
                               ${filters.rarity === value
                                 ? value === 'rare'
                                   ? 'bg-gold text-ink border-gold'
                                   : value === 'legendary'
                                   ? 'bg-accent text-paper border-accent'
                                   : 'bg-ink text-paper'
                                 : 'bg-paper text-ink hover:bg-cream'
                               }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* University filter */}
          <div>
            <label className="block font-mono text-xs text-muted mb-2 tracking-widest uppercase">
              Universidad
            </label>
            <select
              value={filters.university}
              onChange={(e) => update('university', e.target.value === 'Todas' ? '' : e.target.value)}
              className="input-field"
            >
              {UNIVERSITIES.map((u) => (
                <option key={u} value={u === 'Todas' ? '' : u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {activeCount > 0 && (
        <div className="px-4 py-2 flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs text-muted">Filtros activos:</span>
          {filters.search && (
            <FilterChip label={`"${filters.search}"`} onRemove={() => update('search', '')} />
          )}
          {filters.type && (
            <FilterChip label={filters.type === 'have' ? 'Tengo' : 'Busco'} onRemove={() => update('type', '')} />
          )}
          {filters.rarity && (
            <FilterChip label={filters.rarity} onRemove={() => update('rarity', '')} />
          )}
          {filters.university && (
            <FilterChip label={filters.university} onRemove={() => update('university', '')} />
          )}
          <button
            onClick={clearAll}
            className="font-mono text-xs text-accent hover:underline ml-auto"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}

const FilterChip = ({ label, onRemove }) => (
  <span className="flex items-center gap-1 px-2 py-0.5 bg-ink text-paper font-mono text-xs">
    {label}
    <button onClick={onRemove} className="hover:text-accent ml-1">×</button>
  </span>
);
