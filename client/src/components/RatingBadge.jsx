import imdb from '../assets/ratings/imdb.png';
import rt from '../assets/ratings/rotten-tomatoes.png';
import metacritic from '../assets/ratings/metacritic.png';
import mal from '../assets/ratings/mal.png';
import steam from '../assets/ratings/steam.png';
import goodreads from '../assets/ratings/goodreads.png';
import amazon from '../assets/ratings/amazon.png';
import ign from '../assets/ratings/ign.png';
import netflix from '../assets/ratings/netflix.png';
import playstation from '../assets/ratings/playstation.png';
import prime from '../assets/ratings/prime.png';
import rawg from '../assets/ratings/rawg.png';
import xbox from '../assets/ratings/xbox.png';

const ICONS = {
  imdb,
  rotten_tomatoes: rt,
  metacritic,
  mal,
  steam,
  goodreads,
  amazon,
  ign,
  netflix,
  playstation,
  prime,
  rawg,
  xbox
};

export default function RatingBadge({ source, value, small }) {
  if (!value) return null;

  return (
    <div className={`flex items-center gap-2 ${small ? 'text-sm' : 'text-base'}`}>
      {ICONS[source] ? (
        <img
          src={ICONS[source]}
          alt={source}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }}
          className={`${small ? 'w-6 h-6' : 'w-8 h-8'} object-contain brightness-95 dark:brightness-100`}
        />
      ) : null}
      <span className={`font-bold text-[10px] uppercase text-gray-500 dark:text-gray-400 tracking-wider ${ICONS[source] ? 'hidden' : ''}`}>{source.replace('_', ' ')}</span>
      <span className="font-black text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
