import React from 'react';
import { Check, ChevronRight, Coins, Pencil, Sparkles, Trash2 } from 'lucide-react';
import { Quest } from '../../types';
import { useGameState } from '../../context/GameStateContext';

export const QuestCard: React.FC<{ quest: Quest; onOpen?: () => void; onEdit?: () => void; onDelete?: () => void }> = ({ quest, onOpen, onEdit, onDelete }) => {
  const { completeQuest, deleteQuest } = useGameState();
  const remove = () => { if (window.confirm(`Delete "${quest.title}"? This cannot be undone.`)) { deleteQuest(quest.id); onDelete?.(); } };
  return <article className={`glass-card group p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 ${quest.completed ? 'opacity-65' : ''}`}>
    <div className="flex items-start justify-between gap-3"><span className={`tag ${quest.completed ? 'bg-emerald-400/10 text-emerald-300' : 'bg-cyan-400/10 text-cyan-300'}`}>{quest.type.toUpperCase()}</span><div className="flex items-center gap-1 text-xs text-slate-600">{quest.completed ? <Check size={16} className="text-emerald-300" /> : 'ACTIVE'}<button className="icon-button p-1.5" onClick={onEdit} aria-label="Edit quest"><Pencil size={14} /></button><button className="icon-button p-1.5 text-rose-400/70 hover:text-rose-300" onClick={remove} aria-label="Delete quest"><Trash2 size={14} /></button></div></div>
    <button onClick={onOpen} className="mt-4 block w-full text-left"><h3 className="text-lg font-bold text-white transition group-hover:text-cyan-300">{quest.title}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">{quest.description || 'No description added.'}</p></button>
    <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4 text-xs"><span className="flex items-center gap-1 text-purple-300"><Sparkles size={14} />+{quest.reward.xp ?? 0} XP</span><span className="flex items-center gap-1 text-amber-300"><Coins size={14} />+{quest.reward.credits ?? 0}</span>{quest.reward.statBoosts && <span className="text-emerald-300">+1 stat</span>}<button disabled={quest.completed} onClick={() => completeQuest(quest.id)} className="ml-auto inline-flex items-center gap-1 font-bold text-cyan-300 hover:text-white disabled:text-slate-600">{quest.completed ? 'Completed' : 'Complete'}{!quest.completed && <ChevronRight size={14} />}</button></div>
  </article>;
};

export default QuestCard;
