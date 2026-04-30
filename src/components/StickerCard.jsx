import { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORY_META = {
  jugador:  { label: 'JUGADOR',  cls: 'badge-common'    },
  escudo:   { label: 'ESCUDO',   cls: 'badge-common'    },
  especial: { label: 'ESPECIAL', cls: 'badge-rare'      },
  estadio:  { label: 'ESTADIO',  cls: 'badge-common'    },
  leyenda:  { label: 'LEYENDA',  cls: 'badge-legendary' },
};

const AVATAR_URL = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e0e0e&color=f5f0e8&size=128&bold=true&font-size=0.4`;

const resolveImage = (src, fallback) => {
  if (!src) return fallback;
  if (src.startsWith('http')) return src;
  return `http://localhost:4000${src}`;
};

export default function StickerCard({ sticker, onChatClick }) {
  const { user } = useAuth();
  const isOwn    = sticker.owner?._id === user?._id;
  const meta     = CATEGORY_META[sticker.category] ?? CATEGORY_META.jugador;
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const handleChat = async () => {
    if (isOwn || !onChatClick) return;
    try {
      const { data } = await api.post('/conversations', { otherUserId: sticker.owner._id });
      onChatClick(data._id);
    } catch (err) { console.error(err); }
  };

  // Quick-add to wishlist (only for "have" stickers from others = cards I might want)
  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (isOwn || wishlisted || wishLoading) return;
    setWishLoading(true);
    try {
      await api.post('/wishlist', {
        number:     sticker.number,
        playerName: sticker.playerName,
        team:       sticker.team,
      });
      setWishlisted(true);
    } catch { /* already in wishlist or error — silently ignore */ }
    finally { setWishLoading(false); }
  };

  return (
    <article className="sticker-card card group relative flex flex-col overflow-hidden">
      {/* Top accent strip */}
      <div className={`h-1 w-full ${sticker.type === 'have' ? 'bg-ink' : 'bg-accent'}`} />

      {/* Image */}
      <div className="relative bg-cream border-b-2 border-ink aspect-[3/4] overflow-hidden">
        <img
          src={resolveImage(sticker.image, AVATAR_URL(sticker.playerName))}
          alt={sticker.playerName}
          className="w-full h-full object-cover sticker-card-inner"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 bg-ink text-paper font-mono text-xs px-2 py-0.5 border border-paper/20">
          #{sticker.number}
        </div>
        <div className="absolute top-2 right-2">
          <span className={sticker.type === 'have' ? 'badge-have' : 'badge-want'}>
            {sticker.type === 'have' ? 'TENGO' : 'BUSCO'}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`${meta.cls} badge`}>{meta.label}</span>
        </div>

        {/* Wishlist quick-add — only on "have" stickers from others */}
        {!isOwn && sticker.type === 'have' && (
          <button
            onClick={handleWishlist}
            disabled={wishlisted || wishLoading}
            title={wishlisted ? 'En tu wishlist' : 'Añadir a wishlist'}
            className={`absolute bottom-2 right-2 w-7 h-7 border-2 flex items-center justify-center
                         transition-colors duration-150
                         ${wishlisted
                           ? 'bg-gold border-gold text-ink'
                           : 'bg-paper/80 border-ink hover:bg-gold hover:border-gold text-ink'}`}
          >
            <svg className="w-3.5 h-3.5" fill={wishlisted ? 'currentColor' : 'none'}
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 gap-2">
        <div>
          <h3 className="font-display text-lg sm:text-xl tracking-wider leading-tight line-clamp-1">
            {sticker.playerName.toUpperCase()}
          </h3>
          <p className="font-mono text-xs text-muted mt-0.5 truncate">
            {sticker.team}{sticker.section && ` · ${sticker.section}`}
          </p>
        </div>

        {sticker.notes && (
          <p className="font-body text-xs text-muted line-clamp-2 italic">"{sticker.notes}"</p>
        )}

        {sticker.owner && (
          <div className="mt-auto pt-2 border-t border-ink/10 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/profile/${sticker.owner._id}`}
                className="font-body text-xs font-semibold hover:text-accent transition-colors truncate block">
                {sticker.owner.name}
              </Link>
              <p className="font-mono text-xs text-muted truncate">{sticker.owner.university}</p>
              <StarRating value={sticker.owner.averageRating || 0}
                totalRatings={sticker.owner.totalRatings} size="sm" />
            </div>
            {!isOwn && (
              <button onClick={handleChat}
                className="shrink-0 w-8 h-8 bg-ink text-paper border-2 border-ink
                           flex items-center justify-center hover:bg-accent transition-colors"
                title="Enviar mensaje">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
