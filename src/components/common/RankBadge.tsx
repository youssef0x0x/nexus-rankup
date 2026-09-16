import React from 'react';
import { useTranslation } from 'react-i18next';

export const RankBadge: React.FC<{ rank: string; onClick?: () => void }> = ({ rank, onClick }) => {
  const { t } = useTranslation();
  const colors: Record<string, string> = {
    F: 'text-slate-400',
    E: 'text-gray-300',
    'C-': 'text-cyan-300',
    D: 'text-green-300',
    C: 'text-cyan-300',
    B: 'text-purple-300',
    A: 'text-yellow-300',
    S: 'text-pink-400',
    'B-': 'text-purple-300',
    'B+': 'text-fuchsia-300',
    'A-': 'text-yellow-300',
    'A+': 'text-amber-300',
    SS: 'text-rose-300',
  };
  const color = colors[rank] ?? 'text-slate-300';

  const handleClick = onClick ?? (() => undefined);
  return (
    <button type="button" onClick={handleClick} className="rank-pulse inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/3 px-3 py-1 text-left backdrop-blur-sm transition hover:scale-105" aria-label={t('rank.progression')}>
      <div className={`font-extrabold tracking-widest ${color} text-lg`}>{rank}</div>
      <div className="text-xs text-gray-300">{t('ranks.rank')}</div>
    </button>
  );
};

export default RankBadge;