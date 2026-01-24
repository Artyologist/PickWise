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
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 text-sm"
      >
        ← Back
      </button>

      <GenreSelector
        genres={[...GENRES.common, ...(GENRES[category] || [])]}
        selected={selected}
        onToggle={onToggle}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map(item => (
  <ContentCard
    key={item._id}
    item={normalizeContent(item)}
  />
))}
      </div>

      {loading && <p>Loading...</p>}

      <button
        onClick={() => setPage(p => p + 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Load more
      </button>
    </div>
  );
}
