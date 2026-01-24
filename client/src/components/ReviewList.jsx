import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReviewList({ contentId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.getReviews(contentId).then(r => {
      setReviews(r?.reviews || []);
    });
  }, [contentId]);

  if (!reviews.length) {
    return <p className="text-gray-500">No reviews yet.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map(r => (
        <div
          key={r._id}
          className="border rounded p-3 bg-white"
        >
          <div className="text-sm font-semibold">
            ⭐ {r.rating}/5
          </div>
          <p className="text-sm">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
