import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import UniverseHeader from '../components/UniverseHeader';
import UniverseSection from '../components/UniverseSection';

export default function Universe() {
  const { slug } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['universe', slug],
    queryFn: () => api.getUniverse(slug),
    staleTime: Infinity
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-10">
      <UniverseHeader slug={slug} />

      {Object.entries(data.results).map(([cat, items]) => (
        <UniverseSection
          key={cat}
          title={cat}
          items={items}
        />
      ))}
    </div>
  );
}
