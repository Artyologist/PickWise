import { Link } from 'react-router-dom';
import StarRating from '../StarRating';


export default function UserReviewsGrid({ reviews }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Reviews</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reviews.map(r => (
          <Link
            key={r._id}
            to={`/content/${r.content._id}`}
            className="bg-white rounded shadow hover:shadow-lg transition"
          >
            <img
              src={r.content.posterUrl}
              alt={r.content.title}
              className="rounded-t"
            />
            <div className="p-3">
              <p className="font-semibold">{r.content.title}</p>
              <StarRating value={r.rating} />


            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
