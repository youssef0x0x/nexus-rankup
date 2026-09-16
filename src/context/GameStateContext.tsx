import React, { createContext, useContext, useEffect, useState } from 'react';
import { Achievement, GameState, PlayerStats, Profile, Quest, Reward, ShopReward, Rank, Subtask } from '../types';

const STORAGE_KEY = 'nexus_profiles_v1';
const LEGACY_KEY = 'nexus_game_state_v2';
const STAT_KEYS: Array<keyof PlayerStats> = ['strength', 'intelligence', 'agility', 'vitality', 'discipline'];
export const avatarOptions = ['🧙', '🧑‍💻', '🦾', '🥷', '🧠', '🚀', '🐉', '⚡'];

const defaultStats: PlayerStats = { strength: 5, intelligence: 5, agility: 5, vitality: 5, discipline: 5 };
const defaultRewards: ShopReward[] = [
  { id: 'reward-coffee', title: 'Coffee Break', description: 'Take a guilt-free 20 minute reset.', cost: 40, icon: '☕' },
  { id: 'reward-game', title: 'Gaming Session', description: 'Enjoy one focused hour of play.', cost: 120, icon: '🎮' },
  { id: 'reward-treat', title: 'Favorite Treat', description: 'Redeem your favorite snack or dessert.', cost: 80, icon: '🍰' },
  { id: 'reward-movie', title: 'Movie Night', description: 'A well-earned evening off.', cost: 180, icon: '🎬' },
];
const defaultQuests: Quest[] = [
  { id: 'q1', title: 'Hydration Protocol', description: 'Drink two full glasses of water before your next work block.', type: 'Daily', focusStat: 'vitality', reward: { xp: 10, credits: 5 }, completed: false, streak: 0, subtasks: [{ id: 'q1-a', title: 'Fill your bottle', completed: false }, { id: 'q1-b', title: 'Finish both glasses', completed: false }] },
  { id: 'q2', title: 'Journal Check-in', description: 'Reflect for 10 minutes and clear the mental cache.', type: 'Daily', focusStat: 'intelligence', reward: { xp: 15, credits: 8, statBoosts: { intelligence: 1 } }, completed: false, subtasks: [{ id: 'q2-a', title: 'Write three wins', completed: false }, { id: 'q2-b', title: 'Choose one priority', completed: false }] },
];

const createDefaultState = (username = 'Rookie', avatar = '🧑‍💻', title = 'Nexus Initiate'): GameState => ({
  player: { id: `player-${Date.now()}`, name: username, title, avatar, activeGoal: '', mainGoals: [], level: 1, xp: 0, credits: 0, stats: { ...defaultStats }, rank: 'E', achievements: [], activeDays: 1, currentStreak: 1, lastActiveDate: new Date().toISOString().slice(0, 10) },
  quests: defaultQuests.map((quest) => ({ ...quest, subtasks: quest.subtasks?.map((subtask) => ({ ...subtask })) })),
  goals: [], missions: [], calendar: [], shopRewards: defaultRewards.map((reward) => ({ ...reward })), redeemedRewardIds: [],
});

export const requiredXP = (level: number) => Math.floor(100 * Math.pow(1.18, level - 1));
const calculateRank = (level: number): Rank => level >= 50 ? 'S' : level >= 30 ? 'A' : level >= 20 ? 'B' : level >= 10 ? 'C' : level >= 5 ? 'D' : 'E';

const mergeState = (saved: Partial<GameState>, username?: string, avatar?: string, title?: string): GameState => {
  const fallback = createDefaultState(username, avatar, title);
  return {
    ...fallback, ...saved,
    player: { ...fallback.player, ...saved.player, stats: { ...defaultStats, ...saved.player?.stats }, avatar: saved.player?.avatar ?? avatar ?? fallback.player.avatar, title: saved.player?.title ?? title ?? fallback.player.title, activeGoal: saved.player?.activeGoal ?? fallback.player.activeGoal, mainGoals: saved.player?.mainGoals ?? fallback.player.mainGoals },
    quests: saved.quests?.length ? saved.quests : fallback.quests,
    shopRewards: saved.shopRewards?.length ? saved.shopRewards : defaultRewards,
    redeemedRewardIds: saved.redeemedRewardIds ?? [],
  };
};

