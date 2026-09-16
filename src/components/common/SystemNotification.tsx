import React, { useEffect } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { soundManager } from '../../utils/soundManager';

interface SystemNotificationProps {
  message: string;
  rankUp?: boolean;
  onClose: () => void;
}

export const SystemNotification: React.FC<SystemNotificationProps> = ({ message, rankUp = false, onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return <div className={`system-notification ${rankUp ? 'system-notification--warning' : ''}`} role="status" aria-live="assertive">
    <div className="system-notification__scanline" />
    <div className="flex items-start gap-3">
      <div className="system-notification__icon">{rankUp ? <AlertTriangle size={22} /> : <Check size={22} />}</div>
      <div className="min-w-0 flex-1"><p className="system-notification__label">{t('audio.systemNotification')}</p><p className="mt-2 text-sm font-semibold leading-6 text-cyan-50">{message}</p></div>
      <button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
    </div>
  </div>;
};

export default SystemNotification;
