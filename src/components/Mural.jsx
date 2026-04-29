import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import StickerCard from './StickerCard.jsx';
import FilterBar from './FilterBar.jsx';
import PublishModal from './PublishModal.jsx';

const LIMIT = 20;

export default function Mural() {
  const navigate = useNavigate();
  const [stickers, setStickers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', type: '', university: '', rarity: '' });
  const [loading, setLoading] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const debounceRef = useRef(null);

  const fetchStickers = useCallback(async (currentFilters, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.set('search', currentFilters.search);
      if (currentFilters.type) params.set('type', currentFilters.type);
      if (currentFilters.university) params.set('university', currentFilters.university);
      if (currentFilters.rarity) params.set('rarity', currentFilters.rarity);
      params.set('page', page);
      params.set('limit', LIMIT);

      const { data } = await api.get(`/stickers?${params}`);
      setStickers(data.stickers);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching stickers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search, immediate for other filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    clearTimeout(debounceRef.current);
    if (newFilters.search !== filters.search) {
      debounceRef.current = setTimeout(() => fetchStickers(newFilters, 1), 350);
    } else {
      fetchStickers(newFilters, 1);
    }
  };

  useEffect(() => {
    fetchStickers(filters, 1);
  }, []); // eslint-disable-line

  const handleChatClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  const handlePublished = () => {
    setShowPublish(false);
    fetchStickers(filters, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-5xl sm:text-7xl tracking-widest text-ink leading-none">
            MURAL
          </h1>
          <p className="font-mono text-xs text-muted mt-1 tracking-widest">
            {pagination.total} LÁMINAS DISPONIBLES
          </p>
        </div>
        {/* Decorative strip */}
        <div className="hidden sm:flex gap-1">
          {['bg-ink', 'bg-accent', 'bg-gold', 'bg-ink'].map((c, i) => (
            <div key={i} className={`${c} w-3 h-16`} />
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onPublish={() => setShowPublish(true)}
      />

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-2 border-ink animate-pulse">
              <div className="bg-cream aspect-[3/4]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-cream rounded" />
                <div className="h-3 bg-cream rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : stickers.length === 0 ? (
        <EmptyState onPublish={() => setShowPublish(true)} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {stickers.map((sticker) => (
              <StickerCard
                key={sticker._id}
                sticker={sticker}
                onChatClick={handleChatClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchStickers(filters, i + 1)}
                  className={`w-9 h-9 border-2 border-ink font-mono text-sm transition-colors
                               ${pagination.page === i + 1
                                 ? 'bg-ink text-paper'
                                 : 'bg-paper text-ink hover:bg-cream'
                               }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Publish modal */}
      {showPublish && (
        <PublishModal
          onClose={() => setShowPublish(false)}
          onSuccess={handlePublished}
        />
      )}
    </div>
  );
}

const EmptyState = ({ onPublish }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-24 h-32 border-4 border-ink bg-cream flex items-center justify-center mb-6 shadow-card">
      <span className="font-display text-5xl text-ink/30">?</span>
    </div>
    <h2 className="font-display text-3xl tracking-widest mb-2">SIN RESULTADOS</h2>
    <p className="font-body text-sm text-muted mb-6 max-w-xs">
      No hay láminas que coincidan con tus filtros. ¡Sé el primero en publicar!
    </p>
    <button onClick={onPublish} className="btn-primary">
      PUBLICAR LÁMINA
    </button>
  </div>
);
