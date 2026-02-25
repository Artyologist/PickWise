import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GenreSelector from '../components/GenreSelector';
import ContentCard from '../components/ContentCard';
import api from '../services/api';
import { GENRES } from '../config/genres';

export default function Category() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [selected, setSelected] = useState(
    location.state?.selectedGenres || []
  );
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page]);

  const load = async () => {
    setLoading(true);
    const res = await api.search({
      category,
      genres: selected,
      page
    });
    setItems(prev => [...prev, ...res.results]);
    setLoading(false);
  };

  const onToggle = (g) => {
    setSelected(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
    setItems([]);
    setPage(1);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">{category}</h1>
      </div>

      <GenreSelector
        genres={[...GENRES.common, ...(GENRES[category] || [])]}
        selected={selected}
        onToggle={onToggle}
      />

      {items.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map(item => (
            <ContentCard
              key={item._id}
              item={normalizeContent(item)}
            />
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">No items found matching your criteria.</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
}
