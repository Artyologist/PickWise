const axios = require('axios');
const slugify = require('slugify');

const GOOGLE_BOOKS_KEY = process.env.GOOGLE_BOOKS_KEY;
const BASE = 'https://www.googleapis.com/books/v1/volumes';

async function fetchBooks({ page = 1, type = 'novel' }) {
  const startIndex = (page - 1) * 12;
  const query = type === 'comic' ? 'subject:comics' : 'subject:fiction';

  const res = await axios.get(BASE, {
    params: {
      q: query,
      startIndex,
      maxResults: 12,
      key: GOOGLE_BOOKS_KEY,
      printType: 'books'
    }
  });

  return {
    results: (res.data.items || []).map(b => {
      const info = b.volumeInfo || {};
      return {
        title: info.title,
        slug: slugify(info.title || 'book', { lower: true }),
        category: type === 'comic' ? 'comic' : 'novel',
        genres: volumeInfo.categories || [],
        shortDescription: info.description?.slice(0, 300),
        year: info.publishedDate?.slice(0, 4),
        posterUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
        ratings: info.averageRating
          ? [{ source: 'google_books', value: String(info.averageRating) }]
          : [],
        popularityScore: info.ratingsCount || 0,
        sources: [{ name: 'google_books', externalId: b.id }]
      };
    }),
    page,
    totalPages: page + 1 // Google Books has no true total
  };
}

module.exports = { fetchBooks };
