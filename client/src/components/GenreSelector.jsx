export default function GenreSelector({ genres = [], selected = [], onToggle }) {
  if (!genres.length) {
    return (
      <div className="border rounded p-4 text-sm text-gray-500">
        No genres available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {genres.map(g => {
          const active = selected.includes(g);

          return (
            <button
              key={g}
              type="button"
              onClick={() => onToggle(g)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border
                ${active
                  ? 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] border-indigo-500 scale-105 z-10'
                  : 'bg-white/5 dark:bg-slate-800/40 text-gray-500 dark:text-gray-400 border-white/10 hover:border-white/20 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {g}
            </button>
          );
        })}
      </div>
    </div>
  );
}
