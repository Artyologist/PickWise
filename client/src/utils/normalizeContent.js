export default function normalizeContent(item) {

  if (!item) return null;

  const description =
    item.description ||
    item.overview ||
    item.shortDescription ||
    item.summary ||
    "";

  return {
    id: item._id,
    title: item.title,
    slug: item.slug,
    category: item.category,
    year: item.year,
    genres: item.genres || [],
    description,
    poster:
      item.posterUrl ||
      item.poster ||
      "/placeholder-poster.png",

    ratings: normalizeRatings(item),
    averageRating:
      item.averageRating ??
      extractAverageFromRatings(item.ratings),

    ratingCount: item.ratingCount ?? 0,

    relations: item.relations || {},
    raw: item
  };
}

function extractAverageFromRatings(ratings = []) {
  const imdb = ratings.find(r => r.source === "imdb");
  if (!imdb) return null;
  return Number(imdb.value);
}
function normalizeRatings(item) {
  const ratings = item.ratings || [];

  return ratings.map(r => {
    let source = r.source;

    if (source === "rawg") source = "steam";
    if (source === "myanimelist") source = "mal";

    return {
      source,
      value: r.value
    };
  });
}
