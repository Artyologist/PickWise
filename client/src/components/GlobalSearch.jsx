import { useState, useEffect } from 'react';
import api from '../services/api';
import GlobalSearchDropdown from './GlobalSearchDropdown';
import normalizeContent from '../utils/normalizeContent';

export default function GlobalSearch() {
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) {
      setData(null);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.globalSearch(q);

        // Normalize results
        const normalized = {};
        Object.keys(res.results).forEach(cat => {
          normalized[cat] = res.results[cat].map(normalizeContent);
        });

        setData(normalized);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative group/search w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search movies, games, books..."
          className="w-full pl-12 pr-12 py-3 bg-white/5 hover:bg-white/10 dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 rounded-2xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium backdrop-blur-md shadow-2xl"
        />
        <div className="absolute left-4 text-gray-400 group-focus-within/search:text-indigo-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>

        {q && (
          <button
            onClick={() => setQ('')}
            className="absolute right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <i className="fas fa-times-circle" />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[60] py-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center gap-3 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Scanning Archive</span>
        </div>
      )}

      {q.length >= 2 && !loading && data && (
        <GlobalSearchDropdown
          data={data}
          onClose={() => {
            setData(null);
            setQ('');
          }}
        />
      )}
    </div>
  );
}
