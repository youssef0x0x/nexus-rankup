import React from 'react';
import { Award, CalendarDays, Clock3, Home, ListChecks } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const items = [{ id: 'dashboard', key: 'home', icon: Home }, { id: 'calendar', key: 'calendar', icon: CalendarDays }, { id: 'quests', key: 'quests', icon: ListChecks }, { id: 'timer', key: 'focus', icon: Clock3 }, { id: 'rewards', key: 'rewards', icon: Award }];

export const Navigation: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => { const { t } = useTranslation(); return <aside className="nav-shell"><div className="brand-mark"><span>N</span><div><strong>NEXUS</strong><small>RANKUP OS</small></div></div><nav>{items.map(({ id, key, icon: Icon }) => <button key={id} className="nav-button" onClick={() => onNavigate?.(id)}><Icon size={19} /><span>{t(`nav.${key}`)}</span></button>)}</nav><div className="nav-footer"><span className="online-dot" /> <span>v1.0.0 // {t('header.online').toUpperCase()}</span></div></aside>; };

export default Navigation;
