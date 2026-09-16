import React from 'react';
import { Flame, LockKeyhole, Shield, Sparkles, TrendingUp } from 'lucide-react';
import { PlayerStats } from '../../types';
import { useGameState, requiredXP } from '../../context/GameStateContext';
import XPBar from '../common/XPBar';
import RankBadge from '../common/RankBadge';

const statMeta: Array<{ key: keyof PlayerStats; label: string; icon: string; color: string }> = [
  { key: 'strength', label: 'Strength', icon: 'STR', color: 'text-rose-300' },
  { key: 'intelligence', label: 'Intelligence', icon: 'INT', color: 'text-violet-300' },
  { key: 'agility', label: 'Agility', icon: 'AGI', color: 'text-cyan-300' },
  { key: 'vitality', label: 'Vitality', icon: 'VIT', color: 'text-emerald-300' },
  { key: 'discipline', label: 'Discipline', icon: 'DIS', color: 'text-amber-300' },
];

export const PlayerStatus: React.FC = () => {
  const { state, upgradeStat } = useGameState();
  const { player } = state;
  return <section className="glass-card overflow-hidden">
    <div className="relative p-5 sm:p-6"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,243,255,.13),transparent_45%)]" /><div className="relative flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><div className="avatar-orb">{player.avatar}</div><div><p className="eyebrow">PLAYER PROFILE</p><h2 className="text-2xl font-black tracking-tight text-white">{player.name}</h2><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-violet-300">{player.title}</p><p className="mt-1 text-sm text-slate-400">Level {player.level} <span className="text-slate-600">•</span> {player.xp}/{requiredXP(player.level)} XP</p></div></div><RankBadge rank={player.rank} /></div>{player.activeGoal && <div className="relative mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] px-4 py-3"><p className="eyebrow">PRIMARY TARGET</p><p className="mt-1 text-sm font-semibold text-cyan-100">{player.activeGoal}</p></div>}<div className="relative mt-5"><XPBar xp={player.xp} level={player.level} /></div><div className="relative mt-4 flex flex-wrap gap-3"><div className="stat-chip"><Flame size={15} className="text-orange-300" /><span>{player.currentStreak} day streak</span></div><div className="stat-chip"><TrendingUp size={15} className="text-cyan-300" /><span>{player.activeDays} active days</span></div><div className="stat-chip"><Sparkles size={15} className="text-purple-300" /><span>{player.achievements.length} achievements</span></div><div className="stat-chip ml-auto"><span className="text-amber-300">◈</span><span>{player.credits} credits</span></div></div></div>
    <div className="border-t border-white/10 bg-black/20 p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">CORE ATTRIBUTES</p><h3 className="font-semibold text-white">Upgrade your build</h3></div><span className="text-xs text-slate-500">Spend credits to level up</span></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{statMeta.map(({ key, label, icon, color }) => { const cost = Math.max(25, player.stats[key] * 10); const canUpgrade = player.credits >= cost; return <div key={key} className="stat-card"><div className="flex items-center justify-between"><span className={`text-[10px] font-black tracking-widest ${color}`}>{icon}</span><Shield size={14} className="text-slate-600" /></div><p className="mt-3 text-xs text-slate-400">{label}</p><p className={`mt-1 text-2xl font-black ${color}`}>{player.stats[key]}</p><button disabled={!canUpgrade} onClick={() => upgradeStat(key)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-md border border-white/10 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 transition hover:border-cyan-400/50 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40">{canUpgrade ? `+1 · ${cost}` : <><LockKeyhole size={11} /> {cost} credits</>}</button></div>; })}</div></div>
    <div className="border-t border-white/10 px-5 py-4 sm:px-6"><p className="eyebrow mb-3">ACHIEVEMENT BADGES</p><div className="flex flex-wrap gap-2">{player.achievements.length ? player.achievements.map((achievement) => <span className="badge-glow" key={achievement.id}>✦ {achievement.title}</span>) : <span className="text-sm text-slate-500">Complete quests to unlock your first badge.</span>}</div></div>
  </section>;
};

export default PlayerStatus;
