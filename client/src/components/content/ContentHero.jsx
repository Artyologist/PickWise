import RatingBadge from '../RatingBadge';

export default function ContentHero({ item }) {
  const backdrop = item.backdropUrl || item.posterUrl;

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 mb-12 min-h-[500px] flex items-end overflow-hidden">
      {/* BACKGROUND BACKDROP */}
      <div className="absolute inset-0 z-0">
        <img
          src={backdrop}
          className="w-full h-full object-cover scale-105 blur-[2px] opacity-40 dark:opacity-30"
          alt="backdrop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-slate-950 dark:via-slate-950/80"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-12">
        <div className="grid md:grid-cols-[280px_1fr] gap-10 items-end">
          {/* POSTER */}
          <div className="hidden md:block">
            <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
              <img
                src={item.poster || item.posterUrl || "/placeholder-poster.png"}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/placeholder-poster.png";
                  e.target.onerror = null;
                }}
              />
            </div>
          </div>

          {/* INFO */}
          <div className="space-y-6 pb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {item.category}
                </span>
                <span className="text-sm font-bold text-gray-500 dark:text-slate-400">
                  {item.year}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter">
                {item.title}
              </h1>
            </div>

            <div className="flex gap-3 flex-wrap">
              {item.ratings?.map(r => (
                <RatingBadge
                  key={r.source}
                  source={r.source}
                  value={r.value}
                />
              ))}
            </div>

            <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl leading-relaxed font-medium line-clamp-3">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

