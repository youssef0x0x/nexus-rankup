import React, { useMemo, useState } from 'react';
import { Bot, Filter, ListChecks, Plus, Search, UserRound } from 'lucide-react';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import { QuestType } from './types';
import Navigation from './components/common/Navigation';
import PlayerStatus from './components/dashboard/PlayerStatus';
import DailyMissionCard from './components/dashboard/DailyMissionCard';
import NextQuestCard from './components/dashboard/NextQuestCard';
import QuestCard from './components/quests/QuestCard';
import QuestModal from './components/quests/QuestModal';
import NewQuestModal from './components/quests/NewQuestModal';
import PomodoroTimer from './components/timer/PomodoroTimer';
import RewardsShop from './components/rewards/RewardsShop';
import ProfileSwitcher from './components/common/ProfileSwitcher';
import AIQuestGenerator from './components/quests/AIQuestGenerator';

type View = 'dashboard' | 'quests' | 'timer' | 'rewards';
const categories: Array<'All' | QuestType> = ['All', 'Daily', 'Weekly', 'Main', 'Side', 'Challenge'];

const MainAppContent: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [showNewQuest, setShowNewQuest] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [status, setStatus] = useState<'All' | 'Active' | 'Completed'>('All');
  const [category, setCategory] = useState<'All' | QuestType>('All');
  const [query, setQuery] = useState('');
  const { state, activeProfile } = useGameState();

  const filteredQuests = useMemo(() => state.quests.filter((quest) => {
    const matchesStatus = status === 'All' || (status === 'Completed' ? quest.completed : !quest.completed);
    const matchesCategory = category === 'All' || quest.type === category;
    const matchesQuery = !query || `${quest.title} ${quest.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesCategory && matchesQuery;
  }), [category, query, state.quests, status]);

  const selected = state.quests.find((quest) => quest.id === selectedQuest);
  const navigate = (nextView: string) => setView(nextView as View);
  const title = view === 'dashboard' ? 'Command center' : view === 'quests' ? 'Quest board' : view === 'timer' ? 'Focus chamber' : 'Rewards shop';

  return <div className="app-shell"><Navigation onNavigate={navigate} /><main className="app-main"><header className="app-header"><div><p className="eyebrow">NEXUS / PRODUCTIVITY RPG</p><h1 className="page-title">{title}</h1></div><div className="flex items-center gap-3"><div className="hidden items-center gap-3 sm:flex"><span className="online-dot" /> <span className="text-xs uppercase tracking-widest text-slate-500">System online</span></div><button className="profile-trigger" onClick={() => setShowProfiles(true)}><span>{activeProfile?.avatar ?? '🧑‍💻'}</span><span className="hidden text-left sm:block"><strong>{activeProfile?.username ?? 'Rookie'}</strong><small>{activeProfile?.title ?? 'Nexus Initiate'}</small></span><UserRound size={16} /></button></div></header>
    {view === 'dashboard' && <div className="space-y-5"><PlayerStatus /><div className="grid gap-5 xl:grid-cols-[1fr_360px]"><section><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">DAILY OPERATIONS</p><h2 className="text-xl font-bold text-white">Today's missions</h2></div><button className="button-ghost" onClick={() => setView('quests')}>View all <ListChecks size={15} /></button></div><div className="grid gap-3 sm:grid-cols-2">{state.quests.filter((quest) => quest.type === 'Daily').map((quest) => <DailyMissionCard key={quest.id} quest={quest} />)}</div></section><aside className="space-y-5"><NextQuestCard quest={state.quests.find((quest) => !quest.completed)} /><PomodoroTimer /></aside></div></div>}
    {view === 'quests' && <section className="space-y-5"><div className="glass-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{(['All', 'Active', 'Completed'] as const).map((item) => <button key={item} className={`filter-pill ${status === item ? 'filter-active' : ''}`} onClick={() => setStatus(item)}>{item}</button>)}</div><div className="flex flex-col gap-2 sm:flex-row"><label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quests" /></label><label className="select-box"><Filter size={15} /><select value={category} onChange={(e) => setCategory(e.target.value as 'All' | QuestType)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button-secondary" onClick={() => setShowAIGenerator(true)}><Bot size={17} /> AI quest</button><button className="button-primary" onClick={() => setShowNewQuest(true)}><Plus size={17} /> New quest</button></div></div><div className="flex items-center justify-between"><div><p className="eyebrow">ACTIVE MISSIONS</p><h2 className="text-xl font-bold text-white">{filteredQuests.length} quests found</h2></div></div>{filteredQuests.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredQuests.map((quest) => <QuestCard key={quest.id} quest={quest} onOpen={() => setSelectedQuest(quest.id)} onEdit={() => setEditingQuestId(quest.id)} onDelete={() => setSelectedQuest(null)} />)}</div> : <div className="glass-card p-10 text-center text-slate-500">No quests match this filter.</div>}</section>}
    {view === 'timer' && <div className="grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,480px)_1fr]"><PomodoroTimer /><div className="glass-card flex flex-col justify-center p-7"><p className="eyebrow">FOCUS INTEL</p><h2 className="mt-2 text-2xl font-bold text-white">Small sessions. Serious momentum.</h2><p className="mt-3 leading-7 text-slate-400">A complete 25-minute focus protocol rewards your Discipline stat and sends credits straight to the shop.</p><div className="mt-6 grid grid-cols-3 gap-3"><div className="stat-card"><strong className="text-cyan-300">25m</strong><span>per session</span></div><div className="stat-card"><strong className="text-purple-300">+35</strong><span>XP reward</span></div><div className="stat-card"><strong className="text-amber-300">+20</strong><span>credits</span></div></div></div></div>}
    {view === 'rewards' && <RewardsShop />}
    {selected && <QuestModal quest={selected} onClose={() => setSelectedQuest(null)} />}{showNewQuest && <NewQuestModal onClose={() => setShowNewQuest(false)} />}{editingQuestId && <NewQuestModal quest={state.quests.find((quest) => quest.id === editingQuestId)} onClose={() => setEditingQuestId(null)} />}{showProfiles && <ProfileSwitcher onClose={() => setShowProfiles(false)} />}{showAIGenerator && <AIQuestGenerator onClose={() => setShowAIGenerator(false)} />}
  </main></div>;
};

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <main className="flex min-h-screen items-center justify-center bg-[#03050b] p-6 text-white"><section className="glass-card w-full max-w-xl border-rose-400/30 p-6"><p className="eyebrow text-rose-300">NEXUS RECOVERY MODE</p><h1 className="mt-2 text-2xl font-black">The interface hit an unexpected error.</h1><p className="mt-4 rounded-lg border border-rose-400/20 bg-rose-400/5 p-4 font-mono text-sm leading-6 text-rose-200">{this.state.error.message}</p><button className="button-primary mt-5" onClick={() => window.location.reload()}>Reload application</button></section></main>;
    }
    return this.props.children;
  }
}

const App: React.FC = () => <ErrorBoundary><GameStateProvider><MainAppContent /></GameStateProvider></ErrorBoundary>;
export default App;
