const axios = require('axios');
const slugify = require('slugify');

const GOOGLE_BOOKS_KEY = process.env.GOOGLE_BOOKS_KEY;
const BASE = 'https://www.googleapis.com/books/v1/volumes';

async function fetchBooks({ page = 1, type = 'novel', genres = [] }) {
  const startIndex = (page - 1) * 12;
  let query = type === 'comic' ? 'subject:comics' : 'subject:fiction';
  if (genres.length) query += `+subject:${genres[0]}`;

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
        genres: info.categories || [],
        shortDescription: info.description?.slice(0, 300),
        year: info.publishedDate?.slice(0, 4),
        posterUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
        ratings: info.averageRating
          ? [{ source: 'google_books', value: String(info.averageRating) }]
          : [],
        popularityScore: info.ratingsCount || 0,
        source: 'google_books',
        externalId: String(b.id),
        sources: [{ name: 'google_books', externalId: String(b.id) }]
      };
    }),
    page,
    totalPages: page + 1 // Google Books has no true total
  };
}


async function fetchGoogleBookDetails(id) {
  if (!GOOGLE_BOOKS_KEY) return null;

  try {
    const res = await axios.get(`${BASE}/${id}`, { params: { key: GOOGLE_BOOKS_KEY } });
    const info = res.data.volumeInfo;

    return {
      subtitle: info.subtitle,
      authors: info.authors || [], // Array of strings
      publisher: info.publisher,
      publishedDate: info.publishedDate,
      description: info.description,
      pageCount: info.pageCount,
      categories: info.categories,
      genres: info.categories,
      
      averageRating: info.averageRating,
      ratingCount: info.ratingsCount,
      
      // Dimensions
      dimensions: info.dimensions, // { height, width, thickness }
      
      // Preview
      previewLink: info.previewLink,
      infoLink: info.infoLink,
      
      // Identifiers
      industryIdentifiers: info.industryIdentifiers, // [{ type: 'ISBN_13', identifier: ... }]
      
      // Images (High res if available)
      imageLinks: info.imageLinks, 
      
      // Rating (Deep)
      maturityRating: info.maturityRating,
      language: info.language,
      selfLink: res.data.selfLink,
      
      // Additional
      pageCount: info.pageCount,
      printType: info.printType,
      mainCategory: info.mainCategory,
    };
  } catch (error) {
    console.error(`Google Books Detail Fetch Error [${id}]:`, error.message);
    return null;
  }
}


async function searchBooks(query, type = 'novel') {
  if (!GOOGLE_BOOKS_KEY) return [];
  const q = `${query} subject:${type === 'comic' ? 'comics' : 'fiction'}`;
  
  const res = await axios.get(BASE, {
    params: { q, maxResults: 10, key: GOOGLE_BOOKS_KEY, printType: 'books' }
  });

  return (res.data.items || []).map(b => {
      const info = b.volumeInfo || {};
      return {
        title: info.title,
        slug: slugify(info.title || 'book', { lower: true }),
        category: type === 'comic' ? 'comic' : 'novel',
        genres: info.categories || [],
        shortDescription: info.description?.slice(0, 300),
        year: info.publishedDate?.slice(0, 4),
        posterUrl: info.imageLinks?.thumbnail?.replace('http:', 'https:'),
        ratings: info.averageRating ? [{ source: 'google_books', value: String(info.averageRating) }] : [],
        popularityScore: info.ratingsCount || 0,
        source: 'google_books',
        externalId: String(b.id),
        sources: [{ name: 'google_books', externalId: String(b.id) }]
      };
    });
}

module.exports = { fetchBooks, fetchGoogleBookDetails, searchBooks };
