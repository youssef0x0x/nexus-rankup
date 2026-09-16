import React from 'react';
import { Award, Clock3, Home, ListChecks } from 'lucide-react';

const items = [{ id: 'dashboard', label: 'Home', icon: Home }, { id: 'quests', label: 'Quests', icon: ListChecks }, { id: 'timer', label: 'Focus', icon: Clock3 }, { id: 'rewards', label: 'Rewards', icon: Award }];

export const Navigation: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => <aside className="nav-shell"><div className="brand-mark"><span>N</span><div><strong>NEXUS</strong><small>RANKUP OS</small></div></div><nav>{items.map(({ id, label, icon: Icon }) => <button key={id} className="nav-button" onClick={() => onNavigate?.(id)}><Icon size={19} /><span>{label}</span></button>)}</nav><div className="nav-footer"><span className="online-dot" /> <span>v1.0.0 // ONLINE</span></div></aside>;

export default Navigation;
