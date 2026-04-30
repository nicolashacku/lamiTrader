import { useState, useEffect, useRef } from 'react';
import api from '../utils/api.js';
import { useSocket } from '../hooks/useSocket.js';

const EVENT_META = {
  match_created:     { icon: '⚡', label: 'Match detectado',     color: 'bg-gold text-ink'         },
  trade_completed:   { icon: '✅', label: 'Intercambio completado', color: 'bg-ink text-paper'      },
  chain_completed:   { icon: '🔗', label: 'Cadena completada',   color: 'bg-accent text-paper'      },
  sticker_published: { icon: '📌', label: 'Lámina publicada',    color: 'bg-cream text-ink'         },
  user_joined:       { icon: '🎓', label: 'Nuevo miembro',       color: 'bg-paper text-ink border border-ink' },
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff/60)} min`;
  if (diff < 86400)return `hace ${Math.floor(diff/3600)} h`;
  return `hace ${Math.floor(diff/86400)} d`;
};

export default function ActivityFeedPage() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();
  const listRef = useRef(null);

  useEffect(() => {
    api.get('/feed?limit=50')
      .then(({ data }) => setEvents(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (event) => {
      setEvents((prev) => [event, ...prev.slice(0, 99)]);
    };
    socket.on('feed_event', handler);
    return () => socket.off('feed_event', handler);
  }, [socket]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-5xl sm:text-7xl tracking-widest leading-none">FEED</h1>
          <p className="font-mono text-xs text-muted mt-1 tracking-widest">ACTIVIDAD EN TIEMPO REAL</p>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="font-mono text-xs text-muted">EN VIVO</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-2 border-ink p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-cream rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-cream rounded w-2/3" />
                <div className="h-3 bg-cream rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-ink/20">
          <p className="font-display text-3xl tracking-widest text-ink/30 mb-2">SIN ACTIVIDAD</p>
          <p className="font-mono text-xs text-muted">Los eventos aparecerán aquí en tiempo real</p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-2">
          {events.map((event, i) => {
            const meta    = EVENT_META[event.type] || EVENT_META.sticker_published;
            const actors  = event.actors || [];
            const actorNames = actors.map((a) => a.name || 'Alguien').join(' y ');
            const uni     = actors[0]?.university || '';

            let description = '';
            switch (event.type) {
              case 'match_created':
                description = `${actorNames} tienen láminas para intercambiar`;
                break;
              case 'trade_completed':
                description = `${actorNames} completaron un intercambio`;
                break;
              case 'chain_completed':
                description = `Cadena de ${event.meta?.length || 3} usuarios completada — ${actorNames}`;
                break;
              case 'sticker_published':
                description = `${actorNames} publicó la lámina #${event.sticker?.number} (${event.sticker?.playerName || ''})`;
                break;
              case 'user_joined':
                description = `${actorNames} se unió desde ${uni}`;
                break;
              default:
                description = 'Nuevo evento';
            }

            return (
              <div
                key={event._id || i}
                className="card p-0 overflow-hidden flex items-stretch"
                style={{ animation: i === 0 ? 'fadeUp .3s ease' : 'none' }}
              >
                {/* Color strip + icon */}
                <div className={`${meta.color} w-12 shrink-0 flex items-center justify-center text-xl border-r-2 border-ink`}>
                  {meta.icon}
                </div>
                <div className="flex-1 px-4 py-3 flex items-center justify-between gap-4 min-w-0">
                  <div className="min-w-0">
                    <span className="font-mono text-xs text-muted tracking-widest block mb-0.5">
                      {meta.label}
                    </span>
                    <p className="font-body text-sm font-medium truncate">{description}</p>
                    {uni && (
                      <p className="font-mono text-xs text-muted mt-0.5">{uni}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs text-muted shrink-0 whitespace-nowrap">
                    {timeAgo(event.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
