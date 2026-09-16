import React, { useState } from 'react';
import { Check, Download, Plus, RotateCcw, Target, Trash2, Upload, UserRound, X } from 'lucide-react';
import { avatarOptions, useGameState } from '../../context/GameStateContext';
import AvatarSelector from './AvatarSelector';
import CharacterEquipmentPreview from '../dashboard/CharacterEquipmentPreview';

interface ProfileSwitcherProps { onClose: () => void; }
const goalPresets = [
  { label: 'Programming & Software Engineering', value: 'Build a portfolio project with production-quality code' },
  { label: 'University Exam Prep', value: 'Pass my next university exam with confidence' },
  { label: 'Health & Physical Fitness', value: 'Hit my weekly fitness and health targets' },
  { label: 'Daily Discipline', value: 'Build a consistent daily routine' },
];

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ onClose }) => {
  const { profiles, activeProfile, switchProfile, createProfile, updateProfile, importProfileData, resetProgress, deleteProfile, setProfileGoals, state } = useGameState();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [form, setForm] = useState({ username: '', title: '', avatar: avatarOptions[0] });
  const [goal, setGoal] = useState(activeProfile?.state?.player?.activeGoal ?? '');
  const [mainGoals, setMainGoals] = useState((activeProfile?.state?.player?.mainGoals ?? []).join('\n'));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.username.trim()) return;
    if (mode === 'edit') updateProfile(form.username, form.avatar, form.title);
    else createProfile(form.username, form.avatar, form.title);
    onClose();
  };
  const confirmReset = () => { if (window.confirm('Reset this profile progress? This cannot be undone.')) resetProgress(); };
  const confirmDelete = () => { if (window.confirm('Delete this profile and all of its quests? This cannot be undone.')) deleteProfile(); };
  const saveGoals = () => setProfileGoals(goal, mainGoals.split('\n'));
  const exportProfile = () => {
    if (!activeProfile) return;
    const blob = new Blob([JSON.stringify({ format: 'nexus-profile', version: 1, exportedAt: new Date().toISOString(), username: activeProfile.username, avatar: activeProfile.avatar, title: activeProfile.title, state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'nexus-profile.json'; link.click(); URL.revokeObjectURL(url);
  };
  const importProfile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (!importProfileData(JSON.parse(String(reader.result)))) window.alert('Invalid Nexus profile backup.');
        else onClose();
      } catch {
        window.alert('Unable to read this profile backup.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return <div className="modal-backdrop"><div className="modal-panel max-w-xl"><div className="flex items-start justify-between"><div><p className="eyebrow">IDENTITY MATRIX</p><h2 className="text-2xl font-black text-white">Profile accounts</h2><p className="mt-1 text-sm text-slate-400">Switch locally saved operators or create a new one.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
    {mode === 'list' ? <><div className="mt-6 space-y-2">{profiles.map((profile) => <button key={profile.id} onClick={() => { switchProfile(profile.id); onClose(); }} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${profile.id === activeProfile?.id ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/[.03] hover:border-white/20'}`}><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-2xl">{profile.avatar ?? '🧑‍💻'}</span><span className="flex-1"><strong className="block text-sm text-white">{profile.username ?? 'Rookie'}</strong><small className="text-xs text-slate-500">{profile.title ?? 'Nexus Initiate'} · Level {profile.state?.player?.level ?? 1}</small></span>{profile.id === activeProfile?.id && <Check size={18} className="text-cyan-300" />}</button>)}</div><div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/[.04] p-4"><div className="mb-3 flex items-center gap-2"><Target size={17} className="text-cyan-300" /><div><p className="eyebrow">ROADMAP TARGET</p><h3 className="font-semibold text-white">Personalize AI missions</h3></div></div><div className="mb-3 flex flex-wrap gap-2">{goalPresets.map((preset) => <button type="button" key={preset.label} className="tag bg-white/5 text-slate-400 hover:text-cyan-300" onClick={() => setGoal(preset.value)}>{preset.label}</button>)}</div><label className="field"><span>Active goal</span><input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Master C++ Data Structures" /></label><label className="field mt-3"><span>Other main goals <small className="normal-case tracking-normal text-slate-600">(one per line)</small></span><textarea value={mainGoals} onChange={(e) => setMainGoals(e.target.value)} rows={2} placeholder="Pass Calculus II&#10;Build a portfolio project" /></label><button type="button" className="button-primary mt-3" onClick={saveGoals}>Save goals</button></div><div className="mt-5"><CharacterEquipmentPreview /></div><div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-5"><button className="button-secondary" onClick={() => setMode('create')}><Plus size={16} /> Register profile</button><div className="flex gap-2">    <button className="button-secondary" onClick={() => { if (activeProfile) { setForm({ username: activeProfile.username, title: activeProfile.title, avatar: activeProfile.avatar }); setMode('edit'); } }}><UserRound size={15} /> Edit profile</button><button className="button-secondary" onClick={exportProfile}><Download size={15} /> Export</button><label className="button-secondary"><Upload size={15} /> Import<input type="file" accept="application/json,.json" className="hidden" onChange={importProfile} /></label><button className="button-secondary text-amber-300" onClick={confirmReset}><RotateCcw size={15} /> Reset</button><button className="button-secondary text-rose-300" onClick={confirmDelete}><Trash2 size={15} /> Delete</button></div></div></> : <form onSubmit={submit}><div className="mt-6 grid gap-4"><label className="field"><span>Username</span><input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Enter your codename" /></label><label className="field"><span>Player title</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Nexus Initiate" /></label><AvatarSelector value={form.avatar} onChange={(avatar) => setForm({ ...form, avatar })} /></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={() => setMode('list')}>Back</button><button type="submit" className="button-primary"><UserRound size={16} /> {mode === 'edit' ? 'Save profile' : 'Register & enter'}</button></div></form>}
  </div></div>;
};

export default ProfileSwitcher;
