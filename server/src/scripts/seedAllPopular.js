const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');
require('dotenv').config();

const items = [
  // 🎬 MOVIES
  {
    title: 'The Dark Knight',
    year: '2008',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6ixuR7j3mP3gB2mJfeas9A.jpg',
    category: 'movie',
    genres: ['Action', 'Drama', 'Thriller'],
    averageRating: 9.0, ratingCount: 25000, popularityScore: 8000,
    shortDescription: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    source: 'tmdb', externalId: '550_dk'
  },
  {
    title: 'Interstellar',
    year: '2014',
    posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6vCU67oYvbpvP.jpg',
    category: 'movie',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    averageRating: 8.7, ratingCount: 20000, popularityScore: 7500,
    shortDescription: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    source: 'tmdb', externalId: '157336'
  },
  {
    title: 'Everything Everywhere All at Once',
    year: '2022',
    posterUrl: 'https://image.tmdb.org/t/p/w500/r7XChe2Inev1o6pI0vXT9A0qyT2.jpg',
    category: 'movie',
    genres: ['Action', 'Adventure', 'Comedy', 'Sci-Fi'],
    averageRating: 8.3, ratingCount: 15000, popularityScore: 6000,
    shortDescription: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.',
    source: 'tmdb', externalId: '545611'
  },

  // 📺 TV SHOWS
  {
    title: 'Breaking Bad',
    year: '2008',
    posterUrl: 'https://image.tmdb.org/t/p/w500/ztkUQvBZ6vS9btpU3S6V9SogO9G.jpg',
    category: 'tv',
    genres: ['Drama', 'Crime', 'Thriller'],
    averageRating: 9.5, ratingCount: 30000, popularityScore: 9000,
    shortDescription: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
    source: 'tmdb', externalId: '1396_bb'
  },
  {
    title: 'Stranger Things',
    year: '2016',
    posterUrl: 'https://image.tmdb.org/t/p/w500/x2LSRm21uTExS0Ua360YpX0BovQ.jpg',
    category: 'tv',
    genres: ['Sci-Fi', 'Fantasy', 'Horror', 'Drama'],
    averageRating: 8.7, ratingCount: 25000, popularityScore: 8500,
    shortDescription: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    source: 'tmdb', externalId: '66732_st'
  },

  // 🎮 VIDEOGAMES
  {
    title: 'Elden Ring',
    year: '2022',
    posterUrl: 'https://media.rawg.io/media/games/5ec/5ec7fac0499e71ec269894452187b649.jpg',
    category: 'videogame',
    genres: ['RPG', 'Action', 'Fantasy'],
    averageRating: 9.5, ratingCount: 10000, popularityScore: 10000,
    shortDescription: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    source: 'rawg', externalId: '58175'
  },
  {
    title: 'Cyberpunk 2077',
    year: '2020',
    posterUrl: 'https://media.rawg.io/media/games/26d/26d4437715bee6013a05178f269a9944.jpg',
    category: 'videogame',
    genres: ['RPG', 'Action', 'Sci-Fi'],
    averageRating: 8.8, ratingCount: 8000, popularityScore: 9000,
    shortDescription: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
    source: 'rawg', externalId: '41494'
  },

  // 📚 NOVELS
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    year: '1997',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatv9rnqXmS7ioYJbp.jpg',
    category: 'novel',
    genres: ['Fantasy', 'Adventure'],
    ratingCount: 100000, averageRating: 9.8, popularityScore: 9800,
    shortDescription: 'The journey of an orphan boy who discovers his magical heritage on his 11th birthday and enters Hogwarts School of Witchcraft and Wizardry.',
    source: 'google_books', externalId: 'hp_1_fixed'
  },
  {
    title: 'Dune',
    year: '1965',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlvSj86pP9YpSOPfEAn65o9B.jpg',
    category: 'novel',
    genres: ['Sci-Fi', 'Adventure'],
    ratingCount: 50000, averageRating: 9.2, popularityScore: 8500,
    shortDescription: 'Set on the desert planet Arrakis, Dune is the story of political intrigue and a boy who might lead a cosmic revolution.',
    source: 'google_books', externalId: 'dune_book_fixed'
  },
  {
    title: 'The Iliad',
    year: '1997',
    posterUrl: 'https://m.media-amazon.com/images/I/91S6NXPUp7L._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Classic', 'Epic'],
    ratingCount: 500000, averageRating: 9.9, popularityScore: 10000,
    shortDescription: 'The ancient Greek epic poem attributed to Homer, set during the Trojan War.',
    source: 'custom', externalId: 'iliad_homer'
  },
  {
    title: 'A Song of Ice and Fire (GoT)',
    year: '1996',
    posterUrl: 'https://image.tmdb.org/t/p/w500/u3bZgnocS9pZ9dfvTU7P5fW8WHv.jpg',
    category: 'novel',
    genres: ['Fantasy', 'Political', 'Drama'],
    ratingCount: 120000, averageRating: 9.7, popularityScore: 9900,
    shortDescription: 'In a world where summers span decades and winters can last a lifetime, noble families battle for control of the Iron Throne.',
    source: 'google_books', externalId: 'got_book_fixed'
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise')
  .then(async () => {
    console.log('Cleaning old broken entries...');
    await ContentItem.deleteMany({ source: 'tmdb', externalId: { $in: ['550_dk', '157336', '545611'] } });
    
    console.log('Seeding High-Quality Popular Data...');
    for (const item of items) {
      await ContentItem.findOneAndUpdate(
        { externalId: item.externalId },
        item,
        { upsert: true, new: true }
      );
    }
    console.log('Done! High quality data seeded.');
    process.exit();
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
