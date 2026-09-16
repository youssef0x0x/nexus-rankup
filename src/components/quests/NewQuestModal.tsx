import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Quest } from '../../types';
import { useGameState } from '../../context/GameStateContext';

interface NewQuestModalProps {
  onClose: () => void;
  quest?: Quest;
}

export const NewQuestModal: React.FC<NewQuestModalProps> = ({ onClose, quest: initialQuest }) => {
  const { generateQuestFromPrompt } = useGameState();
  const [form, setForm] = useState({
    title: initialQuest?.title ?? '',
    description: initialQuest?.description ?? '',
  });
  const update = (key: 'title' | 'description', value: string) => setForm((current) => ({ ...current, [key]: value }));
  const [isGenerating, setIsGenerating] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setIsGenerating(true);
    await generateQuestFromPrompt(form.title, form.description, initialQuest);
    onClose();
  };
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><form onSubmit={submit} className="modal-panel max-w-xl">
    <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="eyebrow">MISSION CONSTRUCTOR</p><h2 className="text-2xl font-bold text-white">{initialQuest ? 'Edit quest' : 'Create new quest'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="field sm:col-span-2"><span>What do you want to do?</span><input required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Study Java programming for two hours" /></label>
      <label className="field sm:col-span-2"><span>Context or success criteria</span><textarea value={form.description} onChange={(event) => update('description', event.target.value)} rows={3} placeholder="Add any useful context for the Game Master" /></label>
      <div className="sm:col-span-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] p-4 text-sm text-cyan-100">
        <strong>Game Master balance lock</strong>
        <p className="mt-1 text-slate-400">XP, Credits, difficulty, duration, stat focus, and checklist are evaluated automatically from your goal. They cannot be edited.</p>
      </div>
    </div>
    <div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={onClose} disabled={isGenerating}>Cancel</button><button className="button-primary" type="submit" disabled={isGenerating}>{isGenerating ? 'Analyzing...' : initialQuest ? 'Rebalance quest' : 'Deploy quest'}</button></div>
  </form></div>;
};

export default NewQuestModal;
