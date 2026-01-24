import { Link } from 'react-router-dom';
import RatingBadge from './RatingBadge';

export default function GlobalSearchDropdown({ data, onClose }) {
  if (!data) return null;

  return (
    <div className="absolute z-50 w-full bg-white shadow-lg rounded mt-2 max-h-[70vh] overflow-y-auto">
      {Object.entries(data).map(([category, items]) =>
        items.length ? (
          <div key={category} className="border-b last:border-b-0 p-3">
            {/* Category header */}
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold capitalize">{category}</h4>
              <Link
                to={`/search/${category}`}
                className="text-sm text-indigo-600"
                onClick={onClose}
              >
                See all →
              </Link>
            </div>

            {/* Items */}
            {items.map(item => (
              <Link
                key={item._id}
                to={`/content/${item._id}`}
                onClick={onClose}
                className="flex gap-3 py-2 px-2 rounded hover:bg-gray-100"
              >
                {/* Poster */}
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-10 h-14 object-cover rounded bg-gray-200"
                />

                {/* Info */}
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-tight">
                    {item.title}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.year}</span>

                    {/* ✅ RATING WITH LOGO */}
                    {(item.ratings || []).map(r => (
                      <RatingBadge
                        key={r.source}
                        source={r.source}
                        value={r.value}
                      />
                    ))}
                  </div>

                  {/* Optional description preview */}
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : null
      )}
    </div>
  );
}
