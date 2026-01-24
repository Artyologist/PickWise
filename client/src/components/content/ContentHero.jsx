import RatingBadge from '../RatingBadge';

export default function ContentHero({ item }) {
  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-8">
      <img
        src={item.posterUrl}
        alt={item.title}
        className="rounded-lg shadow-lg"
      />

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{item.title}</h1>

        <div className="text-sm text-gray-500">
          {item.year} · {item.category}
        </div>

        <div className="flex gap-2 flex-wrap">
          {item.ratings.map(r => (
            <RatingBadge
              key={r.source}
              source={r.source}
              value={r.value}
            />
          ))}
        </div>

        <p className="text-gray-700">
  {item.description}
</p>

      </div>
    </div>
  );
}
