import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Bot, Filter, HelpCircle, ListChecks, Plus, Search, UserRound, X } from 'lucide-react';
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
import FocusAnalytics from './components/timer/FocusAnalytics';
import ShopModal from './components/rewards/ShopModal';
import ProfileSwitcher from './components/common/ProfileSwitcher';
import AIQuestGenerator from './components/quests/AIQuestGenerator';
import WelcomeIntro, { shouldShowWelcomeIntro } from './components/common/WelcomeIntro';
import LanguageSelector from './components/common/LanguageSelector';
import { useTranslation } from 'react-i18next';
import SoundToggle from './components/common/SoundToggle';
import SystemNotification from './components/common/SystemNotification';
import { soundManager } from './utils/soundManager';
import TutorialOverlay, { shouldShowTutorial, TutorialStep } from './components/common/TutorialOverlay';
import AuthModal from './components/common/AuthModal';
import CalendarView from './components/calendar/CalendarView';
import BossBattleSection from './components/dashboard/BossBattleSection';

type View = 'dashboard' | 'calendar' | 'quests' | 'timer' | 'rewards';
const categories: Array<'All' | QuestType> = ['All', 'Daily', 'Weekly', 'Main', 'Epic', 'Side', 'Challenge'];

const MainAppContent: React.FC = () => {
  const { t } = useTranslation();
  const [showIntro, setShowIntro] = useState(() => shouldShowWelcomeIntro());
  const [showTutorial, setShowTutorial] = useState(() => shouldShowTutorial());
  const [tutorialRun, setTutorialRun] = useState(0);
  const [showTutorialHint, setShowTutorialHint] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [showNewQuest, setShowNewQuest] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [showProfiles, setShowProfiles] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [status, setStatus] = useState<'All' | 'Active' | 'Completed'>('All');
  const [category, setCategory] = useState<'All' | QuestType>('All');
  const [query, setQuery] = useState('');
  const { state, activeProfile, profiles, setProfileGoals, generateAIQuests, switchProfile } = useGameState();
  const [notification, setNotification] = useState<{ message: string; rankUp?: boolean } | null>(null);
  const previousRank = useRef(state.player.rank);
  const previousCompletedQuestIds = useRef(new Set(state.quests.filter((quest) => quest.completed).map((quest) => quest.id)));
  const previousFailedQuestIds = useRef(new Set(state.quests.filter((quest) => quest.failed).map((quest) => quest.id)));

  useEffect(() => {
    const handleButtonInteraction = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest('button')) return;
      if (event.type === 'click') soundManager.playClick();
      const relatedTarget = event instanceof PointerEvent && event.relatedTarget instanceof Node ? event.relatedTarget : null;
      if (event.type === 'pointerover' && target.closest('button') === target && !target.closest('button')?.contains(relatedTarget)) soundManager.playClick();
    };
    document.addEventListener('click', handleButtonInteraction);
    document.addEventListener('pointerover', handleButtonInteraction);
    return () => {
      document.removeEventListener('click', handleButtonInteraction);
      document.removeEventListener('pointerover', handleButtonInteraction);
    };
  }, []);

  useEffect(() => {
    const completedQuestIds = new Set(state.quests.filter((quest) => quest.completed).map((quest) => quest.id));
    const failedQuestIds = new Set(state.quests.filter((quest) => quest.failed).map((quest) => quest.id));
    const questCompleted = [...completedQuestIds].some((id) => !previousCompletedQuestIds.current.has(id));
    const rankUp = state.player.rank !== previousRank.current;
    if (questCompleted) {
      soundManager.playQuestComplete();
      setNotification({ message: t('audio.questComplete') });
    }
    if (rankUp) {
      if (state.player.rank === 'SS') soundManager.playSSRank();
      else soundManager.playRankUp();
      setNotification({ message: state.player.rank === 'SS' ? t('audio.ssRank') : t('audio.rankUp', { rank: state.player.rank }), rankUp: true });
    }
    if ([...failedQuestIds].some((id) => !previousFailedQuestIds.current.has(id))) {
      soundManager.playRankUp();
      setNotification({ message: t('audio.questFailed'), rankUp: true });
    }
    previousCompletedQuestIds.current = completedQuestIds;
    previousFailedQuestIds.current = failedQuestIds;
    previousRank.current = state.player.rank;
  }, [state.player.rank, state.quests, t]);

  const filteredQuests = useMemo(() => state.quests.filter((quest) => {
    const matchesStatus = status === 'All' || (status === 'Completed' ? quest.completed : !quest.completed);
    const matchesCategory = category === 'All' || quest.type === category;
    const matchesQuery = !query || `${quest.title} ${quest.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesCategory && matchesQuery;
  }), [category, query, state.quests, status]);

  const selected = state.quests.find((quest) => quest.id === selectedQuest);
  const penaltyQuest = state.player.activePenaltyQuestId ? state.quests.find((quest) => quest.id === state.player.activePenaltyQuestId) : undefined;
  const navigate = (nextView: string) => setView(nextView as View);
  const title = view === 'dashboard' ? t('views.dashboard') : view === 'calendar' ? t('views.calendar') : view === 'quests' ? t('views.quests') : view === 'timer' ? t('views.timer') : t('views.rewards');
  const startTutorial = () => {
    window.localStorage.removeItem('nexus-tutorial-completed');
    setShowTutorialHint(false);
    setShowTutorial(false);
    window.setTimeout(() => {
      setTutorialRun((value) => value + 1);
      setShowTutorial(true);
    }, 0);
  };

  if (!profiles.length || !activeProfile) return <AuthModal />;
  return <div className={`app-shell theme-${state.player.activeTheme ?? 'cyan'}`}><Navigation onNavigate={navigate} /><main className="app-main"><header className="app-header"><div><p className="eyebrow">{t('header.eyebrow')}</p><h1 className="page-title">{title}</h1></div><div className="app-header__actions"><div className="hidden items-center gap-3 sm:flex"><span className="online-dot" /> <span className="text-xs uppercase tracking-widest text-slate-500">{t('header.online')}</span></div><div className="header-help"><button className="icon-button" onClick={startTutorial} aria-label={t('tutorial.open')} title={t('tutorial.open')}><HelpCircle size={18} /></button>{showTutorialHint && <span className="header-help__hint">{t('tutorial.hint')}</span>}</div><SoundToggle /><LanguageSelector /><button className="profile-trigger" onClick={() => setShowProfiles(true)}><span>{activeProfile.avatar}</span><span className="hidden text-left sm:block"><strong>{activeProfile.username}</strong><small>{activeProfile.title}</small></span><UserRound size={16} /></button></div></header>
    {view === 'dashboard' && <div className="space-y-5"><div data-tour="player-stats"><PlayerStatus onEditProfile={() => setShowProfiles(true)} /></div><div className="grid gap-5 xl:grid-cols-[1fr_360px]"><section className="space-y-5"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">DAILY OPERATIONS</p><h2 className="text-xl font-bold text-white">Today's missions</h2></div><button className="button-ghost" onClick={() => setView('quests')}>View all <ListChecks size={15} /></button></div><div data-tour="quests" className="grid gap-3 sm:grid-cols-2">{state.quests.filter((quest) => quest.type === 'Daily').map((quest) => <DailyMissionCard key={quest.id} quest={quest} />)}</div><BossBattleSection /></section><aside className="space-y-5"><NextQuestCard quest={state.quests.find((quest) => !quest.completed && !quest.failed)} onOpen={() => { const nextQuest = state.quests.find((quest) => !quest.completed && !quest.failed); if (nextQuest) setSelectedQuest(nextQuest.id); }} /><div data-tour="pomodoro"><PomodoroTimer /></div></aside></div></div>}
    {view === 'calendar' && <CalendarView onCreateQuest={() => setShowNewQuest(true)} />}
    {view === 'quests' && <section className="space-y-5"><div className="glass-card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{(['All', 'Active', 'Completed'] as const).map((item) => <button key={item} className={`filter-pill ${status === item ? 'filter-active' : ''}`} onClick={() => setStatus(item)}>{item}</button>)}</div><div className="flex flex-col gap-2 sm:flex-row"><label className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search quests" /></label><label className="select-box"><Filter size={15} /><select value={category} onChange={(e) => setCategory(e.target.value as 'All' | QuestType)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button-secondary" onClick={() => setShowAIGenerator(true)}><Bot size={17} /> AI quest</button><button className="button-primary" onClick={() => setShowNewQuest(true)}><Plus size={17} /> New quest</button></div></div><div className="flex items-center justify-between"><div><p className="eyebrow">ACTIVE MISSIONS</p><h2 className="text-xl font-bold text-white">{filteredQuests.length} quests found</h2></div></div>{filteredQuests.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredQuests.map((quest) => <QuestCard key={quest.id} quest={quest} onOpen={() => setSelectedQuest(quest.id)} onEdit={() => setEditingQuestId(quest.id)} onDelete={() => setSelectedQuest(null)} />)}</div> : <div className="glass-card p-10 text-center text-slate-500">No quests match this filter.</div>}</section>}
    {view === 'timer' && <div className="grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,480px)_1fr]"><PomodoroTimer /><FocusAnalytics /></div>}
    {view === 'rewards' && <div data-tour="rewards"><ShopModal /></div>}
    {selected && <QuestModal quest={selected} onClose={() => setSelectedQuest(null)} />}{showNewQuest && <NewQuestModal onClose={() => setShowNewQuest(false)} />}{editingQuestId && <NewQuestModal quest={state.quests.find((quest) => quest.id === editingQuestId)} onClose={() => setEditingQuestId(null)} />}{showProfiles && <ProfileSwitcher onClose={() => setShowProfiles(false)} />}{showAIGenerator && <AIQuestGenerator onClose={() => setShowAIGenerator(false)} />}
  </main>{notification && <SystemNotification message={notification.message} rankUp={notification.rankUp} onClose={() => setNotification(null)} />}{penaltyQuest && !penaltyQuest.completed && <div className="modal-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="penalty-title"><div className="modal-panel max-w-lg border-rose-400/40"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-rose-300">RED THREAT WARNING</p><h2 id="penalty-title" className="mt-1 flex items-center gap-2 text-2xl font-black text-white"><AlertTriangle size={22} className="text-rose-300" /> PENALTY QUEST DETECTED</h2></div><button type="button" className="icon-button" onClick={() => setSelectedQuest(penaltyQuest.id)} aria-label="View penalty quest"><X size={18} /></button></div><p className="mt-4 leading-7 text-slate-300">A Daily quest was missed before reset. Complete <strong className="text-rose-200">{penaltyQuest.title}</strong> to unlock normal quests again.</p><div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-sm text-rose-100">{penaltyQuest.subtasks?.map((task) => <p key={task.id} className="mb-2 last:mb-0">• {task.title}</p>)}</div><div className="mt-6 flex justify-end"><button type="button" className="button-primary border-rose-300/40 bg-rose-400/20 text-rose-100" onClick={() => setSelectedQuest(penaltyQuest.id)}>Open corrective quest</button></div></div></div>}{showIntro && <WelcomeIntro profiles={profiles} onSwitchProfile={(profileId) => { switchProfile(profileId); setShowIntro(false); }} onComplete={(goal) => { setProfileGoals(goal, []); void generateAIQuests(goal); setShowIntro(false); }} />}{!showIntro && showTutorial && <TutorialOverlay key={tutorialRun} onComplete={() => { setShowTutorial(false); setShowTutorialHint(true); }} onStepChange={(step: TutorialStep) => setView(step === 'stats' || step === 'quests' || step === 'timer' ? 'dashboard' : 'rewards')} />}</div>;
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
