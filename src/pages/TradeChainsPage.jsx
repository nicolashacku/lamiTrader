import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

const STATUS_META = {
  pending:   { label: 'PENDIENTE',  cls: 'bg-gold text-ink border-gold'          },
  active:    { label: 'ACTIVA',     cls: 'bg-ink text-paper'                     },
  completed: { label: 'COMPLETADA', cls: 'bg-accent text-paper border-accent'    },
  cancelled: { label: 'CANCELADA',  cls: 'bg-muted text-paper border-muted'      },
};

export default function TradeChainsPage() {
  const { user }    = useAuth();
  const socket      = useSocket();
  const [chains,   setChains]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [qrData,   setQrData]   = useState(null);   // { chainId, qrDataURL }
  const [filter,   setFilter]   = useState('');

  const fetchChains = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/chains${params}`)
      .then(({ data }) => setChains(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchChains(); }, [filter]); // eslint-disable-line

  useEffect(() => {
    if (!socket) return;
    socket.on('new_chain',       fetchChains);
    socket.on('chain_active',    fetchChains);
    socket.on('chain_completed', fetchChains);
    return () => {
      socket.off('new_chain',       fetchChains);
      socket.off('chain_active',    fetchChains);
      socket.off('chain_completed', fetchChains);
    };
  }, [socket]); // eslint-disable-line

  const handleAccept = async (chainId) => {
    await api.patch(`/chains/${chainId}/accept`);
    fetchChains();
  };

  const handleCancel = async (chainId) => {
    await api.patch(`/chains/${chainId}/cancel`);
    fetchChains();
  };

  const handleGetQR = async (chainId) => {
    const { data } = await api.get(`/chains/${chainId}/qr`);
    setQrData({ chainId, qrDataURL: data.qrDataURL });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-5xl sm:text-7xl tracking-widest leading-none">CADENAS</h1>
        <p className="font-mono text-xs text-muted mt-1 tracking-widest">
          INTERCAMBIOS EN CADENA — A ENTREGA A B, B ENTREGA A C, C ENTREGA A A
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: '', label: 'TODAS' },
          { value: 'pending',   label: 'PENDIENTES' },
          { value: 'active',    label: 'ACTIVAS'    },
          { value: 'completed', label: 'COMPLETADAS'},
        ].map(({ value, label }) => (
          <button key={value} onClick={() => setFilter(value)}
            className={`px-4 py-2 border-2 border-ink font-mono text-xs tracking-widest transition-colors
                         ${filter === value ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-cream'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* QR Modal */}
      {qrData && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper border-4 border-ink shadow-[8px_8px_0_0_#e63329] p-6 max-w-xs w-full text-center">
            <p className="font-display text-2xl tracking-widest mb-4">TU QR DE ENTREGA</p>
            <p className="font-mono text-xs text-muted mb-4">
              Muestra este código a quien te entrega su lámina para confirmar el intercambio
            </p>
            <img src={qrData.qrDataURL} alt="QR de confirmación"
              className="w-48 h-48 mx-auto border-4 border-ink mb-4" />
            <button onClick={() => setQrData(null)} className="btn-primary w-full">CERRAR</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-2 border-ink animate-pulse h-32 bg-cream" />
          ))}
        </div>
      ) : chains.length === 0 ? (
        <EmptyChains />
      ) : (
        <div className="space-y-4">
          {chains.map((chain) => {
            const statusMeta = STATUS_META[chain.status];
            const myLink     = chain.links.find((l) => l.userFrom?._id === user._id || l.userFrom === user._id);
            const myAccepted = myLink?.accepted;

            return (
              <div key={chain._id} className="card p-0 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-2 bg-cream border-b-2 border-ink flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${statusMeta.cls}`}>{statusMeta.label}</span>
                    <span className="font-mono text-xs text-muted">
                      CADENA DE {chain.links.length} PARTICIPANTES
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted">
                    {new Date(chain.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>

                {/* Chain visualization */}
                <div className="p-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
                    {chain.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 shrink-0">
                        {/* User + sticker */}
                        <div className="text-center">
                          <div className={`w-10 h-10 border-2 flex items-center justify-center font-display text-lg mx-auto
                                           ${(link.userFrom?._id || link.userFrom) === user._id
                                             ? 'bg-accent text-paper border-accent'
                                             : 'bg-ink text-paper border-ink'}`}>
                            {(link.userFrom?.name || '?')[0].toUpperCase()}
                          </div>
                          <p className="font-mono text-xs text-muted mt-1 w-16 truncate text-center">
                            {link.userFrom?.name?.split(' ')[0] || '?'}
                          </p>
                        </div>
                        {/* Arrow + sticker */}
                        <div className="flex flex-col items-center">
                          <div className="border-2 border-ink px-2 py-1 bg-cream text-center">
                            <p className="font-mono text-xs font-bold">#{link.sticker?.number}</p>
                            <p className="font-mono text-xs text-muted w-20 truncate">
                              {link.sticker?.playerName}
                            </p>
                          </div>
                          <svg className="w-6 h-4 text-muted mt-1" fill="none" viewBox="0 0 24 12" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M0 6h20M16 2l4 4-4 4" />
                          </svg>
                        </div>
                        {/* Last: destination */}
                        {i === chain.links.length - 1 && (
                          <div className="text-center">
                            <div className={`w-10 h-10 border-2 flex items-center justify-center font-display text-lg mx-auto
                                             ${(link.userTo?._id || link.userTo) === user._id
                                               ? 'bg-accent text-paper border-accent'
                                               : 'bg-ink text-paper border-ink'}`}>
                              {(link.userTo?.name || '?')[0].toUpperCase()}
                            </div>
                            <p className="font-mono text-xs text-muted mt-1 w-16 truncate text-center">
                              {link.userTo?.name?.split(' ')[0] || '?'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress de confirmaciones */}
                  <div className="flex items-center gap-2 mb-4">
                    {chain.links.map((l, i) => (
                      <div key={i} title={`${l.userFrom?.name} → ${l.userTo?.name}`}
                        className={`flex-1 h-1.5 border border-ink transition-colors
                                     ${l.confirmedQR ? 'bg-accent' : l.accepted ? 'bg-gold' : 'bg-cream'}`} />
                    ))}
                  </div>
                  <p className="font-mono text-xs text-muted mb-4">
                    {chain.links.filter((l) => l.confirmedQR).length}/{chain.links.length} confirmaciones QR
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {chain.status === 'pending' && !myAccepted && (
                      <button onClick={() => handleAccept(chain._id)} className="btn-primary text-xs px-3 py-1.5">
                        ACEPTAR MI PARTE
                      </button>
                    )}
                    {chain.status === 'pending' && myAccepted && (
                      <span className="font-mono text-xs text-muted italic self-center">
                        Esperando que los demás acepten...
                      </span>
                    )}
                    {chain.status === 'active' && (
                      <button onClick={() => handleGetQR(chain._id)} className="btn-primary text-xs px-3 py-1.5">
                        📱 MOSTRAR MI QR
                      </button>
                    )}
                    {['pending','active'].includes(chain.status) && (
                      <button onClick={() => handleCancel(chain._id)}
                        className="border-2 border-muted text-muted font-mono text-xs px-3 py-1.5 hover:bg-muted hover:text-paper transition-colors">
                        CANCELAR
                      </button>
                    )}
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

const EmptyChains = () => (
  <div className="text-center py-20 border-2 border-dashed border-ink/20">
    <p className="font-display text-3xl tracking-widest mb-3 text-ink/30">SIN CADENAS</p>
    <p className="font-body text-sm text-muted max-w-sm mx-auto">
      Las cadenas se crean automáticamente cuando tres o más usuarios forman un ciclo de intercambio
      que ningún match bilateral puede resolver.
    </p>
  </div>
);
