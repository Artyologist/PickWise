import { useState } from 'react';
import api from '../services/api';

export default function ReviewForm({ contentId }) {
  const token = localStorage.getItem('token');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  if (!token) {
    return <p className="text-sm text-gray-500">Login to write a review.</p>;
  }

  async function submit(e) {
    e.preventDefault();
    await api.postReview(contentId, { rating, text });
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <select
        value={rating}
        onChange={e => setRating(+e.target.value)}
        className="border rounded px-2 py-1"
      >
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={n}>{n} ★</option>
        ))}
      </select>

      <textarea
        className="w-full border rounded p-2"
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your review..."
        required
      />

      <button className="px-4 py-2 bg-indigo-600 text-white rounded">
        Submit
      </button>
    </form>
  );
}
