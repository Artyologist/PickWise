export default function ProfileStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* General Stats */}
      <StatCard
        label="Total Contributions"
        value={stats.totalReviews || 0}
        icon="✍️"
        color="indigo"
      />
      <StatCard
        label="Global Average"
        value={stats.averageRating || '0.0'}
        icon="⭐"
        color="yellow"
      />
      <StatCard
        label="Watchlist Hits"
        value={stats.watchlistCount || 0}
        icon="🔖"
        color="green"
      />
      <StatCard
        label="IP Explored"
        value={12} // Mock for now
        icon="🚀"
        color="purple"
      />
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const themes = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20"
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col gap-4 overflow-hidden relative group transition-all duration-500 hover:shadow-xl hover:-translate-y-1`}>
      <div className="flex items-center justify-between z-10">
        <span className="text-2xl">{icon}</span>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${themes[color]}`}>Live Data</div>
      </div>

      <div className="space-y-1 z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 line-clamp-1">{label}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      </div>

      {/* Decorative accent */}
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 ${themes[color].split(' ')[0]}`}></div>
    </div>
  );
}
