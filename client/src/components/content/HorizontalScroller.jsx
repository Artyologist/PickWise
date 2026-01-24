import ContentCard from '../ContentCard';

export default function HorizontalScroller({ title, items = [] }) {
  if (!items.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {items.map(item => (
          <div key={item.id || item._id} className="w-44 shrink-0">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
