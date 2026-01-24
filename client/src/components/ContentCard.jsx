import { Link } from 'react-router-dom';
import RatingBadge from './RatingBadge';

export default function ContentCard({ item }) {
  if (!item) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
      <Link to={`/content/${item.id || item._id}`}>
        {/* Poster */}
        <div className="aspect-[2/3] bg-gray-200">
          <img
            src={item.poster || item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 space-y-2">
        <Link to={`/content/${item.id || item._id}`}>

          <h3 className="text-sm font-semibold line-clamp-2">
            {item.title}
          </h3>
        </Link>

        <p className="text-xs text-gray-500">{item.year}</p>

        {/* ✅ DESCRIPTION (FIX) */}
        <p className="text-sm text-gray-700 line-clamp-2">
          {item.description}
        </p>

        {/* ✅ RATING WITH LOGO */}
        <div className="flex gap-2 flex-wrap">
          {(item.ratings || []).map(r => (
            <RatingBadge
              key={r.source}
              source={r.source}
              value={r.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
