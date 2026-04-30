import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';

// Coordenadas aproximadas de cada universidad (para la visualización de burbujas relativas)
const UNI_POSITIONS = {
  'U. Nacional de Colombia':               { x: 42, y: 38, city: 'Bogotá'       },
  'U. de los Andes':                       { x: 44, y: 40, city: 'Bogotá'       },
  'Pontificia U. Javeriana':               { x: 43, y: 39, city: 'Bogotá'       },
  'U. del Rosario':                        { x: 45, y: 37, city: 'Bogotá'       },
  'U. de Antioquia':                       { x: 28, y: 30, city: 'Medellín'     },
  'U. del Valle':                          { x: 20, y: 52, city: 'Cali'         },
  'U. Industrial de Santander':            { x: 50, y: 28, city: 'Bucaramanga'  },
  'U. Pontificia Bolivariana':             { x: 30, y: 32, city: 'Medellín'     },
  'U. EAFIT':                              { x: 29, y: 31, city: 'Medellín'     },
  'U. Externado de Colombia':              { x: 44, y: 41, city: 'Bogotá'       },
  'U. de la Sabana':                       { x: 40, y: 35, city: 'Bogotá'       },
  'U. Distrital Francisco J. de Caldas':  { x: 43, y: 42, city: 'Bogotá'       },
};

const MEDAL_COLORS = ['bg-gold border-gold', 'bg-ink border-ink text-paper', 'bg-muted border-muted text-paper'];

export default function UniversityMapPage() {
  const [stats,         setStats]        = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [selected,      setSelected]     = useState(null);
  const [albumData,     setAlbumData]    = useState(null);
  const [albumLoading,  setAlbumLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/feed/map')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const maxScore = Math.max(...stats.map((s) => s.activityScore || 1), 1);

  const handleSelect = async (uni) => {
    setSelected(uni);
    setAlbumLoading(true);
    try {
      const { data } = await api.get(`/feed/album/${encodeURIComponent(uni._id)}`);
      setAlbumData(data);
    } catch { setAlbumData(null); }
    finally { setAlbumLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-5xl sm:text-7xl tracking-widest leading-none">MAPA</h1>
        <p className="font-mono text-xs text-muted mt-1 tracking-widest">ACTIVIDAD POR UNIVERSIDAD</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Mapa visual (SVG bubble map) */}
        <div className="lg:col-span-3">
          <div className="card p-0 overflow-hidden">
            <div className="bg-cream border-b-2 border-ink px-4 py-2">
              <p className="font-mono text-xs tracking-widest text-muted">COLOMBIA — MAPA DE ACTIVIDAD</p>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-ink border-t-accent animate-spin" />
              </div>
            ) : (
              <div className="relative bg-paper" style={{ height: '420px' }}>
                {/* Colombia SVG outline — simplified */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-5">
                  <path d="M30,15 L55,10 L70,20 L75,35 L65,50 L70,65 L60,80 L45,85 L30,75 L20,60 L15,45 L20,30 Z"
                    fill="#0e0e0e" stroke="#0e0e0e" strokeWidth="1" />
                </svg>

                {stats.map((uni) => {
                  const pos  = UNI_POSITIONS[uni._id] || { x: 50, y: 50 };
                  const size = 8 + (uni.activityScore / maxScore) * 28;
                  const isSelected = selected?._id === uni._id;
                  return (
                    <button
                      key={uni._id}
                      onClick={() => handleSelect(uni)}
                      style={{
                        position: 'absolute',
                        left:   `${pos.x}%`,
                        top:    `${pos.y}%`,
                        width:  `${size}px`,
                        height: `${size}px`,
                        transform: 'translate(-50%,-50%)',
                        zIndex: isSelected ? 10 : 1,
                      }}
                      className={`rounded-full border-2 transition-all duration-200 flex items-center justify-center
                                   ${isSelected
                                     ? 'bg-accent border-accent shadow-lg scale-125'
                                     : 'bg-ink/80 border-ink hover:bg-accent hover:border-accent hover:scale-110'
                                   }`}
                      title={uni._id}
                    />
                  );
                })}

                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-paper border-2 border-ink px-3 py-2">
                  <p className="font-mono text-xs text-muted mb-1">Tamaño = actividad</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-ink/60 border border-ink" />
                    <span className="font-mono text-xs text-muted">Universidad</span>
                    <div className="w-5 h-5 rounded-full bg-accent border border-accent ml-2" />
                    <span className="font-mono text-xs text-muted">Seleccionada</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Album grupal de la universidad seleccionada */}
          {selected && (
            <div className="card mt-4 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-xs text-muted tracking-widest">ÁLBUM GRUPAL</p>
                  <h3 className="font-display text-2xl tracking-wider">{selected._id}</h3>
                </div>
                <button onClick={() => navigate(`/?university=${encodeURIComponent(selected._id)}`)}
                  className="btn-ghost text-xs px-3 py-1.5">VER LÁMINAS</button>
              </div>

              {albumLoading ? (
                <div className="h-20 flex items-center justify-center">
                  <div className="w-5 h-5 border-4 border-ink border-t-accent animate-spin" />
                </div>
              ) : albumData ? (
                <>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-muted">Cobertura del álbum</span>
                      <span className="font-display text-2xl">{albumData.coverage}%</span>
                    </div>
                    <div className="w-full h-4 border-2 border-ink bg-cream">
                      <div
                        className="h-full bg-accent transition-all duration-700"
                        style={{ width: `${albumData.coverage}%` }}
                      />
                    </div>
                    <p className="font-mono text-xs text-muted mt-1">
                      {albumData.haveCount} de {albumData.totalAlbum} láminas entre todos
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Stat label="Tienen" value={albumData.haveCount} color="text-ink" />
                    <Stat label="Buscan"  value={albumData.wantCount} color="text-accent" />
                  </div>
                </>
              ) : (
                <p className="font-mono text-xs text-muted text-center py-4">Sin datos disponibles</p>
              )}
            </div>
          )}
        </div>

        {/* Ranking sidebar */}
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden h-full">
            <div className="bg-ink px-4 py-3 border-b-2 border-ink">
              <p className="font-display text-xl tracking-widest text-paper">RANKING</p>
            </div>
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 bg-cream border-2 border-ink animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y-2 divide-ink/10 overflow-y-auto" style={{ maxHeight: '520px' }}>
                {stats.map((uni, i) => (
                  <button
                    key={uni._id}
                    onClick={() => handleSelect(uni)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors
                                 ${selected?._id === uni._id ? 'bg-cream' : 'hover:bg-cream'}`}
                  >
                    {/* Position */}
                    <div className={`w-7 h-7 shrink-0 border-2 flex items-center justify-center
                                     font-display text-sm
                                     ${MEDAL_COLORS[i] || 'bg-paper border-ink'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs font-semibold truncate">{uni._id}</p>
                      <p className="font-mono text-xs text-muted">
                        {uni.users} usuarios · {uni.totalStickers} láminas
                      </p>
                    </div>
                    {/* Activity bar */}
                    <div className="w-16 shrink-0">
                      <div className="h-1.5 bg-cream border border-ink/20 w-full">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${(uni.activityScore / maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="font-mono text-xs text-muted text-right mt-0.5">
                        {uni.tradesCompleted} trades
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, color }) => (
  <div className="border-2 border-ink p-3 text-center">
    <p className={`font-display text-3xl ${color}`}>{value}</p>
    <p className="font-mono text-xs text-muted">{label}</p>
  </div>
);
