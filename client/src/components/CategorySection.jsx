import { Link } from 'react-router-dom';
import ContentCard from './ContentCard';

export default function CategorySection({ category, items = [], selectedGenres }) {
  // ✅ REMOVE DUPLICATES (by id or _id)
  const uniqueItems = [
    ...new Map(
      items.map(item => [
        item._id || item.id,
        item
      ])
    ).values()
  ];

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold capitalize">{category}</h2>

        <Link
          to={`/search/${category}`}
          state={{ genres: selectedGenres }}
          className="text-sm text-indigo-600"
        >
          See more →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {uniqueItems.map(item => (
          <ContentCard
            key={item._id || item.id}
            item={item}
          />
        ))}
      </div>
    </section>
  );
}
