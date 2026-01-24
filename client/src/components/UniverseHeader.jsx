export default function UniverseHeader({ slug }) {
  const title = slug.replace('-', ' ').toUpperCase();

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded">
      <h1 className="text-3xl font-bold">{title} Universe</h1>
      <p className="opacity-90 mt-2">
        Movies, games, books & comics in timeline order
      </p>
    </div>
  );
}
