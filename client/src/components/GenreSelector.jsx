export default function GenreSelector({ genres = [], selected = [], onToggle }) {
  if (!genres.length) {
    return (
      <div className="border rounded p-4 text-sm text-gray-500">
        No genres available
      </div>
    );
  }

  return (
    <div className="border rounded p-4">
      <p className="font-medium mb-3">Choose genres</p>

      <div className="flex flex-wrap gap-2">
        {genres.map(g => {
          const active = selected.includes(g);

          return (
            <button
              key={g}
              type="button"
              onClick={() => onToggle(g)}
              className={`px-3 py-1 rounded-full text-sm border transition
                ${active
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
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
