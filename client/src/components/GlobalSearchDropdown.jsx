import { Link, useNavigate } from 'react-router-dom';
import RatingBadge from './RatingBadge';
import api from '../services/api';

export default function GlobalSearchDropdown({ data, onClose }) {
  const navigate = useNavigate();

  if (!data) return null;

  const handleClick = async (e, item) => {
    // If it has a local DB _id (in raw object from normalizeContent), use it.
    const localId = item.raw?._id || item._id;

    if (localId) {
      onClose();
      return;
    }

    e.preventDefault();
    onClose();

    try {
      // Pass the RAW object to import, as it contains source/externalId
      const res = await api.importContent(item.raw || item);
      if (res.ok) {
        navigate(`/content/${res.id}`);
      }
    } catch (err) {
      console.error("Import failed", err);
    }
  };

  const totalCount = Object.values(data).reduce((sum, list) => sum + list.length, 0);

  return (
    <div className="absolute z-50 w-full mt-3 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden ring-1 ring-white/10 p-2 animate-in fade-in slide-in-from-top-4 duration-300">

      {totalCount > 0 ? (
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {Object.entries(data).map(([category, items]) =>
            items.length ? (
              <div key={category} className="mb-2 last:mb-0">
                {/* Category header */}
                <div className="flex justify-between items-center py-2 px-3 sticky top-0 bg-transparent backdrop-blur-md z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                    <h4 className="font-bold capitalize text-[10px] tracking-[0.2em] text-gray-500 dark:text-gray-400 uppercase">{category}</h4>
                  </div>
                  <Link
                    to={`/search/${category}`}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400"
                    onClick={onClose}
                  >
                    View All →
                  </Link>
                </div>

                {/* Items */}
                <div className="space-y-1">
                  {items.map(item => {
                    const localId = item.raw?._id || item._id;
                    return (
                      <Link
                        key={item.id || localId || item.externalId}
                        to={localId ? `/content/${localId}` : '#'}
                        onClick={(e) => handleClick(e, item)}
                        className="flex gap-4 p-2 rounded-2xl hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20 group"
                      >
                        {/* Poster */}
                        <div className="relative w-12 h-16 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/5">
                          <img
                            src={item.poster || item.posterUrl || "/placeholder-poster.png"}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = "/placeholder-poster.png";
                              e.target.onerror = null;
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex flex-col justify-center min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black bg-white/5 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-tighter">
                              {item.year || 'TBA'}
                            </span>

                            {/* ✅ RATING Badge */}
                            {(item.ratings || []).slice(0, 2).map(r => (
                              <RatingBadge
                                key={r.source}
                                source={r.source}
                                value={r.value}
                                className="scale-75 origin-left"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="fas fa-arrow-right text-[10px] text-indigo-500" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="text-4xl text-gray-700">🔍</div>
          <p className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Intel records not found</p>
          <p className="text-xs text-gray-400">Try adjusting your spectral resonance (query).</p>
        </div>
      )}

      {/* FOOTER */}
      <div className="p-3 bg-indigo-600/5 mt-2 rounded-2xl border border-indigo-500/10">
        <p className="text-[10px] font-bold text-center text-gray-500 uppercase tracking-widest leading-none">
          Searching across <span className="text-indigo-400">10,000+</span> Archive Entries
        </p>
      </div>
    </div>
  );
}
