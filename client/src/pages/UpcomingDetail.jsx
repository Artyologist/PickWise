import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import POSTERS from '../config/posters';

export default function UpcomingDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const [hoveredEvent, setHoveredEvent] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.getUpcomingProject(slug);
                setProject(res.project);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-60 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Extracting Hype</p>
        </div>
    );

    if (!project) return <div className="p-20 text-center">Project lost in time.</div>;

    const poster = POSTERS[slug] || project.posterUrl || "/placeholder-poster.png";

    const getIcon = (type) => {
        const icons = {
            announcement: '📣',
            cast_announced: '🎭',
            plot_reveal: '📖',
            trailer_release: '▶️',
            teaser_release: '🎬',
            comic_con_panel: '🎤',
            delay: '⏳',
            interview: '📰'
        };
        return icons[type] || '✨';
    };

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20 py-8 max-w-6xl">
            {/* HEADER HERO */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
                <div className="w-full max-w-[260px] sm:w-72 h-[380px] sm:h-[450px] shrink-0 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative group mx-auto md:mx-0">
                    <img
                        src={poster}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = "/placeholder-poster.png";
                            e.target.onerror = null;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent"></div>
                </div>
                <div className="flex-1 space-y-8 text-center md:text-left">
                    <div className="flex items-center gap-4 justify-center md:justify-start">
                        <span className="px-5 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-widest rounded-full shadow-sm">Target: {project.releaseWindow}</span>
                        <span className="px-5 py-2 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-widest rounded-full shadow-sm">{project.category}</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-gray-900 dark:text-white leading-[0.85] tracking-tighter">{project.title}</h1>
                    <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
                        {project.description || "Project tracking is active. Real-time development intelligence and historical milestones are consolidated here."}
                    </p>

                    {/* PLATFORMS */}
                    {project.platforms && project.platforms.length > 0 && (
                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800/50">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Confirmed Release Platforms</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {project.platforms.map(p => (
                                    <span key={p} className="px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-slate-700 flex items-center gap-2">
                                        {p.toLowerCase().includes('playstation') && '🎮'}
                                        {p.toLowerCase().includes('xbox') && '❎'}
                                        {!p.toLowerCase().includes('playstation') && !p.toLowerCase().includes('xbox') && '💻'}
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="space-y-12">
                <div className="flex items-center gap-6">
                    <div className="h-10 w-2 bg-indigo-600 rounded-full"></div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Development Timeline</h2>
                    <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1"></div>
                </div>

                <div className="relative py-20">
                    {/* THE LINE */}
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full -translate-y-1/2 overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                    </div>

                    <div className="flex gap-12 overflow-x-auto pb-16 px-4 scrollbar-hide snap-x">
                        {project.timeline?.map((event, i) => {
                            const ytId = event.videoUrl ? getYoutubeId(event.videoUrl) : null;
                            const isHovered = hoveredEvent === i;
                            const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

                            return (
                                <div
                                    key={i}
                                    className="min-w-[280px] sm:min-w-[340px] max-w-[280px] sm:max-w-[340px] snap-center relative pt-10"
                                    onMouseEnter={() => setHoveredEvent(i)}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                >
                                    {/* DOT */}
                                    <div className="absolute top-[32px] left-1/2 -track-x-1/2 w-8 h-8 bg-white dark:bg-slate-950 border-[6px] border-indigo-600 rounded-full z-10 shadow-xl shadow-indigo-500/30"></div>

                                    <div className="bg-white dark:bg-slate-900 border border-gray-50 dark:border-slate-800 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 group border-b-8 border-b-indigo-500/20 h-[400px] flex flex-col relative overflow-hidden">

                                        {isHovered && ytId ? (
                                            <div className="absolute inset-0 z-20 bg-black rounded-[2.5rem] overflow-hidden">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&controls=0&modestbranding=1&mute=0`}
                                                    title="Preview"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Thumbnail Header if video exists */}
                                                {thumbnail || event.imageUrl ? (
                                                    <div className="h-48 w-full relative shrink-0">
                                                        <img
                                                            src={event.imageUrl || thumbnail}
                                                            alt={event.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {thumbnail && (
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                                    <span className="text-2xl">▶️</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-8 pb-0">
                                                        <div className="text-4xl mb-6 transform group-hover:scale-125 transition-transform duration-500 origin-left">{getIcon(event.type)}</div>
                                                    </div>
                                                )}

                                                <div className="p-8 pt-6 flex-1 flex flex-col">
                                                    <p className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-2 font-mono">
                                                        {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </p>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium mb-4">
                                                        {event.summary}
                                                    </p>

                                                    {event.sources?.length > 0 && (
                                                        <div className="mt-auto pt-4 border-t border-gray-50 dark:border-slate-800 flex flex-wrap gap-4">
                                                            {event.sources.map((s, si) => (
                                                                <a
                                                                    key={si}
                                                                    href={s.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-[10px] font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
                                                                >
                                                                    {s.name} ↗
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RELATIONS SECTION (CROSS IP) */}
            {project.crossIp && project.crossIp.length > 0 && (
                <div className="space-y-12">
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-2 bg-purple-600 rounded-full"></div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Relations</h2>
                        <div className="h-px bg-gray-100 dark:bg-slate-800 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {project.crossIp.map((item, idx) => (
                            <a
                                key={idx}
                                href={item.url}
                                className="group flex items-center gap-6 bg-white dark:bg-slate-900 p-4 pr-8 rounded-3xl border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300"
                            >
                                <div className="w-16 h-24 rounded-2xl overflow-hidden shadow-lg shrink-0">
                                    <img src={item.posterUrl || '/placeholder-poster.png'} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">{item.relationType || "Related"}</div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
