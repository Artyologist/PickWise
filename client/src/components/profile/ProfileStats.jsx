export default function ProfileStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Total Reviews" value={stats.totalReviews} />
      <StatCard label="Avg Rating" value={stats.averageRating || 'N/A'} />
      {stats.byCategory.map(c => (
        <StatCard
          key={c._id}
          label={c._id}
          value={c.count}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}