interface GameStateContextValue {
  state: GameState;
  profiles: Profile[];
  activeProfile: Profile;
  addQuest: (quest: Quest) => void;
  updateQuest: (quest: Quest) => void;
  deleteQuest: (questId: string) => void;
  toggleSubtask: (questId: string, subtaskId: string) => void;
  completeQuest: (questId: string) => void;
  generateAIQuest: (goalOverride?: string) => void;
  setProfileGoals: (activeGoal: string, mainGoals: string[]) => void;
  grantReward: (reward: Reward) => void;
  addAchievement: (achievement: Achievement) => void;
  upgradeStat: (stat: keyof PlayerStats) => void;
  buyReward: (rewardId: string) => boolean;
  addCustomReward: (reward: ShopReward) => void;
  completePomodoro: () => void;
  createProfile: (username: string, avatar: string, title: string) => void;
  switchProfile: (profileId: string) => void;
  resetProgress: () => void;
  deleteProfile: () => void;
}

const GameStateContext = createContext<GameStateContextValue | undefined>(undefined);

const normalizeProfile = (profile: Partial<Profile> | null | undefined, index: number): Profile => {
  const savedState = profile?.state && typeof profile.state === 'object' ? profile.state : {};
  const state = mergeState(savedState as Partial<GameState>, profile?.username, profile?.avatar, profile?.title);
  return {
    id: typeof profile?.id === 'string' && profile.id ? profile.id : `profile-recovered-${index}`,
    username: state.player.name,
    avatar: state.player.avatar,
    title: state.player.title,
    state,
  };
};

