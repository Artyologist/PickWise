import { useState } from 'react';
import api from '../services/api';

export default function ReviewForm({ contentId }) {
  const token = localStorage.getItem('token');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(10); // Scale of 10 for more precision
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-center">
        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Authentication required to contribute intelligence</p>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.postReview(contentId, { rating, text });
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Intelligence Rating</label>
        <div className="flex gap-1">
          {[...Array(10)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg font-black text-[10px] sm:text-xs transition-all ${rating >= (i + 1)
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="w-full bg-gray-50 dark:bg-slate-800/50 border-none rounded-[2rem] p-6 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none min-h-[120px] placeholder:text-slate-400"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share your synthesis of this experience..."
        required
      />

      <button
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
      >
        {loading ? 'Submitting intelligence...' : 'Publish Review'}
      </button>
    </form>
  );
}
