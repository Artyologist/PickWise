import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchStats();
        if (activeTab === 'content') fetchContent();
    }, [activeTab, page]);

    const fetchStats = async () => {
        try {
            const res = await api.getAdminStats();
            if (res.ok) setStats(res.stats);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await api.getAdminContent(page);
            if (res.ok) setContent(res.items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Erase this intel entry?')) return;
        try {
            const res = await api.deleteAdminContent(id);
            if (res.ok) fetchContent();
        } catch (e) {
            alert('Deletion failed');
        }
    };

    const handleGlobalSearch = async () => {
        if (searchQuery.length < 2) return;
        setLoading(true);
        try {
            const res = await api.globalSearch(searchQuery);
            // Flatten results for easy import
            const flattened = Object.values(res.results || {}).flat();
            setSearchResults(flattened);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (item) => {
        try {
            const res = await api.importContent(item.raw || item);
            if (res.ok) alert('Intel Imported Successfully');
        } catch (e) {
            alert('Import failed');
        }
    };

    return (
        <div className="space-y-10 pt-10 pb-20 max-w-7xl mx-auto px-4">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-2xl backdrop-blur-md">
                        <i className="fas fa-terminal text-xl" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white">Intelligence Command</h1>
                        <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Operational Protocol Active
                        </p>
                    </div>
                </div>

                {/* TAB SWITCHER */}
                <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl">
                    {['overview', 'content', 'import'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-2 group hover:border-indigo-500/30 transition-all">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Archive</span>
                            <p className="text-4xl font-black text-white">{stats.contentCount}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-2 group hover:border-indigo-500/30 transition-all">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registered Personnel</span>
                            <p className="text-4xl font-black text-white">{stats.userCount}</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-2 group hover:border-indigo-500/30 transition-all">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Health</span>
                            <p className="text-4xl font-black text-green-500">OPTIMAL</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] space-y-2 group hover:border-indigo-500/30 transition-all relative overflow-hidden">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Global Server Time</span>
                            <p className="text-2xl font-black text-white mt-2">{new Date().toLocaleTimeString()}</p>
                            <div className="absolute right-0 bottom-0 opacity-10 p-4">
                                <i className="fas fa-clock text-4xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10">
                        <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                            <div className="w-2 h-4 bg-indigo-500 rounded-full" />
                            Categorical Distribution
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {stats.categoryStats.map(cat => (
                                <div key={cat._id} className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center space-y-1">
                                    <p className="text-2xl font-black text-indigo-400">{cat.count}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{cat._id}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT MANAGEMENT TAB */}
            {activeTab === 'content' && (
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <th className="px-8 py-6">Title</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6">Source</th>
                                <th className="px-8 py-6">Created</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {content.map(item => (
                                <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5 font-bold text-gray-200">{item.title}</td>
                                    <td className="px-8 py-5">
                                        <span className="text-[9px] font-black uppercase px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-gray-500 font-mono uppercase">{item.source}</td>
                                    <td className="px-8 py-5 text-[10px] text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <i className="fas fa-trash-alt" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-8 flex justify-center border-t border-white/5 gap-4">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white">Previous</button>
                        <span className="text-xs font-black text-indigo-500">Phase {page}</span>
                        <button onClick={() => setPage(p => p + 1)} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white">Next</button>
                    </div>
                </div>
            )}

            {/* IMPORT TAB */}
            {activeTab === 'import' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex gap-4">
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Enter identifier or title..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        <button
                            onClick={handleGlobalSearch}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-3 transition-all"
                        >
                            <i className="fas fa-search" />
                            Execute Search
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-4 text-indigo-500">
                            <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Querying External Nodes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((item, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex gap-4 items-center group hover:border-indigo-500/40 transition-all overflow-hidden relative">
                                    <img
                                        src={item.poster || item.posterUrl || '/placeholder-poster.png'}
                                        className="w-16 h-24 object-cover rounded-xl shadow-xl group-hover:scale-105 transition-transform duration-500"
                                        alt=""
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-200 truncate">{item.title}</h4>
                                        <p className="text-[10px] text-gray-500 uppercase font-black mt-1 tracking-widest">{item.category} • {item.year}</p>
                                        <button
                                            onClick={() => handleImport(item)}
                                            className="mt-3 w-full py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-500/20 transition-all"
                                        >
                                            Secure Entry
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
