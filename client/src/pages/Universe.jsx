import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ContentCard from '../components/ContentCard';
import normalizeContent from '../utils/normalizeContent';

export default function Universe() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniverse = async () => {
      try {
        const res = await api.getUniverse(name);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUniverse();
  }, [name]);

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-500 font-bold">Resonance detected... Scanning universe.</div>;
  if (!data) return <div className="p-20 text-center">Universe not found.</div>;

  return (
    <div className="space-y-16">
      {/* HERO SECTION */}
      <div className="relative rounded-[3rem] p-16 text-center text-white shadow-2xl overflow-hidden min-h-[400px] flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/constellation.png')] opacity-30"></div>

        <div className="relative z-10 space-y-6">
          <h4 className="text-indigo-300 font-black tracking-[0.3em] uppercase text-sm">Franchise Collection</h4>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight">{data.universe}</h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto opacity-80 leading-relaxed font-medium">
            A unified view of every story, world, and adaptation within the <span className="underline decoration-indigo-400 decoration-2 underline-offset-4">{data.universe}</span> intellectual property.
          </p>
        </div>
      </div>

      {/* GROUPED CONTENT */}
      <div className="space-y-20">
        {Object.entries(data.grouped || {}).map(([category, items]) => (
          <div key={category} className="space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-3xl font-black capitalize text-gray-900 dark:text-white shrink-0">{category}s</h2>
              <div className="h-1 bg-gradient-to-r from-indigo-500/50 to-transparent flex-1 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {items.map(item => (
                <ContentCard key={item._id} item={normalizeContent(item)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
