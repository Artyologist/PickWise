import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import GenreSelector from '../components/GenreSelector';
import HorizontalScroller from '../components/content/HorizontalScroller';
import api from '../services/api';
import { GENRES } from '../config/genres';
import normalizeContent from '../utils/normalizeContent';

const CATEGORY_LABELS = {
  movie: 'Movies',
  tv: 'TV Series',
  anime: 'Anime',
  manga: 'Manga',
  novel: 'Novels',
  comic: 'Comics',
  videogame: 'Video Games',
  documentary: 'Documentaries'
};

const SESSION_KEY = 'pickwise_home_state';

function saveSession(genres, results) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ genres, results }));
  } catch (_) { }
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export default function Home() {
  const [params, setParams] = useSearchParams();

  const initialGenres = params.get('genres')
    ? params.get('genres').split(',')
    : [];

  // Restore from sessionStorage if available, otherwise use URL params
  const session = loadSession();
  const [selected, setSelected] = useState(session?.genres ?? initialGenres);
  const [heroItem, setHeroItem] = useState(null);
  const [intelligence, setIntelligence] = useState(session?.results ?? null);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(!!session?.results);

  const onToggle = (g) => {
    setSelected(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
    // Clear cached results — they no longer match the new genre selection
    setIntelligence(null);
    setSynced(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) { }
  };

  // Page load: fetch hero only
  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await api.homeSearch({ genres: [], sync: false });
        const trending = (res.trending || []).map(normalizeContent);
        if (trending.length) setHeroItem(trending[0]);
      } catch (e) {
        console.error('Hero fetch failed:', e);
      }
    };
    loadHero();
  }, []);

  // Keep URL in sync with selected genres
  useEffect(() => {
    if (selected.length) {
      setParams({ genres: selected.join(',') });
    } else {
      setParams({});
    }
  }, [selected, setParams]);

  // Intelligence Sync — only on button click
  const runIntelligence = async () => {
    if (loading) return;
    setLoading(true);
    setIntelligence(null);
    try {
      const res = await api.homeSearch({ genres: selected, sync: true });
      const normalizedCategories = {};
      for (const [key, items] of Object.entries(res.results || {})) {
        const mapped = items.map(normalizeContent).filter(i => i.posterUrl);
        if (mapped.length > 0) normalizedCategories[key] = mapped;
      }
      setIntelligence(normalizedCategories);
      setSynced(true);
      // Persist to session so back-navigation restores everything
      saveSession(selected, normalizedCategories);
    } catch (e) {
      console.error('Intelligence sync failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const hasResults = intelligence && Object.keys(intelligence).length > 0;

  return (
    <div className="bg-gray-950 min-h-screen text-white">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      {heroItem ? (
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={heroItem.posterUrl}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000";
                e.target.onerror = null;
              }}
              className="w-full h-full object-cover blur-2xl opacity-30 scale-110"
              alt="Hero Backdrop"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
          </div>

          <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start">
            <div className="flex flex-col mb-3">
              <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-2 animate-pulse">
                Discover Your Obsession
              </div>
              <div className="bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit border border-indigo-500/30">
                #1 Trending Now
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-3 tracking-tighter leading-none max-w-2xl">
              {heroItem.title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-xl mb-6 font-medium italic leading-relaxed line-clamp-2 sm:line-clamp-none">
              "{heroItem.shortDescription?.slice(0, 140) || 'The ultimate cross-media discovery platform.'}"
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.location.href = `/content/${heroItem.id}`}
                className="px-6 py-3 bg-white text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] text-sm"
              >
                View Details
              </button>
              <button
                onClick={() => document.getElementById('intelligence-panel').scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/10 text-sm"
              >
                Explore Content ↓
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[35vh] flex flex-col items-center justify-center text-center px-4 pt-16">
          <div className="text-indigo-400 text-sm font-black uppercase tracking-[0.8em] mb-4 animate-pulse">
            Discover Your Obsession
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">PICKWISE</h1>
        </div>
      )}

      {/* ── INTELLIGENCE PANEL ────────────────────────────────────────────── */}
      <div
        id="intelligence-panel"
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-20 space-y-10 sm:space-y-12"
      >

        {/* Genre Selector + Button */}
        <div className={`bg-white/5 p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/10 backdrop-blur-3xl relative z-20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] ${heroItem ? 'lg:-mt-24' : 'mt-4'}`}>
          <div className="flex flex-col lg:flex-row gap-8 items-end">
            <div className="flex-1 w-full">
              <GenreSelector
                genres={GENRES.common}
                selected={selected}
                onToggle={onToggle}
              />
            </div>
            <button
              onClick={runIntelligence}
              disabled={loading}
              className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black rounded-[2rem] shadow-[0_20px_40px_rgba(79,70,229,0.3)] transition-all w-full lg:w-auto transform hover:-translate-y-1 active:translate-y-0 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 group border border-indigo-400/30 shrink-0"
            >
              {loading ? (
                <>
                  <span>Fetching Intelligence...</span>
                  <i className="fas fa-circle-notch fa-spin text-indigo-200" />
                </>
              ) : (
                <>
                  <span>Update Intelligence</span>
                  <i className="fas fa-brain group-hover:scale-110 transition-transform duration-500 text-indigo-200" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-12 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-6 w-40 bg-white/10 rounded-xl mb-6" />
                <div className="flex gap-4 overflow-hidden">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="shrink-0 w-40 h-60 bg-white/5 rounded-2xl border border-white/5" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Intelligence Results */}
        {!loading && hasResults && (
          <div className="space-y-14">
            {Object.entries(intelligence).map(([category, items]) => (
              <section key={category} className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                      {CATEGORY_LABELS[category] || category}
                    </h2>
                    <div className="w-8 h-0.5 bg-indigo-500 rounded-full mt-2" />
                  </div>
                  <Link
                    to={`/${category}`}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                  >
                    Explore All →
                  </Link>
                </div>
                <HorizontalScroller items={items} />
              </section>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && synced && !hasResults && (
          <div className="text-center py-24 space-y-4">
            <div className="text-5xl">🔍</div>
            <h3 className="text-xl font-black">No results found</h3>
            <p className="text-gray-500">Try different genres or broaden your selection.</p>
          </div>
        )}

      </div>
    </div>
  );
}
