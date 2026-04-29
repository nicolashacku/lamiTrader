import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const socket = useSocket();
  const [matchAlert, setMatchAlert] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_match', () => setMatchAlert(true));
    return () => socket.off('new_match');
  }, [socket]);

  const navLinks = [
    { to: '/', label: 'MURAL' },
    { to: '/matches', label: 'MATCHES' },
    { to: `/profile/${user?._id}`, label: 'PERFIL' },
    { to: '/chat', label: 'CHATS' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink border-b-2 border-ink">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-accent border-2 border-paper flex items-center justify-center">
            <span className="font-display text-paper text-lg leading-none">P</span>
          </div>
          <span className="font-display text-paper text-2xl tracking-widest hidden sm:block">
            PANINI UNI-EXCHANGE
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-4 py-2 font-mono text-xs tracking-widest transition-colors duration-150
                ${isActive(to)
                  ? 'text-accent'
                  : 'text-paper/70 hover:text-paper'
                }`}
            >
              {label === 'MATCHES' && matchAlert && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
              {label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-4 px-4 py-1.5 font-mono text-xs tracking-widest border border-paper/30
                       text-paper/60 hover:text-paper hover:border-paper transition-colors duration-150"
          >
            SALIR
          </button>
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-paper p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 space-y-1.5">
            <span className={`block h-0.5 bg-paper transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 bg-paper transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 bg-paper transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink border-t border-paper/10 px-4 pb-4">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="block py-3 font-mono text-sm tracking-widest text-paper/70 hover:text-accent border-b border-paper/10"
            >
              {label}
              {label === 'MATCHES' && matchAlert && (
                <span className="ml-2 inline-block w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
            </Link>
          ))}
          <button
            onClick={logout}
            className="mt-3 w-full py-3 font-mono text-sm tracking-widest text-paper/50 hover:text-accent text-left"
          >
            SALIR
          </button>
        </div>
      )}
    </header>
  );
}
