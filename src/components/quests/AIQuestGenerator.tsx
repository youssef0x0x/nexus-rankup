import React, { useState } from 'react';
import { Bot, Target, X } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';

const presets = [
  'Master C++ Data Structures',
  'Pass Calculus II',
  'Build a Portfolio Project',
  'Hit Fitness Targets',
  'Build a Consistent Daily Routine',
];

export const AIQuestGenerator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { state, generateAIQuests } = useGameState();
  const [goal, setGoal] = useState(state.player.activeGoal);
  const [isGenerating, setIsGenerating] = useState(false);
  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!goal.trim()) return;
    setIsGenerating(true);
    await generateAIQuests(goal);
    onClose();
  };
  return <div className="modal-backdrop"><form onSubmit={create} className="modal-panel max-w-lg"><div className="flex items-start justify-between"><div><p className="eyebrow">NEXUS INTELLIGENCE</p><h2 className="text-2xl font-black text-white">Generate roadmap missions</h2><p className="mt-1 text-sm text-slate-400">The Game Master will create balanced Daily and Epic quests with locked rewards.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div><div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] p-4"><div className="flex items-center gap-2 text-sm font-semibold text-cyan-200"><Target size={16} /> Current target: <span className="text-white">{state.player.activeGoal || 'Not set'}</span></div></div><div className="mt-5 flex flex-wrap gap-2">{presets.map((preset) => <button type="button" key={preset} className="tag bg-white/5 text-slate-400 hover:text-cyan-300" onClick={() => setGoal(preset)}>{preset}</button>)}</div><label className="field mt-5"><span>Generate from goal</span><input required value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="e.g. Master C++ Data Structures" /></label><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={onClose} disabled={isGenerating}>Cancel</button><button type="submit" className="button-primary" disabled={isGenerating}><Bot size={16} /> {isGenerating ? 'Analyzing...' : 'Generate missions'}</button></div></form></div>;
};

export default AIQuestGenerator;
