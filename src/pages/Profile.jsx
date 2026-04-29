import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';
import StickerCard from '../components/StickerCard.jsx';

export default function Profile() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const targetId = userId || me?._id;
  const isOwn = targetId === me?._id;

  const [profile, setProfile] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingSuccess, setRatingSuccess] = useState('');
  const [tab, setTab] = useState('have');

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);

    Promise.all([
      api.get(`/auth/profile/${targetId}`),
      api.get(`/stickers?page=1&limit=50`).then(({ data }) =>
        data.stickers.filter((s) => s.owner?._id === targetId)
      ),
    ])
      .then(([profileRes, stickerList]) => {
        setProfile(profileRes.data);
        setStickers(stickerList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleRate = async (rating) => {
    try {
      const { data } = await api.post(`/auth/rate/${targetId}`, { rating });
      setProfile((p) => ({ ...p, averageRating: data.averageRating, totalRatings: data.totalRatings }));
      setRatingSuccess('¡Calificación enviada!');
      setTimeout(() => setRatingSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = stickers.filter((s) => s.type === tab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-ink border-t-accent animate-spin" />
      </div>
    );
  }

  if (!profile) return <p className="text-center py-12 font-mono text-muted">Usuario no encontrado</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      {/* Profile header */}
      <div className="card p-6 mb-8 flex flex-col sm:flex-row gap-6 items-start">
        {/* Avatar */}
        <div className="w-20 h-20 shrink-0 bg-ink text-paper border-2 border-ink flex items-center justify-center">
          <span className="font-display text-5xl leading-none">
            {profile.name[0].toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-4xl tracking-widest">{profile.name.toUpperCase()}</h1>
              <p className="font-mono text-sm text-muted mt-0.5">{profile.university}</p>
            </div>
            <div className="flex gap-3 text-center">
              <Stat label="Láminas" value={stickers.length} />
              <Stat label="Intercambios" value={profile.successfulTrades || 0} />
            </div>
          </div>

          {profile.bio && (
            <p className="font-body text-sm text-muted mt-3 max-w-lg">{profile.bio}</p>
          )}

          {/* Rating */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <StarRating
              value={profile.averageRating || 0}
              totalRatings={profile.totalRatings}
              size="lg"
            />
            {!isOwn && (
              <div>
                <p className="font-mono text-xs text-muted mb-1 tracking-widest">TU CALIFICACIÓN:</p>
                <StarRating value={0} onChange={handleRate} size="md" />
              </div>
            )}
            {ratingSuccess && (
              <span className="font-mono text-xs text-accent">{ratingSuccess}</span>
            )}
          </div>
        </div>
      </div>

      {/* Sticker tabs */}
      <div className="flex gap-0 mb-6 border-2 border-ink w-fit">
        {[
          { value: 'have', label: 'TENGO' },
          { value: 'want', label: 'BUSCO' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-8 py-3 font-display text-xl tracking-widest border-r-2 border-ink last:border-r-0
                         transition-colors duration-150
                         ${tab === value
                           ? value === 'have' ? 'bg-ink text-paper' : 'bg-accent text-paper'
                           : 'bg-paper text-muted hover:bg-cream'
                         }`}
          >
            {label}
            <span className="ml-2 font-mono text-xs">
              ({stickers.filter((s) => s.type === value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-ink/20">
          <p className="font-mono text-sm text-muted">
            {isOwn
              ? `No has publicado láminas en "${tab === 'have' ? 'TENGO' : 'BUSCO'}" todavía.`
              : `Este usuario no tiene láminas en "${tab === 'have' ? 'TENGO' : 'BUSCO'}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((s) => <StickerCard key={s._id} sticker={s} />)}
        </div>
      )}
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="border-2 border-ink px-4 py-2 min-w-[70px]">
    <p className="font-display text-2xl leading-none text-center">{value}</p>
    <p className="font-mono text-xs text-muted text-center mt-0.5">{label}</p>
  </div>
);
