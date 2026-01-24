import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GenreSelector from '../components/GenreSelector';
import CategorySection from '../components/CategorySection';
import api from '../services/api';
import { GENRES } from '../config/genres';
import normalizeContent from '../utils/normalizeContent';

export default function Home() {
  const [params, setParams] = useSearchParams();

  const initialGenres = params.get('genres')
    ? params.get('genres').split(',')
    : [];

  const [selected, setSelected] = useState(initialGenres);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const onToggle = (g) => {
    setSelected(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  };

  const search = async () => {
    try {
      setLoading(true);
      const res = await api.homeSearch(selected);
     setData(
  Object.fromEntries(
    Object.entries(res.results).map(([k, v]) => [
      k,
      v.map(normalizeContent)
    ])
  )
);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 keep URL in sync
  useEffect(() => {
    if (selected.length) {
      setParams({ genres: selected.join(',') });
    } else {
      setParams({});
    }
  }, [selected, setParams]);

  // 🔁 auto search on back navigation
  useEffect(() => {
    if (selected.length) search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <GenreSelector
        genres={GENRES.common}
        selected={selected}
        onToggle={onToggle}
      />

      <button
        onClick={search}
        className="px-5 py-2 bg-indigo-600 text-white rounded"
      >
        Search
      </button>

      {loading && <p>Loading...</p>}

      {data &&
        Object.entries(data).map(([category, items]) =>
          items.length ? (
            <CategorySection
              key={category}
              category={category}
              items={items}
              selectedGenres={selected}
            />
          ) : null
        )}
    </div>
  );
}
