import { useEffect, useState } from 'react';
import api from '../services/api';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import UserReviewsGrid from '../components/profile/UserReviewsGrid';
import ContentCard from '../components/ContentCard';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');

  const loadData = async () => {
    try {
      const [p, r, s, w] = await Promise.all([
        api.getMyProfile(),
        api.getMyReviews(),
        api.getMyStats(),
        api.getWatchlist()
      ]);
      setProfile(p.user);
      setReviews(r.results);
      setStats(s);
      setWatchlist(w.items || []);
    } catch (err) {
      console.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Accessing Profile</p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 max-w-6xl py-8 pb-20">
      <ProfileHeader
        user={profile}
        onUpdate={(updated) => setProfile(updated)}
      />

      <ProfileStats stats={stats} />

      {/* TABS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <TabButton
            active={activeTab === 'reviews'}
            onClick={() => setActiveTab('reviews')}
            label="Reviews"
            count={reviews.length}
          />
          <TabButton
            active={activeTab === 'watchlist'}
            onClick={() => setActiveTab('watchlist')}
            label="Watchlist"
            count={watchlist.length}
          />
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'reviews' && (
            <UserReviewsGrid reviews={reviews} />
          )}

          {activeTab === 'watchlist' && (
            watchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {watchlist.map(item => (
                  <ContentCard key={item._id} item={item.content} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="text-4xl text-gray-300">🔖</div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Your watchlist is empty</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 whitespace-nowrap ${active
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 translate-y-[-2px]'
        : 'bg-gray-50 dark:bg-slate-800 text-gray-500 hover:text-gray-800 dark:hover:text-white'
        }`}
    >
      {label}
      <span className={`px-2 py-0.5 rounded-lg text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-600'}`}>{count}</span>
    </button>
  );
}
