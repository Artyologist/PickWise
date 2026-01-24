import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import GenreSelector from '../components/GenreSelector';
import ContentCard from '../components/ContentCard';
import api from '../services/api';
import { GENRES } from '../config/genres';
import normalizeContent from '../utils/normalizeContent';

export default function SearchResults() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const STORAGE_KEY = `search:${category}`;

  const saved = sessionStorage.getItem(STORAGE_KEY);
  const parsed = saved ? JSON.parse(saved) : null;

  const [selected, setSelected] = useState(
    location.state?.genres || parsed?.genres || []
  );
  const [results, setResults] = useState(parsed?.results || []);
  const [page, setPage] = useState(parsed?.page || 1);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);

  const onToggle = (g) => {
    setSelected(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  };

  const fetchData = async (reset = false) => {
    setLoading(true);

    const res = await api.search({
      category,
      genres: selected,
      page: reset ? 1 : page
    });

    const normalized = (res.results || []).map(normalizeContent);

    setResults(prev =>
      reset ? normalized : [...prev, ...normalized]
    );

    setLoading(false);
  };

  // 🔁 Genre / category change
  useEffect(() => {
    setPage(1);
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, category]);

  // 🔁 Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loading]);

  // 🔁 Fetch when page increases
  useEffect(() => {
    if (page > 1) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 💾 Save state
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ genres: selected, results, page })
    );
  }, [selected, results, page]);

  // 🔁 Restore scroll
  useEffect(() => {
    const y = sessionStorage.getItem(`${STORAGE_KEY}:scroll`);
    if (y) window.scrollTo(0, +y);

    return () =>
      sessionStorage.setItem(
        `${STORAGE_KEY}:scroll`,
        window.scrollY
      );
  }, []);

  return (
    <div className="space-y-6">

      {/* 🔙 BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-indigo-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold capitalize">
        {category} Results
      </h1>

      {/* 🎯 CATEGORY GENRES */}
      {GENRES[category] && (
        <GenreSelector
          genres={GENRES[category]}
          selected={selected}
          onToggle={onToggle}
        />
      )}

      {/* 🧩 RESULTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map(item => (
          <div key={item.id || item._id}>
            <ContentCard item={item} />
          </div>
        ))}
      </div>

      {/* 👇 Infinite scroll trigger */}
      <div ref={loaderRef} className="h-10" />

      {loading && <p>Loading...</p>}
    </div>
  );
}
