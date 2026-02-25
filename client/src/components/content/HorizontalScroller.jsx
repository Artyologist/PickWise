import ContentCard from '../ContentCard';

export default function HorizontalScroller({ title, items = [] }) {
  if (!items.length) return null;

  return (
    <section className="space-y-3">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide scroll-smooth [-webkit-overflow-scrolling:touch]">
        {items.map(item => (
          <div key={item.id || item._id} className="w-36 sm:w-44 shrink-0">
            <ContentCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

