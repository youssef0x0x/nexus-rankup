import React from 'react';

export const RankBadge: React.FC<{ rank: string }> = ({ rank }) => {
  const colors: Record<string, string> = {
    E: 'text-gray-300',
    D: 'text-green-300',
    C: 'text-cyan-300',
    B: 'text-purple-300',
    A: 'text-yellow-300',
    S: 'text-pink-400',
  };
  const color = colors[rank] ?? 'text-slate-300';

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/3 backdrop-blur-sm">
      <div className={`font-extrabold tracking-widest ${color} text-lg`}>{rank}</div>
      <div className="text-xs text-gray-300">Rank</div>
    </div>
  );
};

export default RankBadge;