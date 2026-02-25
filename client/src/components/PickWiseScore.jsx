import React from 'react';

export default function PickWiseScore({ score, className = "" }) {
    if (!score) return null;

    // Color mapping based on score
    const getColor = (s) => {
        if (s >= 85) return "text-green-400 border-green-500/30 bg-green-500/10";
        if (s >= 70) return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
        if (s >= 50) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
        return "text-red-400 border-red-500/30 bg-red-500/10";
    };

    const getLabel = (s) => {
        if (s >= 85) return "Masterpiece";
        if (s >= 75) return "Excellent";
        if (s >= 60) return "Solid";
        return "Mixed";
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className={`relative w-14 h-14 flex items-center justify-center rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500 group hover:scale-110 ${getColor(score)}`}>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-black tracking-tighter leading-none">{score}</span>
                    <span className="text-[7px] font-black uppercase tracking-widest opacity-60">PW</span>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white/20 animate-pulse" />
            </div>

            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">PickWise Score</span>
                <span className={`text-xs font-bold ${getColor(score).split(' ')[0]}`}>{getLabel(score)}</span>
            </div>
        </div>
    );
}
