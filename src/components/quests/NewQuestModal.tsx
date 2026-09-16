import React, { useState } from 'react';
import { X } from 'lucide-react';
import { PlayerStats, Quest, QuestType, Subtask } from '../../types';
import { useGameState } from '../../context/GameStateContext';

const categories: QuestType[] = ['Daily', 'Weekly', 'Main', 'Side', 'Challenge'];
const stats: Array<keyof PlayerStats> = ['strength', 'intelligence', 'agility', 'vitality', 'discipline'];

interface NewQuestModalProps {
  onClose: () => void;
  quest?: Quest;
}

export const NewQuestModal: React.FC<NewQuestModalProps> = ({ onClose, quest: initialQuest }) => {
  const { addQuest, updateQuest } = useGameState();
  const [form, setForm] = useState({
    title: initialQuest?.title ?? '', description: initialQuest?.description ?? '', type: initialQuest?.type ?? 'Daily' as QuestType, xp: initialQuest?.reward.xp ?? 25, credits: initialQuest?.reward.credits ?? 10, stat: (initialQuest?.focusStat ?? '') as keyof PlayerStats | '', subtasks: initialQuest?.subtasks?.map((item) => item.title).join('\n') ?? '',
  });

  const update = (key: string, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    const subtasks: Subtask[] = form.subtasks.split('\n').map((title) => title.trim()).filter(Boolean).map((title, index) => ({
      id: `${initialQuest?.id ?? `quest-${Date.now()}`}-task-${index}`, title, completed: initialQuest?.subtasks?.[index]?.completed ?? false,
    }));
    const quest: Quest = {
      id: initialQuest?.id ?? `quest-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      focusStat: form.stat || undefined,
      completed: false,
      reward: { xp: Math.max(0, form.xp), credits: Math.max(0, form.credits), statBoosts: form.stat ? { [form.stat]: 1 } : undefined },
      subtasks,
    };
    if (initialQuest) updateQuest({ ...quest, completed: initialQuest.completed });
    else addQuest(quest);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="modal-panel max-w-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div><p className="eyebrow">MISSION CONSTRUCTOR</p><h2 className="text-2xl font-bold text-white">{initialQuest ? 'Edit quest' : 'Create new quest'}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="field sm:col-span-2"><span>Title</span><input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ship the next milestone" /></label>
          <label className="field sm:col-span-2"><span>Description</span><textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What does success look like?" rows={3} /></label>
          <label className="field sm:col-span-2"><span>Checklist <small className="normal-case tracking-normal text-slate-600">(one task per line)</small></span><textarea value={form.subtasks} onChange={(e) => update('subtasks', e.target.value)} placeholder="Define the first action&#10;Complete the action&#10;Log what you learned" rows={3} /></label>
          <label className="field"><span>Category</span><select value={form.type} onChange={(e) => update('type', e.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="field"><span>Stat boost</span><select value={form.stat} onChange={(e) => update('stat', e.target.value)}><option value="">No boost</option>{stats.map((stat) => <option key={stat} value={stat}>{stat}</option>)}</select></label>
          <label className="field"><span>XP reward</span><input type="number" min="0" value={form.xp} onChange={(e) => update('xp', Number(e.target.value))} /></label>
          <label className="field"><span>Credit reward</span><input type="number" min="0" value={form.credits} onChange={(e) => update('credits', Number(e.target.value))} /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button className="button-primary" type="submit">{initialQuest ? 'Save changes' : 'Deploy quest'}</button></div>
      </form>
    </div>
  );
};

export default NewQuestModal;
