export default function CastRow({ cast = [] }) {
  if (!cast.length) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">Top Cast</h2>

      <div className="flex gap-6 overflow-x-auto pb-2">
        {cast.slice(0, 3).map(person => (
          <div key={person.name} className="text-center w-24 shrink-0">
            <img
              src={person.photo}
              alt={person.name}
              className="w-20 h-20 rounded-full object-cover mx-auto"
            />
            <p className="text-sm font-medium mt-2">{person.name}</p>
            <p className="text-xs text-gray-500">{person.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
