import HorizontalScroller from './HorizontalScroller';

export default function RelationRow({ relations }) {
  if (!relations) return null;

  return (
    <section className="space-y-6">
      {relations.prequel && (
        <HorizontalScroller
          title="Prequel"
          items={[relations.prequel]}
        />
      )}

      {relations.sequel && (
        <HorizontalScroller
          title="Sequel"
          items={[relations.sequel]}
        />
      )}
    </section>
  );
}
