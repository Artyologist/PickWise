import { Link } from 'react-router-dom';

export default function RelationsSection({ relations }) {
    if (!relations || relations.length === 0) return null;

    // Track displayed items to ensure exclusivity
    const displayedIds = new Set();

    // Helper to filter relations and enforce exclusivity
    const getItems = (filterFn) => {
        const filtered = relations.filter(r => {
            if (!r.targetId) return false;

            // Handle various ID formats
            const tId = r.targetId._id || r.targetId.id || r.targetId;
            const targetIdStr = tId.toString();

            if (displayedIds.has(targetIdStr)) return false;

            // Normalize relation type (legacy type vs new relationType)
            const rType = r.relationType || r.type;
            const normalizedR = { ...r, relationType: rType };

            return filterFn(normalizedR);
        });

        filtered.forEach(r => {
            const tId = r.targetId._id || r.targetId.id || r.targetId;
            displayedIds.add(tId.toString());
        });

        return filtered;
    };

    // Row definitions - Mutually exclusive logic with improved categories
    const rows = [
        {
            id: 'chronology',
            title: 'Chronological Context',
            icon: 'fas fa-history',
            columns: [
                {
                    name: 'The Past',
                    filter: (r) => r.relationType === 'prequel'
                },
                {
                    name: 'The Future',
                    filter: (r) => r.relationType === 'sequel'
                },
                {
                    name: 'Parallel Stories',
                    filter: (r) => ['spinoff', 'spin_off'].includes(r.relationType)
                },
            ]
        },
        {
            id: 'cross-media',
            title: 'Cross-Portal Evidence',
            icon: 'fas fa-map-marked-alt',
            columns: [
                { name: 'Literary', filter: (r) => ['novel', 'comic'].includes(r.targetId?.category) },
                { name: 'Interactive', filter: (r) => ['videogame', 'game'].includes(r.targetId?.category) },
                { name: 'Cinematic', filter: (r) => ['movie', 'tv', 'documentary'].includes(r.targetId?.category) && !['prequel', 'sequel'].includes(r.relationType) },
                { name: 'Illustrated', filter: (r) => ['anime', 'manga'].includes(r.targetId?.category) },
            ]
        }
    ];

    return (
        <div className="space-y-16">
            {rows.map(row => {
                const activeCols = row.columns.map(col => ({
                    ...col,
                    items: getItems(col.filter)
                })).filter(col => col.items.length > 0);

                if (activeCols.length === 0) return null;

                return (
                    <div key={row.id} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-2xl">
                                <i className={row.icon} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">{row.title}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mt-1">Cross-IP Linkage detected</p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-8 sm:p-12 shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12">
                                {activeCols.map((col) => (
                                    <div key={col.name} className="flex flex-col">
                                        <div className="flex items-center gap-3 mb-8">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">{col.name}</span>
                                            <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/30 to-transparent"></div>
                                        </div>

                                        <div className="space-y-6">
                                            {col.items.map((rel, idx) => {
                                                const target = rel.targetId;
                                                if (!target) return null;
                                                return (
                                                    <Link
                                                        key={idx}
                                                        to={target._id ? `/content/${target._id}` : `/search?q=${encodeURIComponent(target.title)}`}
                                                        className="group flex gap-5 items-center transition-all duration-500 p-2 -m-2 rounded-3xl hover:bg-white/5"
                                                    >
                                                        <div className="relative w-14 h-20 shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                                                            <img
                                                                src={target.posterUrl || "/placeholder-poster.png"}
                                                                alt={target.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        </div>

                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest whitespace-nowrap">
                                                                    {target.category}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-[14px] font-black text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-tight">
                                                                {target.title}
                                                            </h4>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">{target.year || 'TBA'}</p>
                                                        </div>

                                                        <div className="pr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                            <i className="fas fa-chevron-right text-[10px] text-indigo-500" />
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
