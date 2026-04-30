import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

const NAV_LINKS = [
  { to: '/',        label: 'MURAL'   },
  { to: '/feed',    label: 'FEED'    },
  { to: '/matches', label: 'MATCHES' },
  { to: '/chains',  label: 'CADENAS' },
  { to: '/wishlist',label: 'WISHLIST'},
  { to: '/map',     label: 'MAPA'    },
  { to: '/chat',    label: 'CHATS'   },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const socket   = useSocket();
  const [alerts,   setAlerts]   = useState({ match: false, chain: false, wishlist: false });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_match',      () => setAlerts((a) => ({ ...a, match:    true })));
    socket.on('new_chain',      () => setAlerts((a) => ({ ...a, chain:    true })));
    socket.on('wishlist_match', () => setAlerts((a) => ({ ...a, wishlist: true })));
    return () => {
      socket.off('new_match');
      socket.off('new_chain');
      socket.off('wishlist_match');
    };
  }, [socket]);

  // Clear alert when visiting the corresponding page
  useEffect(() => {
    if (location.pathname === '/matches')  setAlerts((a) => ({ ...a, match:    false }));
    if (location.pathname === '/chains')   setAlerts((a) => ({ ...a, chain:    false }));
    if (location.pathname === '/wishlist') setAlerts((a) => ({ ...a, wishlist: false }));
  }, [location.pathname]);

  const hasAlert = (to) => {
    if (to === '/matches')  return alerts.match;
    if (to === '/chains')   return alerts.chain;
    if (to === '/wishlist') return alerts.wishlist;
    return false;
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-accent border-2 border-paper flex items-center justify-center">
            <span className="font-display text-paper text-lg leading-none">P</span>
          </div>
          <span className="font-display text-paper text-xl tracking-widest hidden lg:block">
            PANINI UNI-EXCHANGE
          </span>
        </Link>

        {/* Desktop Nav — scrollable on mid screens */}
        <nav className="hidden md:flex items-center gap-0 overflow-x-auto">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-3 py-2 font-mono text-xs tracking-widest whitespace-nowrap
                           transition-colors duration-150
                           ${isActive(to) ? 'text-accent' : 'text-paper/70 hover:text-paper'}`}
            >
              {hasAlert(to) && (
                <span className="absolute top-1.5 right-0.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            to={`/profile/${user?._id}`}
            className="w-8 h-8 bg-paper/10 border border-paper/30 flex items-center justify-center
                       font-display text-paper text-sm hover:bg-accent hover:border-accent transition-colors"
            title={user?.name}
          >
            {user?.name?.[0]?.toUpperCase() || '?'}
          </Link>
          <button
            onClick={logout}
            className="px-3 py-1.5 font-mono text-xs tracking-widest border border-paper/30
                       text-paper/60 hover:text-paper hover:border-paper transition-colors"
          >
            SALIR
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-paper p-2 ml-auto"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 bg-paper transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-paper transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-paper transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink border-t border-paper/10 px-4 pb-4 grid grid-cols-2 gap-x-4">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 py-3 font-mono text-sm tracking-widest
                         text-paper/70 hover:text-accent border-b border-paper/10"
            >
              {label}
              {hasAlert(to) && (
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
            </Link>
          ))}
          <Link
            to={`/profile/${user?._id}`}
            onClick={() => setMenuOpen(false)}
            className="py-3 font-mono text-sm tracking-widest text-paper/70 hover:text-accent border-b border-paper/10"
          >
            PERFIL
          </Link>
          <button
            onClick={logout}
            className="py-3 font-mono text-sm tracking-widest text-paper/50 hover:text-accent text-left border-b border-paper/10"
          >
            SALIR
          </button>
        </div>
      )}
    </header>
  );
}
