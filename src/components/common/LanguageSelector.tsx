import React, { useState } from 'react';
import { Check, Globe2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n, { supportedLanguages } from '../../i18n';

export const LanguageSelector: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = supportedLanguages.find((language) => language.code === i18n.language) ?? supportedLanguages[0];

  return <>
    <button className="profile-trigger" onClick={() => setOpen(true)} aria-label={t('header.selectLanguage')}>
      <Globe2 size={16} />
      <span className="hidden sm:inline">{current.flag} {current.code.toUpperCase()}</span>
    </button>
    {open && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="language-title">
      <section className="glass-card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <div><p className="eyebrow">{t('settings.language')}</p><h2 id="language-title" className="mt-1 text-xl font-bold text-white">{t('header.selectLanguage')}</h2></div>
          <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {supportedLanguages.map((language) => <button key={language.code} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${language.code === current.code ? 'border-cyan-300/60 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/[.03] text-slate-300 hover:border-cyan-300/30'}`} onClick={() => { void i18n.changeLanguage(language.code); setOpen(false); }}>
            <span className="flex items-center gap-3"><span className="text-xl">{language.flag}</span><span>{language.label}</span></span>
            {language.code === current.code && <Check size={16} className="text-cyan-300" />}
          </button>)}
        </div>
      </section>
    </div>}
  </>;
};

export default LanguageSelector;
