import React, { useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { useTranslation } from 'react-i18next';
import AvatarSelector from './AvatarSelector';

export const AuthModal: React.FC = () => {
  const { t } = useTranslation();
  const { createProfile } = useGameState();
  const [form, setForm] = useState({ name: '', title: '', avatar: '🧑‍💻', playerClass: 'Shadow Assassin' });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.name.trim()) createProfile(form.name, form.avatar, `${form.title.trim() || form.playerClass} ${t('auth.playerTitleSuffix')}`, form.playerClass as 'Mage' | 'Shadow Assassin' | 'Tank' | 'Paladin' | 'Necromancer' | 'Striker');
  };
  return <div className="auth-screen"><form className="auth-panel" onSubmit={submit}><div className="auth-panel__sigil"><Shield size={28} /></div><p className="eyebrow">{t('auth.eyebrow')}</p><h1 className="mt-2 text-3xl font-black text-white">{t('auth.title')}</h1><p className="mt-3 text-sm leading-6 text-slate-400">{t('auth.description')}</p><div className="mt-6 grid gap-4"><label className="field"><span>{t('auth.name')}</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t('auth.namePlaceholder')} /></label><label className="field"><span>{t('auth.titleField')}</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={t('auth.titlePlaceholder')} /></label><label className="field"><span>{t('auth.class')}</span><select value={form.playerClass} onChange={(event) => setForm({ ...form, playerClass: event.target.value })}>{['Mage', 'Shadow Assassin', 'Tank', 'Paladin', 'Necromancer', 'Striker'].map((playerClass) => <option key={playerClass}>{playerClass}</option>)}</select></label><AvatarSelector value={form.avatar} onChange={(avatar) => setForm({ ...form, avatar })} /></div><button className="button-primary mt-6 w-full" type="submit"><Sparkles size={17} /> {t('auth.create')}</button></form></div>;
};

export default AuthModal;
