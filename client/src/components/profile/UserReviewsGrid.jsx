import { Link } from 'react-router-dom';
import StarRating from '../StarRating';


export default function UserReviewsGrid({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-500">You haven't added any reviews yet.</p>
        <Link to="/" className="text-indigo-600 font-medium hover:underline mt-2 inline-block">
          Start exploring
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        Recent Reviews
        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{reviews.length}</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reviews.map(r => (
          <Link
            key={r._id}
            to={`/content/${r.content._id}`}
            className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            {/* Split layout: Poster + Content */}
            <div className="flex h-32">
              <div className="w-24 shrink-0 bg-gray-200">
                <img
                  src={r.content.posterUrl || "/placeholder-poster.png"}
                  alt={r.content.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-poster.png";
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="p-4 flex flex-col justify-center flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition">
                  {r.content.title}
                </h3>
                <div className="mt-1">
                  <StarRating value={r.rating} size={4} />
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Review Text */}
            {r.text && (
              <div className="px-4 pb-4 pt-1">
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 line-clamp-2 italic">
                  "{r.text}"
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
