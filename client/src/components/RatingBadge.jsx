import imdb from '../assets/ratings/imdb.png';
import rt from '../assets/ratings/rotten-tomatoes.png';
import metacritic from '../assets/ratings/metacritic.png';
import mal from '../assets/ratings/mal.png';
import steam from '../assets/ratings/steam.png';

const ICONS = {
  imdb,
  rotten_tomatoes: rt,
  metacritic,
  mal,
  steam
};

export default function RatingBadge({ source, value }) {
  if (!value) return null;

  return (
    <div className="flex items-center gap-1 text-xs border rounded px-2 py-1 bg-white">
      {ICONS[source] && (
        <img
          src={ICONS[source]}
          alt={source}
          className="w-4 h-4 object-contain"
        />
      )}
      <span className="font-semibold">{value}</span>
    </div>
  );
}
