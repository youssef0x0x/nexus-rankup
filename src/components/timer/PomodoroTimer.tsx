import React, { useEffect, useState } from 'react';
import { BrainCircuit, Check, Pause, Play, RotateCcw } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import { useTranslation } from 'react-i18next';
import { soundManager } from '../../utils/soundManager';
import { ActivityCategory } from '../../types';

const SESSION_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export const PomodoroTimer: React.FC = () => {
  const { t } = useTranslation();
  const { completePomodoro } = useGameState();
  const [category, setCategory] = useState<ActivityCategory>('planning');
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSecondsLeft((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (secondsLeft !== 0 || completed) return;
    setRunning(false);
    setCompleted(true);
    soundManager.playTimerEnd();
    completePomodoro(mode === 'break' ? 'rest' : category);
  }, [secondsLeft, completed, completePomodoro, category, mode]);

  const reset = () => { setRunning(false); setCompleted(false); setSecondsLeft(mode === 'focus' ? SESSION_SECONDS : BREAK_SECONDS); };
  const progress = (((mode === 'focus' ? SESSION_SECONDS : BREAK_SECONDS) - secondsLeft) / (mode === 'focus' ? SESSION_SECONDS : BREAK_SECONDS)) * 100;
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  const toggleRunning = () => { setRunning((value) => { const next = !value; if (next) soundManager.playTimerStart(); return next; }); };
  const changeMode = (nextMode: 'focus' | 'break') => { setMode(nextMode); setRunning(false); setCompleted(false); setSecondsLeft(nextMode === 'focus' ? SESSION_SECONDS : BREAK_SECONDS); };
  return <section className="glass-card p-6 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"><BrainCircuit size={24} /></div><p className="eyebrow mt-4">{t('timer.protocol')}</p><h2 className="mt-1 text-lg font-bold text-white">{t('timer.title')}</h2><div className="mt-4 flex justify-center gap-2"><button className={`filter-pill ${mode === 'focus' ? 'filter-active' : ''}`} onClick={() => changeMode('focus')}>Focus 25m</button><button className={`filter-pill ${mode === 'break' ? 'filter-active' : ''}`} onClick={() => changeMode('break')}>Rest 5m</button></div><label className="field mx-auto mt-4 max-w-xs text-left"><span>{t('timer.category')}</span><select value={category} onChange={(event) => setCategory(event.target.value as ActivityCategory)} disabled={running || completed || mode === 'break'}><option value="study">{t('timer.study')}</option><option value="fitness">{t('timer.fitness')}</option><option value="planning">{t('timer.planning')}</option><option value="rest">Rest chamber</option></select></label><div className="timer-ring mx-auto mt-6" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><div className="timer-inner"><span className="font-mono text-4xl font-bold tracking-tight text-cyan-300">{minutes}:{seconds}</span><span className="text-[10px] uppercase tracking-[.25em] text-slate-500">{mode === 'focus' ? t('timer.focusTime') : 'Rest chamber'}</span></div></div>{completed ? <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-300"><Check size={17} /> {mode === 'focus' ? `${t('timer.complete')} · +35 XP · +20 credits` : 'Recovery logged · +10 XP'}</div> : <div className="mt-6 flex justify-center gap-2"><button className="button-primary" onClick={toggleRunning}>{running ? <Pause size={16} /> : <Play size={16} />}{running ? t('timer.pause') : t('timer.start')}</button><button className="button-secondary" onClick={reset} aria-label="Reset timer"><RotateCcw size={16} /></button></div>}<p className="mt-4 text-xs text-slate-500">{t('timer.fullSession')}</p></section>;
};

export default PomodoroTimer;
