import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import GenreSelector from '../components/GenreSelector';
import ContentCard from '../components/ContentCard';
import api from '../services/api';
import { GENRES } from '../config/genres';
import normalizeContent from '../utils/normalizeContent';

import mangaBg from '../assets/manga-bg.jpg';

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
  const [totalPages, setTotalPages] = useState(parsed?.totalPages || 1);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef(null);

  const onToggle = (g) => {
    setSelected(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
  };

  const fetchData = async (reset = false) => {
    if (!reset && (page > totalPages || loading)) return;

    setLoading(true);

    try {
      const res = await api.search({
        category,
        genres: selected,
        page: reset ? 1 : page
      });

      const normalized = (res.results || []).map(normalizeContent);

      if (res.totalPages) setTotalPages(res.totalPages);

      // 💡 If we get fewer items than requested or 0 items, stop fetching
      if (normalized.length === 0 && !reset) {
        setTotalPages(page);
      }

      setResults(prev =>
        reset ? normalized : [...prev, ...normalized]
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loading, page, totalPages]);

  // 🔁 Fetch when page increases
  useEffect(() => {
    if (page > 1) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 💾 Save state
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ genres: selected, results, page, totalPages })
    );
  }, [selected, results, page, totalPages]);

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

  const CATEGORY_WALLPAPERS = {
    movie: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=2000",
    tv: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=2000",
    videogame: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000",
    anime: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&q=80&w=2000",
    manga: mangaBg,
    novel: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000",
    comic: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=2000",
    documentary: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=2000"
  };

  const bg = CATEGORY_WALLPAPERS[category] || CATEGORY_WALLPAPERS.movie;

  return (
    <div className="space-y-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* 🏞️ IMMERSIVE CATEGORY HERO */}
      <div className="relative h-[250px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={bg} className="w-full h-full object-cover" alt="category background" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 to-transparent dark:from-slate-950 dark:via-slate-950/60"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-10">
          <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:underline"
            >
              ← Back
            </button>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black capitalize text-gray-900 dark:text-white tracking-tighter leading-none">
            {category || 'Discovery'}
          </h1>
          <p className="text-sm font-bold text-gray-500 dark:text-slate-400 mt-2 uppercase tracking-[0.3em]">
            Exploration results filtered for you
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* 🎯 CATEGORY GENRES */}
        {category && GENRES[category] && (
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <div className="flex-1 w-full">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 font-mono flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-500" />
                  Filter by genre spectrum
                </h2>
                <GenreSelector
                  genres={GENRES[category]}
                  selected={selected}
                  onToggle={onToggle}
                />
              </div>

              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-3xl shadow-lg transition-all w-full lg:w-auto transform hover:-translate-y-1 active:translate-y-0 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group border border-indigo-400/30"
              >
                <span>{loading ? 'Scanning...' : 'Update Intelligence'}</span>
                <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700 text-indigo-200`} />
              </button>
            </div>
          </div>
        )}

        {/* 🧩 RESULTS */}
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-indigo-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Results</h2>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {results.length} Matches Detected
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
              {results.map((item, index) => (
                <ContentCard
                  key={`${item.id || item._id}-${index}`}
                  item={normalizeContent(item)}
                />
              ))}
            </div>
          ) : !loading && (
            <div className="text-center py-32 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800">
              <p className="text-gray-400 font-black uppercase tracking-widest">Intelligence record not found for this spectrum.</p>
            </div>
          )}
        </div>

        {/* 👇 Infinite scroll trigger */}
        {page < totalPages && (
          <div ref={loaderRef} className="h-10" />
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Scanning Archive</p>
          </div>
        )}
      </div>
    </div>
  );
}
