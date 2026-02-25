const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');
require('dotenv').config();

const novels = [
  {
    title: 'Harry Potter and the Philosopher\'s Stone',
    year: '1997',
    posterUrl: 'https://m.media-amazon.com/images/I/81YOuOGFCJL._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Fantasy', 'Adventure', 'Young Adult'],
    ratingCount: 10000,
    averageRating: 9.8,
    popularityScore: 5000,
    description: 'Harry Potter thinks he is an ordinary boy - until he is rescued by an owl, taken to Hogwarts School of Witchcraft and Wizardry, learns to play Quidditch and does battle in a deadly duel.',
    source: 'google_books',
    externalId: 'harry_potter_1'
  },
  {
    title: 'A Game of Thrones',
    year: '1996',
    posterUrl: 'https://m.media-amazon.com/images/I/91dSMhdIzTL._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Fantasy', 'Political', 'Drama', 'Action'],
    ratingCount: 8000,
    averageRating: 9.5,
    popularityScore: 4500,
    description: 'Summers span decades. Winter can last a lifetime. And the struggle for the Iron Throne begins.',
    source: 'google_books',
    externalId: 'game_of_thrones_1'
  },
  {
    title: 'Dune',
    year: '1965',
    posterUrl: 'https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Sci-Fi', 'Adventure', 'Classic'],
    ratingCount: 6000,
    averageRating: 9.2,
    popularityScore: 4000,
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    source: 'google_books',
    externalId: 'dune_1'
  },
  {
    title: 'The Maze Runner',
    year: '2009',
    posterUrl: 'https://m.media-amazon.com/images/I/91J7kRjHnOL._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Sci-Fi', 'Action', 'Young Adult'],
    ratingCount: 4000,
    averageRating: 8.5,
    popularityScore: 3500,
    description: 'When Thomas wakes up in the lift, the only thing he can remember is his name. He’s surrounded by strangers—boys whose memories are also gone.',
    source: 'google_books',
    externalId: 'maze_runner_1'
  },
  {
    title: 'The Hunger Games',
    year: '2008',
    posterUrl: 'https://m.media-amazon.com/images/I/61I24wOsn8L._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Sci-Fi', 'Action', 'Young Adult'],
    ratingCount: 15000,
    averageRating: 9.6,
    popularityScore: 4800,
    description: 'In the ruins of a place once known as North America lies the nation of Panem, a shining Capitol surrounded by twelve outlying districts.',
    source: 'google_books',
    externalId: 'hunger_games_1'
  },
  {
    title: 'It',
    year: '1986',
    posterUrl: 'https://m.media-amazon.com/images/I/71q5W+2iCwL._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Horror', 'Thriller'],
    ratingCount: 3000,
    averageRating: 8.8,
    popularityScore: 3000,
    description: 'The story follows the experiences of seven children as they are terrorized by an evil entity that exploits the fears of its victims to disguise itself while hunting its prey.',
    source: 'google_books',
    externalId: 'it_king'
  },
  {
    title: 'The Shining',
    year: '1977',
    posterUrl: 'https://m.media-amazon.com/images/I/81R2N4PRuUL._AC_UF1000,1000_QL80_.jpg',
    category: 'novel',
    genres: ['Horror', 'Thriller', 'Classic'],
    ratingCount: 2500,
    averageRating: 9.0,
    popularityScore: 2900,
    description: 'Jack Torrance\'s new job at the Overlook Hotel is the perfect chance for a fresh start. As the off-season caretaker at the atmospheric old hotel, he\'ll have plenty of time to spend reconnecting with his family and working on his writing.',
    source: 'google_books',
    externalId: 'the_shining'
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise')
  .then(async () => {
    console.log('Seeding Popular Novels...');
    for (const item of novels) {
      await ContentItem.findOneAndUpdate(
        { source: item.source, externalId: item.externalId },
        item,
        { upsert: true, new: true }
      );
    }
    console.log('Done!');
    process.exit();
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
