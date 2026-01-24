import ContentCard from './ContentCard';

export default function UniverseSection({ title, items }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 capitalize">
        {title}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(i => (
          <ContentCard key={i._id} item={i} />
        ))}
      </div>
    </section>
  );
}
