import { useState } from 'react';

const Star = ({ filled, half, onClick, onHover, size = 'md' }) => {
  const sizes = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-7 h-7' };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`${sizes[size]} transition-transform duration-100 hover:scale-110 focus:outline-none`}
      aria-label="star"
    >
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <defs>
          <linearGradient id={`half-${size}`}>
            <stop offset="50%" stopColor={filled || half ? '#f0b429' : 'transparent'} />
            <stop offset="50%" stopColor={filled ? '#f0b429' : 'transparent'} />
          </linearGradient>
        </defs>
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill={filled ? '#f0b429' : half ? 'url(#half-md)' : 'transparent'}
          stroke={filled || half ? '#f0b429' : '#8a8680'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

/**
 * StarRating
 * Props:
 *  - value       número actual (0-5)
 *  - onChange    callback(rating) — si es undefined, modo lectura
 *  - size        'sm' | 'md' | 'lg'
 *  - totalRatings número de votos (opcional)
 */
export default function StarRating({ value = 0, onChange, size = 'md', totalRatings }) {
  const [hovered, setHovered] = useState(null);
  const readOnly = !onChange;
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readOnly && setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            filled={display >= star}
            half={display >= star - 0.5 && display < star}
            onClick={readOnly ? undefined : () => onChange(star)}
            onHover={readOnly ? undefined : () => setHovered(star)}
          />
        ))}
      </div>
      {totalRatings !== undefined && (
        <span className="font-mono text-xs text-muted ml-1">
          {value.toFixed(1)} ({totalRatings})
        </span>
      )}
    </div>
  );
}
