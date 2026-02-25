import { Link } from 'react-router-dom';
import RatingBadge from './RatingBadge';

export default function ContentCard({ item }) {
  if (!item) return null;

  // Use the actual aggregated PickWise Score from normalizeContent
  const score = item.pickwiseScore;

  const getBadgeStyle = (s) => {
    if (s >= 85) return "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
    if (s >= 70) return "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]";
    return "bg-slate-600 shadow-lg";
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-700 overflow-hidden flex flex-col h-full relative">

      {/* SCORE BADGE */}
      {score && (
        <div className={`absolute top-4 right-4 z-20 text-[10px] text-white font-black px-2.5 py-1.5 rounded-xl border border-white/20 backdrop-blur-md transition-transform duration-500 group-hover:scale-110 ${getBadgeStyle(score)}`}>
          {score}
        </div>
      )}

      <Link to={`/content/${item.id || item._id}`} className="relative block overflow-hidden">
        {/* Poster */}
        <div className="aspect-[2/3] bg-gray-100 dark:bg-slate-800">
          <img
            src={item.poster || item.posterUrl || "/placeholder-poster.png"}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/placeholder-poster.png";
              e.target.onerror = null; // Prevent infinite loop if placeholder also fails
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1 gap-3">
        <Link to={`/content/${item.id || item._id}`}>
          <h3 className="text-lg font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-500 transition-colors leading-tight">
            {item.title}
          </h3>
        </Link>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <span>{item.year || 'TBA'}</span>
          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
          <span className="text-indigo-500">{item.category}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
          {item.description || "Project intelligence active. Real-time data sync in progress for this title."}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800/50">
          {/* RATINGS */}
          <div className="flex gap-3 flex-wrap items-center">
            {item.averageRating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md border border-yellow-100 dark:border-yellow-500/10">
                <span className="text-xs">⭐</span>
                <span className="text-xs font-black text-yellow-700 dark:text-yellow-400">{item.averageRating}</span>
              </div>
            )}

            {(item.ratings || []).slice(0, 2).map((r, i) => (
              <RatingBadge
                key={r.source || i}
                source={r.source}
                value={r.value}
                small
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
