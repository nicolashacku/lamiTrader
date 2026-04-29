import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';

const STATUS_LABELS = {
  pending: { label: 'PENDIENTE', cls: 'bg-gold text-ink border-gold' },
  accepted: { label: 'ACEPTADO', cls: 'bg-ink text-paper' },
  rejected: { label: 'RECHAZADO', cls: 'bg-muted text-paper border-muted' },
  completed: { label: 'COMPLETADO', cls: 'bg-accent text-paper border-accent' },
};

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchMatches = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/matches${params}`)
      .then(({ data }) => setMatches(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, [filter]); // eslint-disable-line

  const handleAction = async (matchId, action) => {
    try {
      await api.patch(`/matches/${matchId}/${action}`);
      fetchMatches();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChat = async (match) => {
    const otherUser = match.userA._id === user._id ? match.userB : match.userA;
    try {
      const { data } = await api.post('/conversations', {
        otherUserId: otherUser._id,
        matchId: match._id,
      });
      navigate(`/chat/${data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-5xl sm:text-7xl tracking-widest">MATCHES</h1>
        <p className="font-mono text-xs text-muted mt-1 tracking-widest">
          {matches.length} COINCIDENCIAS ENCONTRADAS
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: '', label: 'TODOS' },
          { value: 'pending', label: 'PENDIENTES' },
          { value: 'accepted', label: 'ACEPTADOS' },
          { value: 'completed', label: 'COMPLETADOS' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 border-2 border-ink font-mono text-xs tracking-widest
                         transition-colors duration-150
                         ${filter === value ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-cream'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-ink border-t-accent animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <EmptyMatches />
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const isUserA = match.userA._id === user._id;
            const mySticker = isUserA ? match.stickerOfferedByA : match.stickerOfferedByB;
            const theirSticker = isUserA ? match.stickerOfferedByB : match.stickerOfferedByA;
            const otherUser = isUserA ? match.userB : match.userA;
            const statusInfo = STATUS_LABELS[match.status];
            const myAccepted = isUserA ? match.acceptedByA : match.acceptedByB;

            return (
              <div key={match._id} className="card p-0 overflow-hidden">
                {/* Status header */}
                <div className="px-4 py-2 bg-cream border-b-2 border-ink flex items-center justify-between">
                  <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                  <span className="font-mono text-xs text-muted">
                    {new Date(match.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>

                <div className="p-4">
                  {/* Trade visualization */}
                  <div className="flex items-center gap-3 mb-4">
                    <StickerMini sticker={mySticker} label="Yo ofrezco" />
                    <div className="text-2xl font-display text-muted">⇄</div>
                    <StickerMini sticker={theirSticker} label="Ellos ofrecen" />
                  </div>

                  {/* Other user */}
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-ink/10 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-ink text-paper flex items-center justify-center font-display text-lg">
                        {otherUser.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-body text-sm font-semibold">{otherUser.name}</p>
                        <p className="font-mono text-xs text-muted">{otherUser.university}</p>
                        <StarRating value={otherUser.averageRating || 0} size="sm" totalRatings={otherUser.totalRatings} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleChat(match)}
                        className="btn-ghost text-xs px-3 py-1.5"
                      >
                        CHAT
                      </button>
                      {match.status === 'pending' && !myAccepted && (
                        <>
                          <button
                            onClick={() => handleAction(match._id, 'accept')}
                            className="btn-primary text-xs px-3 py-1.5"
                          >
                            ACEPTAR
                          </button>
                          <button
                            onClick={() => handleAction(match._id, 'reject')}
                            className="border-2 border-muted text-muted font-mono text-xs px-3 py-1.5 hover:bg-muted hover:text-paper transition-colors"
                          >
                            RECHAZAR
                          </button>
                        </>
                      )}
                      {match.status === 'pending' && myAccepted && (
                        <span className="font-mono text-xs text-muted italic self-center">
                          Esperando confirmación...
                        </span>
                      )}
                      {match.status === 'accepted' && (
                        <button
                          onClick={() => handleAction(match._id, 'complete')}
                          className="btn-accent text-xs px-3 py-1.5"
                        >
                          MARCAR COMPLETADO
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const StickerMini = ({ sticker, label }) => (
  <div className="flex-1 border-2 border-ink/20 p-3 bg-cream min-w-0">
    <p className="font-mono text-xs text-muted mb-1">{label}</p>
    {sticker ? (
      <>
        <p className="font-display text-lg leading-tight truncate">{sticker.playerName?.toUpperCase()}</p>
        <p className="font-mono text-xs text-muted truncate">#{sticker.number} · {sticker.team}</p>
        <span className={sticker.type === 'have' ? 'badge-have' : 'badge-want'}>
          {sticker.type === 'have' ? 'TENGO' : 'BUSCO'}
        </span>
      </>
    ) : (
      <p className="font-mono text-xs text-muted italic">Lámina no disponible</p>
    )}
  </div>
);

const EmptyMatches = () => (
  <div className="text-center py-20 border-2 border-dashed border-ink/20">
    <p className="font-display text-3xl tracking-widest mb-3 text-ink/30">SIN MATCHES</p>
    <p className="font-body text-sm text-muted max-w-sm mx-auto">
      Los matches se detectan automáticamente cuando publicas una lámina que alguien busca (y viceversa).
    </p>
  </div>
);
