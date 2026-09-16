const SOUND_STORAGE_KEY = 'nexus-sound-muted';

type SoundName = 'click' | 'questComplete' | 'questAccept' | 'timerStart' | 'timerEnd' | 'rankUp' | 'ssRank';
type Listener = (muted: boolean) => void;

let audioContext: AudioContext | null = null;
let muted = false;
const listeners = new Set<Listener>();

try {
  muted = window.localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
} catch {
  muted = false;
}

const getAudioContext = () => {
  if (typeof window === 'undefined' || muted) return null;
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
};

const tone = (frequency: number, duration: number, delay = 0, type: OscillatorType = 'sine', volume = 0.045) => {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
};

const sounds: Record<SoundName, () => void> = {
  click: () => tone(520, 0.05, 0, 'square', 0.025),
  questComplete: () => { tone(523, 0.12); tone(784, 0.2, 0.1); },
  questAccept: () => { tone(392, 0.08); tone(587, 0.12, 0.07); },
  timerStart: () => { tone(330, 0.1); tone(494, 0.16, 0.08); },
  timerEnd: () => { tone(659, 0.14); tone(988, 0.3, 0.12); },
  rankUp: () => { tone(440, 0.12); tone(659, 0.14, 0.12); tone(880, 0.3, 0.24); },
  ssRank: () => { tone(523, 0.14); tone(784, 0.14, 0.12); tone(1047, 0.18, 0.24); tone(1568, 0.42, 0.38); },
};

export const soundManager = {
  isMuted: () => muted,
  toggleMute: () => {
    muted = !muted;
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(muted));
    } catch {
      // Audio remains usable when browser storage is unavailable.
    }
    listeners.forEach((listener) => listener(muted));
    return muted;
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  play: (name: SoundName) => sounds[name](),
  playClick: () => sounds.click(),
  playQuestComplete: () => sounds.questComplete(),
  playQuestAccept: () => sounds.questAccept(),
  playTimerStart: () => sounds.timerStart(),
  playTimerEnd: () => sounds.timerEnd(),
  playRankUp: () => sounds.rankUp(),
  playSSRank: () => sounds.ssRank(),
};

export type { SoundName };
