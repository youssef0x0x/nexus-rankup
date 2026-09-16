import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { avatarOptions } from '../../context/GameStateContext';
import { useTranslation } from 'react-i18next';

interface AvatarSelectorProps { value: string; onChange: (avatar: string) => void; }

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === 'string') onChange(reader.result); };
    reader.readAsDataURL(file);
  };
  return <div className="field"><span>{t('auth.avatar')}</span><div className="grid grid-cols-4 gap-2 sm:grid-cols-8">{avatarOptions.map((avatar) => <button type="button" key={avatar} onClick={() => onChange(avatar)} className={`rounded-lg border p-2 text-xl ${value === avatar ? 'border-cyan-300 bg-cyan-400/10' : 'border-white/10 bg-white/[.03]'}`}>{avatar}</button>)}</div><button type="button" className="button-secondary mt-3 w-fit" onClick={() => inputRef.current?.click()}><Upload size={15} /> {t('auth.uploadAvatar')}</button><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} /></div>;
};

export default AvatarSelector;
