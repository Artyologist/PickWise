import { useNavigate } from 'react-router-dom';

export default function CategoryCards({ data, selectedGenres }) {
  const navigate = useNavigate();

  return Object.entries(data).map(([category, items]) => (
    <div key={category} className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold capitalize">{category}</h3>
        <button
          onClick={() =>
            navigate(`/search/${category}`, {
              state: { genres: selectedGenres }
            })
          }
          className="text-sm text-indigo-600"
        >
          See more →
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(i => (
          <ContentCard key={i._id} item={i} />
        ))}
      </div>
    </div>
  ));
}
