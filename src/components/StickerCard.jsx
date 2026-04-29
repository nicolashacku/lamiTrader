import { Link } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const RARITY_LABELS = { common: 'COMÚN', rare: 'RARA', legendary: 'LEGENDARIA' };
const RARITY_CLASSES = {
  common: 'badge-common',
  rare: 'badge-rare',
  legendary: 'badge-legendary',
};

const PLAYER_PLACEHOLDER = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0e0e0e&color=f5f0e8&size=128&bold=true&font-size=0.4`;

export default function StickerCard({ sticker, onChatClick }) {
  const { user } = useAuth();
  const isOwn = sticker.owner?._id === user?._id;

  const handleChat = async () => {
    if (isOwn || !onChatClick) return;
    try {
      const { data } = await api.post('/conversations', { otherUserId: sticker.owner._id });
      onChatClick(data._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <article className="sticker-card card group relative flex flex-col overflow-hidden">
      {/* Top accent strip */}
      <div className={`h-1 w-full ${sticker.type === 'have' ? 'bg-ink' : 'bg-accent'}`} />

      {/* Image area */}
      <div className="relative bg-cream border-b-2 border-ink aspect-[3/4] overflow-hidden">
        <img
          src={sticker.image || PLAYER_PLACEHOLDER(sticker.playerName)}
          alt={sticker.playerName}
          className="w-full h-full object-cover sticker-card-inner"
          loading="lazy"
        />
        {/* Number badge */}
        <div className="absolute top-2 left-2 bg-ink text-paper font-mono text-xs px-2 py-1 border border-paper/20">
          #{sticker.number}
        </div>
        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <span className={sticker.type === 'have' ? 'badge-have' : 'badge-want'}>
            {sticker.type === 'have' ? 'TENGO' : 'BUSCO'}
          </span>
        </div>
        {/* Rarity */}
        <div className="absolute bottom-2 left-2">
          <span className={RARITY_CLASSES[sticker.rarity]}>
            {RARITY_LABELS[sticker.rarity]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-display text-xl tracking-wider leading-tight truncate">
            {sticker.playerName.toUpperCase()}
          </h3>
          <p className="font-mono text-xs text-muted mt-0.5 truncate">
            {sticker.team}
            {sticker.section && ` · ${sticker.section}`}
          </p>
        </div>

        {sticker.notes && (
          <p className="font-body text-xs text-muted line-clamp-2 italic">
            "{sticker.notes}"
          </p>
        )}

        {/* Owner info */}
        {sticker.owner && (
          <div className="mt-auto pt-3 border-t border-ink/10 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <Link
                to={`/profile/${sticker.owner._id}`}
                className="font-body text-xs font-semibold hover:text-accent transition-colors truncate block"
              >
                {sticker.owner.name}
              </Link>
              <p className="font-mono text-xs text-muted truncate">
                {sticker.owner.university}
              </p>
              <StarRating
                value={sticker.owner.averageRating || 0}
                totalRatings={sticker.owner.totalRatings}
                size="sm"
              />
            </div>

            {!isOwn && (
              <button
                onClick={handleChat}
                className="shrink-0 w-8 h-8 bg-ink text-paper border-2 border-ink
                           flex items-center justify-center hover:bg-accent
                           transition-colors duration-150"
                title="Enviar mensaje"
              >
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
