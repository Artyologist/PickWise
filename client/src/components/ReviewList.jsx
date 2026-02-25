import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReviewList({ contentId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const r = await api.getReviews(contentId);
        setReviews(r?.reviews || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [contentId]);

  if (loading) return (
    <div className="py-10 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 dark:bg-slate-800/50 rounded-3xl animate-pulse"></div>)}
    </div>
  );

  if (!reviews.length) {
    return (
      <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[2rem]">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No intelligence records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((r, idx) => (
        <div
          key={r._id || idx}
          className={`relative bg-white dark:bg-slate-900 border ${r.isInternal ? 'border-indigo-500/30' : 'border-gray-100 dark:border-slate-800'} p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group overflow-hidden`}
        >
          {r.isInternal && (
            <div className="absolute top-0 right-0">
              <div className="bg-indigo-600 text-white text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-bl-2xl shadow-lg">
                PICKWISE ORIGINAL
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${r.isInternal ? 'bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-indigo-100 dark:bg-indigo-900/30'} flex items-center justify-center font-black ${r.isInternal ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'} overflow-hidden`}>
                {r.user?.profileImage ? (
                  <img src={r.user.profileImage} alt={r.user.username} className="w-full h-full object-cover" />
                ) : (
                  r.user?.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1">
                  {r.user?.username || 'Observer'}
                  {r.isInternal && <span className="ml-2 text-[10px] text-indigo-500">✓</span>}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${r.isInternal ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {r.source || 'Standard Intelligence'}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border ${r.isInternal ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-500/10' : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-500/10'}`}>
              <span className="text-xs">{r.isInternal ? '⭐' : '🔗'}</span>
              <span className={`text-xs font-black ${r.isInternal ? 'text-indigo-700 dark:text-indigo-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {r.rating || 'N/A'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">/10</span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-line">
            {r.text}
          </p>

          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/50 flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {r.isInternal
                ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : "External Intelligence Sync"
              }
            </p>
            {r.url ? (
              <a href={r.url} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Read Full Review →</a>
            ) : (
              <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Helpful?</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
