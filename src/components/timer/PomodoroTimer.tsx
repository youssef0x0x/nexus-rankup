import React, { useEffect, useState } from 'react';
import { BrainCircuit, Check, Pause, Play, RotateCcw } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';

const SESSION_SECONDS = 25 * 60;

export const PomodoroTimer: React.FC = () => {
  const { completePomodoro } = useGameState();
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
    completePomodoro();
  }, [secondsLeft, completed, completePomodoro]);

  const reset = () => { setRunning(false); setCompleted(false); setSecondsLeft(SESSION_SECONDS); };
  const progress = ((SESSION_SECONDS - secondsLeft) / SESSION_SECONDS) * 100;
  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const seconds = (secondsLeft % 60).toString().padStart(2, '0');

  return <section className="glass-card p-6 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"><BrainCircuit size={24} /></div><p className="eyebrow mt-4">FOCUS PROTOCOL</p><h2 className="mt-1 text-lg font-bold text-white">Pomodoro session</h2><div className="timer-ring mx-auto mt-6" style={{ '--progress': `${progress * 3.6}deg` } as React.CSSProperties}><div className="timer-inner"><span className="font-mono text-4xl font-bold tracking-tight text-cyan-300">{minutes}:{seconds}</span><span className="text-[10px] uppercase tracking-[.25em] text-slate-500">focus time</span></div></div>{completed ? <div className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-300"><Check size={17} /> Session complete · +35 XP · +20 credits</div> : <div className="mt-6 flex justify-center gap-2"><button className="button-primary" onClick={() => setRunning((value) => !value)}>{running ? <Pause size={16} /> : <Play size={16} />}{running ? 'Pause' : 'Start focus'}</button><button className="button-secondary" onClick={reset} aria-label="Reset timer"><RotateCcw size={16} /></button></div>}<p className="mt-4 text-xs text-slate-500">Complete the full session to earn Discipline +1.</p></section>;
};

export default PomodoroTimer;
