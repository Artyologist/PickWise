import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import POSTERS from '../config/posters';

export default function Upcoming() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const res = await api.getUpcoming();
                setGroups(res.results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUpcoming();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Traversing Timeline</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-10">
            <div className="max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Upcoming Releases</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    The ultimate roadmap for entertainment. Track announcements, trailers, and release dates for the projects that define our culture.
                </p>
            </div>

            <div className="space-y-24">
                {groups.map(group => (
                    <div key={group.month} className="space-y-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                                {group.month}
                            </h2>
                            <div className="h-1 bg-gradient-to-r from-indigo-500/30 to-transparent flex-1 rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {group.projects.map(p => (
                                <Link key={p._id} to={`/upcoming/${p.slug}`} className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex h-52 hover:-translate-y-2">
                                    <div className="w-1/3 relative shrink-0 overflow-hidden">
                                        <img
                                            src={POSTERS[p.slug] || p.posterUrl}
                                            alt={p.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-5 sm:p-8 flex flex-col justify-center gap-2 sm:gap-3 min-w-0">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">{p.category}</span>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">
                                            {p.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                            {p.description || p.timeline?.[0]?.title || 'Release scheduled'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
