import React from 'react';

export const XPBar: React.FC<{ xp: number; level: number }> = ({ xp, level }) => {
  const required = Math.floor(100 * Math.pow(1.18, level - 1));
  const pct = Math.min(100, Math.round((xp / required) * 100));
  return (
    <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-yellow-400 transition-all"
        style={{ width: `${pct}%` }}
        aria-valuenow={pct}
      />
    </div>
  );
};

export default XPBar;