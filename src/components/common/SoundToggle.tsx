import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { soundManager } from '../../utils/soundManager';

export const SoundToggle: React.FC = () => {
  const { t } = useTranslation();
  const [muted, setMuted] = useState(soundManager.isMuted());

  useEffect(() => soundManager.subscribe(setMuted), []);

  return <button className="profile-trigger" onClick={() => soundManager.toggleMute()} aria-label={muted ? t('audio.unmute') : t('audio.mute')} title={muted ? t('audio.unmute') : t('audio.mute')}>
    {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
    <span className="hidden sm:inline">{muted ? t('audio.muted') : t('audio.sound')}</span>
  </button>;
};

export default SoundToggle;
