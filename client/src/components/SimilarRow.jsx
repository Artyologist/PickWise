import { Link } from 'react-router-dom';

export default function SimilarRow({ items }) {
  if (!items.length) return null;

  return (
    <div>
      <h3>You may also like</h3>
      <div className="row">
        {items.map(i => (
          <Link key={i._id} to={`/content/${i._id}`}>
            <img src={i.posterUrl} alt={i.title} />
            <p>{i.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