const readProfiles = (): { profiles: Profile[]; activeId: string } => {
  const fallbackState = createDefaultState();
  const fallback = { profiles: [{ id: 'profile-default', username: fallbackState.player.name, avatar: fallbackState.player.avatar, title: fallbackState.player.title, state: fallbackState }], activeId: 'profile-default' };
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const stored = parsed as { profiles?: unknown; activeId?: unknown };
        const storedProfiles = Array.isArray(stored.profiles)
          ? stored.profiles.map((profile, index) => normalizeProfile(profile as Partial<Profile>, index))
          : [];
        if (storedProfiles.length > 0) {
          const activeId = typeof stored.activeId === 'string' && storedProfiles.some((profile) => profile.id === stored.activeId)
            ? stored.activeId
            : storedProfiles[0].id;
          return { profiles: storedProfiles, activeId };
        }
      }
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    let state = createDefaultState();
    if (legacy) {
      try {
        const parsedLegacy: unknown = JSON.parse(legacy);
        if (parsedLegacy && typeof parsedLegacy === 'object') state = mergeState(parsedLegacy as Partial<GameState>);
      } catch {
        state = createDefaultState();
      }
    }
    return { profiles: [{ id: 'profile-default', username: state.player.name, avatar: state.player.avatar, title: state.player.title, state }], activeId: 'profile-default' };
  } catch {
    return fallback;
  }
};

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = readProfiles();
  const [profiles, setProfiles] = useState<Profile[]>(initial.profiles);
  const [activeId, setActiveId] = useState(initial.activeId);
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? profiles[0] ?? normalizeProfile(undefined, 0);
  const state = activeProfile?.state ?? createDefaultState();

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles, activeId }));
    } catch {
      // Storage can be unavailable in private browsing or restricted embeds.
    }
  }, [profiles, activeId]);

  const updateActive = (updater: (current: GameState) => GameState) => {
    setProfiles((current) => current.map((profile) => {
      if (profile.id !== activeId) return profile;
      const nextState = updater(profile.state);
      return { ...profile, state: nextState, username: nextState.player.name, avatar: nextState.player.avatar, title: nextState.player.title };
    }));
  };

  const applyReward = (player: GameState['player'], reward: Reward) => {
    const next = { ...player, stats: { ...player.stats }, achievements: [...player.achievements] };
    next.xp += reward.xp ?? 0; next.credits += reward.credits ?? 0;
    while (next.xp >= requiredXP(next.level)) { next.xp -= requiredXP(next.level); next.level += 1; }
    next.rank = calculateRank(next.level);
    STAT_KEYS.forEach((key) => { next.stats[key] += reward.statBoosts?.[key] ?? 0; });
    if (reward.achievementId && !next.achievements.some((item) => item.id === reward.achievementId)) next.achievements.push({ id: reward.achievementId, title: reward.achievementId, awardedAt: new Date().toISOString() });
    return next;
  };
  const markActive = (player: GameState['player']) => {
    const today = new Date().toISOString().slice(0, 10);
    if (player.lastActiveDate === today) return player;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    return { ...player, activeDays: player.activeDays + 1, currentStreak: player.lastActiveDate === yesterday ? player.currentStreak + 1 : 1, lastActiveDate: today };
  };

  const addQuest = (quest: Quest) => updateActive((current) => ({ ...current, quests: [...current.quests, quest] }));
  const updateQuest = (quest: Quest) => updateActive((current) => ({ ...current, quests: current.quests.map((item) => item.id === quest.id ? quest : item) }));
  const deleteQuest = (questId: string) => updateActive((current) => ({ ...current, quests: current.quests.filter((quest) => quest.id !== questId) }));
  const toggleSubtask = (questId: string, subtaskId: string) => updateActive((current) => ({ ...current, quests: current.quests.map((quest) => quest.id !== questId ? quest : { ...quest, subtasks: quest.subtasks?.map((task) => task.id === subtaskId ? { ...task, completed: !task.completed } : task) }) }));
  const completeQuest = (questId: string) => updateActive((current) => {
    const quest = current.quests.find((item) => item.id === questId);
    if (!quest || quest.completed) return current;
    return { ...current, quests: current.quests.map((item) => item.id === questId ? { ...item, completed: true, subtasks: item.subtasks?.map((task) => ({ ...task, completed: true })) } : item), player: applyReward(markActive(current.player), quest.reward) };
  });
  const grantReward = (reward: Reward) => updateActive((current) => ({ ...current, player: applyReward(markActive(current.player), reward) }));
  const addAchievement = (achievement: Achievement) => updateActive((current) => ({ ...current, player: { ...current.player, achievements: current.player.achievements.some((item) => item.id === achievement.id) ? current.player.achievements : [...current.player.achievements, achievement] } }));
  const upgradeStat = (stat: keyof PlayerStats) => updateActive((current) => {
    const cost = Math.max(25, current.player.stats[stat] * 10);
    return current.player.credits < cost ? current : { ...current, player: { ...current.player, credits: current.player.credits - cost, stats: { ...current.player.stats, [stat]: current.player.stats[stat] + 1 } } };
  });
  const buyReward = (rewardId: string) => {
    const reward = state.shopRewards.find((item) => item.id === rewardId);
    if (!reward || state.redeemedRewardIds.includes(rewardId) || state.player.credits < reward.cost) return false;
    updateActive((current) => ({ ...current, player: { ...current.player, credits: current.player.credits - reward.cost }, redeemedRewardIds: [...current.redeemedRewardIds, rewardId] }));
    return true;
  };
  const addCustomReward = (reward: ShopReward) => updateActive((current) => ({ ...current, shopRewards: [...current.shopRewards, reward] }));
  const completePomodoro = () => grantReward({ xp: 35, credits: 20, statBoosts: { discipline: 1 } });

  const setProfileGoals = (activeGoal: string, mainGoals: string[]) => updateActive((current) => ({ ...current, player: { ...current.player, activeGoal: activeGoal.trim(), mainGoals: mainGoals.map((goal) => goal.trim()).filter(Boolean) } }));

  const generateAIQuest = (goalOverride?: string) => {
    const goal = (goalOverride ?? state.player.activeGoal).trim();
    const stat = STAT_KEYS.reduce((best, key) => state.player.stats[key] > state.player.stats[best] ? key : best, STAT_KEYS[0]);
    if (goal) {
      const goalLower = goal.toLowerCase();
      const focusStat: keyof PlayerStats = /fitness|health|run|strength|body|gym/.test(goalLower) ? 'vitality' : /code|program|software|cpp|c\+\+|data structure|portfolio/.test(goalLower) ? 'intelligence' : /discipline|habit|routine|daily/.test(goalLower) ? 'discipline' : 'intelligence';
      const goalType = /fitness|health|run|strength|body|gym/.test(goalLower) ? 'Vitality' : focusStat === 'discipline' ? 'Discipline' : 'Intelligence';
      const roadmap = [
        `1. Define the next measurable milestone for "${goal}"`,
        `2. Study or review one core concept required for "${goal}"`,
        `3. Complete a focused practice task and record the result`,
        `4. Write the next action that keeps this roadmap moving`,
      ];
      addQuest({ id: `ai-goal-${Date.now()}`, title: `[${goal}] Roadmap Mission ${state.player.level}`, description: `This personalized ${goalType} mission advances your primary goal, "${goal}". It converts the goal into a measurable practice loop: learn the relevant concept, apply it in a focused task, and document evidence of progress so the next mission can build on it.`, type: 'Challenge', focusStat, reward: { xp: 50 + state.player.level * 4, credits: 25 + state.player.level * 2, statBoosts: { [focusStat]: 1 } }, completed: false, subtasks: roadmap.map((title, index): Subtask => ({ id: `ai-goal-${Date.now()}-${index}`, title, completed: false })) });
      return;
    }
    const missions: Record<keyof PlayerStats, { title: string; description: string; subtasks: string[] }> = {
      intelligence: { title: 'Algorithm Challenge', description: `Rank ${state.player.rank} logic run: solve two problems just above your comfort zone.`, subtasks: ['Choose two logic problems', 'Solve without looking up the answer', 'Write one lesson learned'] },
      strength: { title: 'Execution Sprint', description: 'Turn one intimidating task into a decisive 30-minute delivery sprint.', subtasks: ['Define the smallest shippable result', 'Run a distraction-free sprint', 'Log the outcome'] },
      agility: { title: 'Context Switch Drill', description: 'Train adaptability with three short, intentional focus blocks.', subtasks: ['Pick three micro-tasks', 'Complete each in 10 minutes', 'Capture the next action'] },
      vitality: { title: 'Vitality Recharge', description: 'Restore your energy with movement, hydration, and deliberate recovery.', subtasks: ['Move for 15 minutes', 'Drink a full glass of water', 'Prepare your next healthy choice'] },
      discipline: { title: 'Deep Focus', description: `Level ${state.player.level} protocol: complete a 45-minute uninterrupted learning session.`, subtasks: ['Choose one learning target', 'Complete the full focus block', 'Summarize three takeaways'] },
    };
    const mission = missions[stat];
    addQuest({ id: `ai-${Date.now()}`, title: mission.title, description: mission.description, type: 'Challenge', focusStat: stat, reward: { xp: 40 + state.player.level * 2, credits: 20, statBoosts: { [stat]: 1 } }, completed: false, subtasks: mission.subtasks.map((title, index): Subtask => ({ id: `ai-${Date.now()}-${index}`, title, completed: false })) });
  };

  const createProfile = (username: string, avatar: string, title: string) => {
    const state = createDefaultState(username.trim(), avatar, title.trim() || 'Nexus Initiate');
    const profile = { id: `profile-${Date.now()}`, username: state.player.name, avatar: state.player.avatar, title: state.player.title, state };
    setProfiles((current) => [...current, profile]); setActiveId(profile.id);
  };
  const switchProfile = (profileId: string) => setActiveId(profileId);
  const resetProgress = () => updateActive(() => createDefaultState(state.player.name, state.player.avatar, state.player.title));
  const deleteProfile = () => {
    if (profiles.length <= 1) { resetProgress(); return; }
    const remaining = profiles.filter((profile) => profile.id !== activeId);
    setProfiles(remaining); setActiveId(remaining[0]?.id ?? 'profile-default');
  };

  return <GameStateContext.Provider value={{ state, profiles, activeProfile, addQuest, updateQuest, deleteQuest, toggleSubtask, completeQuest, generateAIQuest, setProfileGoals, grantReward, addAchievement, upgradeStat, buyReward, addCustomReward, completePomodoro, createProfile, switchProfile, resetProgress, deleteProfile }}>{children}</GameStateContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) throw new Error('useGameState must be used within GameStateProvider');
  return context;
};
