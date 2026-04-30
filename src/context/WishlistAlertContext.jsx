import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket.js';

const WishlistAlertContext = createContext(null);

/**
 * Proveedor global de alertas de wishlist.
 * Se monta una sola vez en App.jsx y escucha el evento 'wishlist_match'
 * sin importar en qué página esté el usuario.
 * Muestra un toast flotante que desaparece solo o al hacer clic.
 */
export const WishlistAlertProvider = ({ children }) => {
  const [toasts, setToasts]   = useState([]);
  const socket                = useSocket();
  const navigate              = useNavigate();

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, ...data }]);
      // Auto-dismiss después de 8 segundos
      setTimeout(() => dismiss(id), 8000);
    };

    socket.on('wishlist_match', handler);
    return () => socket.off('wishlist_match', handler);
  }, [socket, dismiss]);

  return (
    <WishlistAlertContext.Provider value={{ toasts }}>
      {children}

      {/* Toast container — esquina inferior derecha, sobre todo */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="bg-paper border-2 border-gold shadow-[4px_4px_0_0_#f0b429]
                         flex items-start gap-3 p-4 animate-[fadeUp_.3s_ease]"
            >
              <span className="text-xl shrink-0">⭐</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs font-bold tracking-widest text-ink">
                  ¡LÁMINA #{toast.stickerNumber} DISPONIBLE!
                </p>
                <p className="font-body text-sm text-ink mt-0.5 truncate">
                  {toast.playerName || `Lámina #${toast.stickerNumber}`}
                </p>
                <button
                  onClick={() => { navigate('/'); dismiss(toast.id); }}
                  className="mt-2 font-mono text-xs text-accent hover:underline"
                >
                  Ver en el mural →
                </button>
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-muted hover:text-ink text-lg leading-none shrink-0 ml-1"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </WishlistAlertContext.Provider>
  );
};

export const useWishlistAlerts = () => useContext(WishlistAlertContext);
