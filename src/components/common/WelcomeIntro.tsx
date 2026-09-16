import React, { useEffect, useState } from 'react';
import { Crosshair, Sparkles } from 'lucide-react';
import CustomActionButton from './CustomActionButton';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const INTRO_SESSION_KEY = 'nexus-rankup-intro-seen';

interface WelcomeIntroProps {
  onComplete: (goal: string) => void;
  profiles?: Array<{ id: string; username: string; avatar: string; title: string }>;
  onSwitchProfile?: (profileId: string) => void;
}

export const WelcomeIntro: React.FC<WelcomeIntroProps> = ({ onComplete, profiles = [], onSwitchProfile }) => {
  const { t } = useTranslation();
  const [isLeaving, setIsLeaving] = useState(false);
  const [goal, setGoal] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        begin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLeaving, goal]);

  const begin = () => {
    if (isLeaving || !goal.trim()) return;
    window.sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    setIsLeaving(true);
    window.setTimeout(() => onComplete(goal.trim()), 650);
  };

  return (
    <div className={`welcome-intro ${isLeaving ? 'welcome-intro--leaving' : ''}`} role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="welcome-intro__grid" aria-hidden="true" />
      <div className="welcome-intro__orb welcome-intro__orb--one" aria-hidden="true" />
      <div className="welcome-intro__orb welcome-intro__orb--two" aria-hidden="true" />
      <div className="welcome-intro__content">
        <div className="welcome-intro__sigil nexus-sigil-glow" aria-hidden="true">
          <span className="welcome-intro__sigil-ring welcome-intro__sigil-ring--outer" />
          <span className="welcome-intro__sigil-ring welcome-intro__sigil-ring--inner" />
          <Crosshair className="welcome-intro__sigil-crosshair" size={25} />
          <span className="welcome-intro__sigil-symbol">N<span>/S</span></span>
          <Sparkles className="welcome-intro__sigil-sparkles" size={16} />
        </div>
        <p className="eyebrow welcome-intro__eyebrow">{t('intro.eyebrow')}</p>
        <h1 id="welcome-title" className="welcome-intro__title">{t('intro.title')} <span>{t('intro.brand')}</span></h1>
        <p className="welcome-intro__subtitle">{t('intro.subtitle')}</p>
        <p className="welcome-intro__copy">{t('intro.copy')}</p>
        <div className="welcome-intro__controls">
          <LanguageSelector />
        </div>
        <label className="field mt-8 text-left">
          <span>Primary real-life goal</span>
          <input required value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="e.g. Learn programming or get fit" />
        </label>
        {profiles.length > 0 && onSwitchProfile && <div className="mt-4 text-left"><p className="eyebrow mb-2">QUICK LOGIN / SWITCH ACCOUNT</p><div className="flex flex-wrap gap-2">{profiles.map((profile) => <button type="button" key={profile.id} className="tag bg-white/5 text-slate-300 hover:text-cyan-300" onClick={() => onSwitchProfile(profile.id)}>{profile.avatar} {profile.username}</button>)}</div></div>}
        <CustomActionButton className="mt-5 min-w-52" variant="cyan" onClick={begin}>{t('intro.enter')}</CustomActionButton>
        <p className="welcome-intro__hint">{t('intro.hint')}</p>
      </div>
    </div>
  );
};

export const shouldShowWelcomeIntro = () => {
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) !== 'true';
  } catch {
    return true;
  }
};

export default WelcomeIntro;
