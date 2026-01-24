import { useState, useEffect } from 'react';
import api from '../services/api';
import GlobalSearchDropdown from './GlobalSearchDropdown';

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
        setData(res.results);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search movies, games, books..."
        className="w-full px-4 py-2 border rounded text-sm"
      />

      {loading && (
        <div className="absolute right-3 top-2 text-xs">⌛</div>
      )}

      <GlobalSearchDropdown
        data={data}
        onClose={() => setData(null)}
      />
    </div>
  );
}
