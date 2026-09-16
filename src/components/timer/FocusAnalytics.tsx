import React, { useState } from 'react';
import { Headphones, Moon, Music2, Volume2, VolumeX, Waves } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { soundManager } from '../../utils/soundManager';

const soundscapes = [
  { id: 'rain', label: 'Rain', icon: Waves },
  { id: 'synth', label: 'Synthwave', icon: Music2 },
  { id: 'night', label: 'Night Mode', icon: Moon },
] as const;

const FocusAnalytics: React.FC = () => {
  const { state } = useGameState();
  const [soundscape, setSoundscape] = useState<(typeof soundscapes)[number]['id'] | 'off'>('rain');
  const [muted, setMuted] = useState(soundManager.isMuted());
  const toggleMute = () => setMuted(soundManager.toggleMute());
  return <section className="glass-card focus-analytics p-6">
    <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">FOCUS ANALYTICS</p><h2 className="mt-1 text-xl font-black text-white">Your focus chamber</h2><p className="mt-2 text-sm leading-6 text-slate-400">Track today&apos;s momentum and set the atmosphere for your next session.</p></div><Headphones className="text-cyan-300" size={22} /></div>
    <div className="mt-6 grid grid-cols-2 gap-3"><div className="focus-metric"><strong>{state.player.focusMinutesToday}</strong><span>MINUTES TODAY</span></div><div className="focus-metric"><strong>{state.player.completedPomodoros}</strong><span>POMODOROS DONE</span></div></div>
    <div className="mt-6"><div className="flex items-center justify-between"><p className="eyebrow">SOUNDSCAPE</p><button type="button" className="icon-button p-1.5" onClick={toggleMute} aria-label={muted ? 'Unmute sound' : 'Mute sound'}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button></div><div className="mt-3 grid gap-2 sm:grid-cols-3">{soundscapes.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => { setSoundscape(id); soundManager.playClick(); }} className={`soundscape-button ${soundscape === id ? 'soundscape-button--active' : ''}`}><Icon size={15} />{label}</button>)}</div><button type="button" onClick={() => setSoundscape('off')} className={`mt-2 w-full soundscape-button ${soundscape === 'off' ? 'soundscape-button--active' : ''}`}>Silence</button></div>
  </section>;
};

export default FocusAnalytics;
