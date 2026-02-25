import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import RatingBadge from '../components/RatingBadge';

export default function DetailsPage() {
  const { id } = useParams();

  const { data } = useQuery(['content', id], () => api.getContent(id));
  const { data: similar } = useQuery(['similar', id], () =>
    api.getSimilar(id)
  );

  if (!data?.item) return <div>Loading...</div>;
  const item = data.item;

  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={item.posterUrl || "/placeholder-poster.png"}
          alt={item.title}
          className="w-full md:w-72 rounded-lg shadow-lg"
          onError={(e) => {
            e.target.src = "/placeholder-poster.png";
            e.target.onerror = null;
          }}
        />

        <div className="flex-1">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <div className="text-gray-500">{item.year}</div>

          <div className="flex flex-wrap gap-2 mt-3">
            {(item.genres || []).map(g => (
              <span key={g} className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                {g}
              </span>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            {(item.ratings || []).map(r => (
              <RatingBadge key={r.source} {...r} />
            ))}
          </div>

          <p className="mt-4 text-gray-700 leading-relaxed">
            {item.fullDescription || item.shortDescription}
          </p>
        </div>
      </div>

      {/* CAST */}
      {item.casts?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Cast</h2>
          <div className="flex gap-4 overflow-x-auto">
            {item.casts.map(c => (
              <div key={c.name} className="text-center w-24 shrink-0">
                <img
                  src={c.photoUrl || 'https://placehold.co/80'}
                  className="w-20 h-20 rounded-full object-cover mx-auto"
                />
                <div className="text-sm mt-1">{c.name}</div>
                <div className="text-xs text-gray-500">{c.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* GAME REQUIREMENTS */}
      {item.minimumRequirements && (
        <section>
          <h2 className="text-xl font-semibold mb-2">System Requirements</h2>
          <div className="bg-gray-50 p-4 rounded text-sm grid grid-cols-2 gap-2">
            {Object.entries(item.minimumRequirements).map(([k, v]) => (
              <div key={k}><strong>{k}:</strong> {v}</div>
            ))}
          </div>
        </section>
      )}

      {/* SIMILAR */}
      {similar?.results?.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Similar Picks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {similar.results.map(i => (
              <ContentCard key={i._id} item={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
