import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityCategory, Achievement, GameState, Player, PlayerStats, Profile, Quest, QuestDifficulty, Reward, ShopReward, Rank, Subtask } from '../types';
import { generateQuestDrafts, toQuest } from '../services/aiQuestService';

const STORAGE_KEY = 'nexus_profiles_v1';
const LEGACY_KEY = 'nexus_game_state_v2';
const STAT_KEYS: Array<keyof PlayerStats> = ['strength', 'intelligence', 'agility', 'vitality', 'discipline'];
export const avatarOptions = ['🧙', '🧑‍💻', '🦾', '🥷', '🧠', '🚀', '🐉', '⚡'];

const defaultStats: PlayerStats = { strength: 5, intelligence: 5, agility: 5, vitality: 5, discipline: 5 };
const emptyStats: PlayerStats = { strength: 0, intelligence: 0, agility: 0, vitality: 0, discipline: 0 };
export const calculateBalancedRewards = (difficulty: QuestDifficulty = 'normal', focusDuration = 25) => {
  const safeDuration = Number.isFinite(focusDuration) ? Math.max(0, Math.min(120, focusDuration)) : 0;
  const bands: Record<QuestDifficulty, { xp: [number, number]; credits: [number, number] }> = {
    easy: { xp: [10, 30], credits: [5, 15] },
    normal: { xp: [40, 90], credits: [20, 45] },
    hard: { xp: [100, 200], credits: [50, 120] },
    legendary: { xp: [150, 250], credits: [75, 150] },
  };
  const band = bands[difficulty];
  const progress = safeDuration / 120;
  return {
    xp: Math.round(band.xp[0] + (band.xp[1] - band.xp[0]) * progress),
    credits: Math.round(band.credits[0] + (band.credits[1] - band.credits[0]) * progress),
  };
};
const defaultRewards: ShopReward[] = [
  { id: 'cosmetic-shadow-monarch', title: 'Shadow Monarch', description: 'Equip the legendary Shadow Monarch title.', cost: 500, icon: '👑', category: 'title', value: 'Shadow Monarch' },
  { id: 'cosmetic-supreme-hunter', title: 'Supreme Hunter', description: 'Equip the Supreme Hunter title.', cost: 750, icon: '🏹', category: 'title', value: 'Supreme Hunter' },
  { id: 'cosmetic-glow-purple', title: 'Monarch Aura', description: 'Unlock a purple profile glow.', cost: 350, icon: '💜', category: 'glow', value: 'purple' },
  { id: 'cosmetic-glow-crimson', title: 'Crimson Aura', description: 'Unlock a crimson profile glow.', cost: 350, icon: '❤️', category: 'glow', value: 'crimson' },
  { id: 'theme-cyan', title: 'Cyberpunk Cyan', description: 'Equip a cyan command-center accent theme.', cost: 250, icon: '🔷', category: 'theme', value: 'cyan' },
  { id: 'theme-purple', title: 'Monarch Purple', description: 'Equip a purple command-center accent theme.', cost: 400, icon: '🟣', category: 'theme', value: 'purple' },
  { id: 'theme-crimson', title: 'Crimson Red', description: 'Equip a crimson command-center accent theme.', cost: 400, icon: '🔻', category: 'theme', value: 'crimson' },
  { id: 'equipment-shadow-dagger', title: 'Shadow Dagger', description: 'A silent weapon for decisive action.', cost: 650, icon: '🗡️', category: 'equipment', slot: 'weapon', statBonuses: { agility: 4, strength: 6 } },
  { id: 'equipment-cyber-blade', title: 'Cyber Blade', description: 'A neon edge forged for high-level missions.', cost: 1100, icon: '⚔️', category: 'equipment', slot: 'weapon', statBonuses: { strength: 10, agility: 5 } },
  { id: 'equipment-monarch-cloak', title: 'Monarch Cloak', description: 'Command the room with a legendary mantle.', cost: 950, icon: '🧥', category: 'equipment', slot: 'armor', statBonuses: { vitality: 8, discipline: 5 } },
  { id: 'equipment-cyberpunk-suit', title: 'Cyberpunk Suit', description: 'A tactical outfit for relentless focus.', cost: 1250, icon: '🥋', category: 'equipment', slot: 'armor', statBonuses: { intelligence: 10, vitality: 6 } },
  { id: 'equipment-power-aura', title: 'Power Aura', description: 'A visible surge of combat-ready energy.', cost: 800, icon: '🔥', category: 'equipment', slot: 'accessory', statBonuses: { strength: 5, vitality: 10 } },
  { id: 'equipment-focus-ring', title: 'Focus Ring', description: 'Keep your mind locked on the next objective.', cost: 700, icon: '💍', category: 'equipment', slot: 'accessory', statBonuses: { intelligence: 8, discipline: 7 } },
  { id: 'reward-coffee', title: 'Coffee Break', description: 'Take a guilt-free 20 minute reset.', cost: 40, icon: '☕' },
  { id: 'reward-game', title: 'Gaming Session', description: 'Enjoy one focused hour of play.', cost: 120, icon: '🎮' },
  { id: 'reward-treat', title: 'Favorite Treat', description: 'Redeem your favorite snack or dessert.', cost: 80, icon: '🍰' },
  { id: 'reward-movie', title: 'Movie Night', description: 'A well-earned evening off.', cost: 180, icon: '🎬' },
];
const MIN_PERSONAL_REWARD_COST = 50;
const normalizeShopRewards = (savedRewards: ShopReward[] | undefined): ShopReward[] => {
  const saved = savedRewards ?? [];
  const catalog = defaultRewards.map((reward) => ({ ...reward }));
  const customRewards = saved
    .filter((reward) => !defaultRewards.some((item) => item.id === reward.id))
    .map((reward) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      cost: Math.max(MIN_PERSONAL_REWARD_COST, Number.isFinite(reward.cost) ? Math.round(reward.cost) : MIN_PERSONAL_REWARD_COST),
      icon: reward.icon || '✨',
      custom: true,
      category: 'real' as const,
    }));
  return [...catalog, ...customRewards];
};
const defaultQuests: Quest[] = [
  { id: 'q1', title: 'Hydration Protocol', description: 'Drink two full glasses of water before your next work block.', type: 'Daily', focusStat: 'vitality', reward: { xp: 10, credits: 5 }, completed: false, streak: 0, subtasks: [{ id: 'q1-a', title: 'Fill your bottle', completed: false }, { id: 'q1-b', title: 'Finish both glasses', completed: false }] },
  { id: 'q2', title: 'Journal Check-in', description: 'Reflect for 10 minutes and clear the mental cache.', type: 'Daily', focusStat: 'intelligence', reward: { xp: 15, credits: 8, statBoosts: { intelligence: 1 } }, completed: false, subtasks: [{ id: 'q2-a', title: 'Write three wins', completed: false }, { id: 'q2-b', title: 'Choose one priority', completed: false }] },
];

const createDefaultState = (username = 'Rookie', avatar = '🧑‍💻', title = 'Nexus Initiate'): GameState => ({
  player: { id: `player-${Date.now()}`, name: username, title, avatar, playerClass: 'Shadow Assassin', statPoints: 0, dailyReviewDate: new Date().toISOString().slice(0, 10), activeGoal: '', mainGoals: [], level: 1, xp: 0, credits: 0, stats: { ...defaultStats }, rank: 'F', achievements: [], activeDays: 1, currentStreak: 1, lastActiveDate: new Date().toISOString().slice(0, 10), equippedEquipment: [], equipmentBonuses: { ...emptyStats }, focusMinutesToday: 0, completedPomodoros: 0, focusStatsDate: new Date().toISOString().slice(0, 10) },
  quests: defaultQuests.map((quest) => ({ ...quest, subtasks: quest.subtasks?.map((subtask) => ({ ...subtask })) })),
  goals: [], missions: [], calendar: [], shopRewards: defaultRewards.map((reward) => ({ ...reward })), redeemedRewardIds: [],
});

export const requiredXP = (level: number) => Math.floor(100 * Math.pow(1.18, level - 1));
export const rankThresholds: Array<{ rank: Rank; minXP: number }> = [
  { rank: 'F', minXP: 0 }, { rank: 'E', minXP: 500 }, { rank: 'D', minXP: 1500 },
  { rank: 'C-', minXP: 3500 }, { rank: 'C', minXP: 5000 }, { rank: 'C+', minXP: 7000 },
  { rank: 'B-', minXP: 10000 }, { rank: 'B', minXP: 14000 }, { rank: 'B+', minXP: 19000 },
  { rank: 'A-', minXP: 25000 }, { rank: 'A', minXP: 33000 }, { rank: 'A+', minXP: 42000 },
  { rank: 'S', minXP: 55000 }, { rank: 'SS', minXP: 80000 },
];
export const totalXPForPlayer = (level: number, xp: number) => {
  let total = xp;
  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) total += requiredXP(currentLevel);
  return total;
};
export const calculateRank = (totalXP: number): Rank => {
  return [...rankThresholds].reverse().find((tier) => totalXP >= tier.minXP)?.rank ?? 'F';
};

const mergeState = (saved: Partial<GameState>, username?: string, avatar?: string, title?: string): GameState => {
  const fallback = createDefaultState(username, avatar, title);
  const today = new Date().toISOString().slice(0, 10);
  const savedFocusDate = saved.player?.focusStatsDate;
  const player = { ...fallback.player, ...saved.player, playerClass: saved.player?.playerClass ?? fallback.player.playerClass, statPoints: Math.max(0, saved.player?.statPoints ?? fallback.player.statPoints), dailyReviewDate: saved.player?.dailyReviewDate ?? today, stats: { ...defaultStats, ...saved.player?.stats }, avatar: saved.player?.avatar ?? avatar ?? fallback.player.avatar, title: saved.player?.title ?? title ?? fallback.player.title, activeGoal: saved.player?.activeGoal ?? fallback.player.activeGoal, mainGoals: saved.player?.mainGoals ?? fallback.player.mainGoals, equippedEquipment: saved.player?.equippedEquipment ?? [], equipmentBonuses: { ...emptyStats, ...saved.player?.equipmentBonuses }, focusMinutesToday: savedFocusDate === today ? saved.player?.focusMinutesToday ?? 0 : 0, completedPomodoros: savedFocusDate === today ? saved.player?.completedPomodoros ?? 0 : 0, focusStatsDate: today };
  return {
    ...fallback, ...saved,
    player: { ...player, rank: calculateRank(totalXPForPlayer(player.level, player.xp)) },
    quests: saved.quests?.length ? saved.quests : fallback.quests,
    shopRewards: normalizeShopRewards(saved.shopRewards),
    redeemedRewardIds: saved.redeemedRewardIds ?? [],
  };
};

interface GameStateContextValue {
  state: GameState;
  profiles: Profile[];
  activeProfile: Profile | null;
  scheduleQuest: (questId: string, dueDate: string) => void;
  addQuest: (quest: Quest) => void;
  updateQuest: (quest: Quest) => void;
  deleteQuest: (questId: string) => void;
  toggleSubtask: (questId: string, subtaskId: string) => void;
  completeQuest: (questId: string) => void;
  generateAIQuest: (goalOverride?: string) => void;
  generateAIQuests: (goal: string) => Promise<void>;
  generateQuestFromPrompt: (prompt: string, description?: string, existingQuest?: Quest) => Promise<void>;
  setProfileGoals: (activeGoal: string, mainGoals: string[]) => void;
  upgradeStat: (stat: keyof PlayerStats) => void;
  allocateStatPoint: (stat: keyof PlayerStats) => void;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  buyReward: (rewardId: string) => boolean;
  addCustomReward: (reward: ShopReward) => void;
  updateCustomReward: (reward: ShopReward) => void;
  deleteCustomReward: (rewardId: string) => void;
  completePomodoro: (category?: ActivityCategory) => void;
  createProfile: (username: string, avatar: string, title: string, playerClass?: Player['playerClass']) => void;
  updateProfile: (username: string, avatar: string, title: string) => void;
  importProfileData: (data: unknown) => boolean;
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
  const fallback = { profiles: [], activeId: '' };
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
  const activeProfile = profiles.find((profile) => profile.id === activeId) ?? null;
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
    const startingLevel = next.level;
    next.xp += reward.xp ?? 0; next.credits += reward.credits ?? 0;
    while (next.xp >= requiredXP(next.level)) { next.xp -= requiredXP(next.level); next.level += 1; }
    next.statPoints += next.level - startingLevel;
    next.rank = calculateRank(totalXPForPlayer(next.level, next.xp));
    STAT_KEYS.forEach((key) => { next.stats[key] += reward.statBoosts?.[key] ?? 0; });
    if (reward.achievementId && !next.achievements.some((item) => item.id === reward.achievementId)) next.achievements.push({ id: reward.achievementId, title: reward.achievementId, awardedAt: new Date().toISOString() });
    return next;
  };
  const calculateQuestReward = (quest: Quest): Reward => {
    if (!quest.difficulty && !quest.focusDuration) return quest.reward;
    return { ...quest.reward, ...calculateBalancedRewards(quest.difficulty ?? 'normal', quest.focusDuration ?? 25) };
  };
  const markActive = (player: GameState['player']) => {
    const today = new Date().toISOString().slice(0, 10);
    if (player.lastActiveDate === today) return player;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    return { ...player, activeDays: player.activeDays + 1, currentStreak: player.lastActiveDate === yesterday ? player.currentStreak + 1 : 1, lastActiveDate: today };
  };

  useEffect(() => {
    const checkOverdueQuests = () => updateActive((current) => {
      let changed = false;
      let penaltyId = current.player.activePenaltyQuestId;
      const today = new Date().toISOString().slice(0, 10);
      const dayChanged = current.player.dailyReviewDate !== today;
      const quests = current.quests.map((quest) => {
        if (!quest.completed && !quest.failed && ((quest.dueDate && new Date(quest.dueDate).getTime() <= Date.now()) || (dayChanged && quest.type === 'Daily' && !quest.isPenalty))) {
          changed = true;
          penaltyId = penaltyId ?? `penalty-${Date.now()}`;
          return { ...quest, failed: true, penaltyApplied: true };
        }
        return quest;
      });
      if (!changed && !dayChanged) return current;
      const player = changed ? { ...current.player, xp: Math.max(0, current.player.xp - 50), stats: { ...current.player.stats, discipline: Math.max(0, current.player.stats.discipline - 2) } } : current.player;
      player.rank = calculateRank(totalXPForPlayer(player.level, player.xp));
      if (penaltyId && !current.quests.some((quest) => quest.id === penaltyId)) {
        quests.push({ id: penaltyId, title: 'Emergency Recovery Protocol', description: 'Complete a corrective action to restore access to normal missions.', type: 'Challenge', isPenalty: true, difficulty: 'easy', focusDuration: 15, focusStat: 'discipline', reward: { xp: 10, credits: 5, statBoosts: { discipline: 1 } }, completed: false, subtasks: [{ id: `${penaltyId}-a`, title: 'Complete 15 minutes of cleaning, stretching, or pushups', completed: false }, { id: `${penaltyId}-b`, title: 'Write one prevention step', completed: false }, { id: `${penaltyId}-c`, title: 'Return to the Command Center', completed: false }] });
      }
      return { ...current, quests, player: { ...player, activePenaltyQuestId: penaltyId, dailyReviewDate: today } };
    });
    checkOverdueQuests();
    const interval = window.setInterval(checkOverdueQuests, 60000);
    return () => window.clearInterval(interval);
  }, [activeId]);

  const addQuest = (quest: Quest) => updateActive((current) => ({ ...current, quests: [...current.quests, { ...quest, reward: calculateQuestReward(quest) }] }));
  const updateQuest = (quest: Quest) => updateActive((current) => ({ ...current, quests: current.quests.map((item) => item.id === quest.id ? { ...quest, reward: calculateQuestReward(quest) } : item) }));
  const scheduleQuest = (questId: string, dueDate: string) => updateActive((current) => ({ ...current, quests: current.quests.map((item) => item.id === questId ? { ...item, dueDate } : item) }));
  const deleteQuest = (questId: string) => updateActive((current) => ({ ...current, quests: current.quests.filter((quest) => quest.id !== questId) }));
  const toggleSubtask = (questId: string, subtaskId: string) => updateActive((current) => ({ ...current, quests: current.quests.map((quest) => quest.id !== questId ? quest : { ...quest, subtasks: quest.subtasks?.map((task) => task.id === subtaskId ? { ...task, completed: !task.completed } : task) }) }));
  const activityStatBoosts = (quest: Quest): Partial<PlayerStats> => {
    const activity = `${quest.title} ${quest.description ?? ''} ${quest.focusStat ?? ''}`.toLowerCase();
    if (/study|learn|course|read|math|code|program|exam|intelligence/.test(activity)) return { intelligence: 1 };
    if (/workout|fitness|run|gym|strength|vitality|health/.test(activity)) return { strength: 1, vitality: 1 };
    if (/plan|productivity|routine|organize|discipline|focus/.test(activity)) return { discipline: 1 };
    if (quest.focusStat) return { [quest.focusStat]: 1 };
    return {};
  };
  const completeQuest = (questId: string) => updateActive((current) => {
    const quest = current.quests.find((item) => item.id === questId);
    if (!quest || quest.failed || (current.player.activePenaltyQuestId && !quest.isPenalty) || (quest.completed && quest.type !== 'Daily')) return current;
    const today = new Date().toISOString().slice(0, 10);
    const completionsToday = quest.lastCompletionDate === today ? quest.dailyCompletions ?? 0 : 0;
    const multiplier = completionsToday === 0 ? 1 : completionsToday === 1 ? 0.5 : 0.2;
    const baseReward = calculateQuestReward(quest);
    const reward = {
      ...baseReward,
      xp: Math.max(1, Math.round((baseReward.xp ?? 0) * multiplier)),
      credits: Math.max(1, Math.round((baseReward.credits ?? 0) * multiplier)),
      statBoosts: { ...activityStatBoosts(quest), ...quest.reward.statBoosts },
    };
    const nextPlayer = applyReward(markActive(current.player), reward);
    if (quest.isPenalty) nextPlayer.activePenaltyQuestId = undefined;
    return { ...current, quests: current.quests.map((item) => item.id === questId ? { ...item, completed: true, dailyCompletions: completionsToday + 1, lastCompletionDate: today, subtasks: item.subtasks?.map((task) => ({ ...task, completed: true })) } : item), player: nextPlayer };
  });
  const grantReward = (reward: Reward) => updateActive((current) => ({ ...current, player: applyReward(markActive(current.player), reward) }));
  const addAchievement = (achievement: Achievement) => updateActive((current) => ({ ...current, player: { ...current.player, achievements: current.player.achievements.some((item) => item.id === achievement.id) ? current.player.achievements : [...current.player.achievements, achievement] } }));
  const upgradeStat = (stat: keyof PlayerStats) => updateActive((current) => {
    const cost = Math.max(25, current.player.stats[stat] * 10);
    return current.player.credits < cost ? current : { ...current, player: { ...current.player, credits: current.player.credits - cost, stats: { ...current.player.stats, [stat]: current.player.stats[stat] + 1 } } };
  });
  const allocateStatPoint = (stat: keyof PlayerStats) => updateActive((current) => current.player.statPoints <= 0 ? current : { ...current, player: { ...current.player, statPoints: current.player.statPoints - 1, stats: { ...current.player.stats, [stat]: current.player.stats[stat] + 1 } } });
  const recalculateEquipment = (current: GameState, equippedEquipment: string[]) => {
    const bonuses = { ...emptyStats };
    current.shopRewards.filter((item) => equippedEquipment.includes(item.id)).forEach((item) => Object.entries(item.statBonuses ?? {}).forEach(([key, value]) => { bonuses[key as keyof PlayerStats] += value ?? 0; }));
    return bonuses;
  };
  const equipItem = (itemId: string) => updateActive((current) => {
    const item = current.shopRewards.find((reward) => reward.id === itemId && reward.category === 'equipment');
    if (!item || !current.redeemedRewardIds.includes(itemId)) return current;
    const withoutSlot = current.player.equippedEquipment.filter((id) => current.shopRewards.find((reward) => reward.id === id)?.slot !== item.slot);
    const equippedEquipment = [...withoutSlot, itemId];
    return { ...current, player: { ...current.player, equippedEquipment, equipmentBonuses: recalculateEquipment(current, equippedEquipment) } };
  });
  const unequipItem = (itemId: string) => updateActive((current) => {
    const equippedEquipment = current.player.equippedEquipment.filter((id) => id !== itemId);
    return { ...current, player: { ...current.player, equippedEquipment, equipmentBonuses: recalculateEquipment(current, equippedEquipment) } };
  });
  const buyReward = (rewardId: string) => {
    const reward = state.shopRewards.find((item) => item.id === rewardId);
    if (!reward || state.redeemedRewardIds.includes(rewardId) || state.player.credits < reward.cost) return false;
    updateActive((current) => {
      const player = { ...current.player, credits: current.player.credits - reward.cost };
      if (reward.category === 'title' && reward.value) player.equippedTitle = reward.value;
      if (reward.category === 'theme' && (reward.value === 'cyan' || reward.value === 'purple' || reward.value === 'crimson')) player.activeTheme = reward.value;
      if (reward.category === 'glow' && (reward.value === 'cyan' || reward.value === 'purple' || reward.value === 'crimson')) player.activeGlow = reward.value;
      return { ...current, player, redeemedRewardIds: [...current.redeemedRewardIds, rewardId] };
    });
    return true;
  };
  const addCustomReward = (reward: ShopReward) => updateActive((current) => ({
    ...current,
    shopRewards: [...current.shopRewards, {
      id: reward.id,
      title: reward.title.trim(),
      description: reward.description.trim(),
      cost: Math.max(MIN_PERSONAL_REWARD_COST, Number.isFinite(reward.cost) ? Math.round(reward.cost) : MIN_PERSONAL_REWARD_COST),
      icon: reward.icon || '✨',
      custom: true,
      category: 'real',
    }],
  }));
  const deleteCustomReward = (rewardId: string) => updateActive((current) => {
    const reward = current.shopRewards.find((item) => item.id === rewardId);
    if (!reward?.custom) return current;
    return {
      ...current,
      shopRewards: current.shopRewards.filter((item) => item.id !== rewardId),
      redeemedRewardIds: current.redeemedRewardIds.filter((id) => id !== rewardId),
    };
  });
  const updateCustomReward = (reward: ShopReward) => updateActive((current) => {
    const existing = current.shopRewards.find((item) => item.id === reward.id);
    if (!existing?.custom) return current;
    return {
      ...current,
      shopRewards: current.shopRewards.map((item) => item.id === reward.id ? {
        id: item.id,
        title: reward.title.trim(),
        description: reward.description.trim(),
        cost: Math.max(MIN_PERSONAL_REWARD_COST, Number.isFinite(reward.cost) ? Math.round(reward.cost) : MIN_PERSONAL_REWARD_COST),
        icon: reward.icon || '✨',
        custom: true,
        category: 'real' as const,
      } : item),
    };
  });
  const completePomodoro = (category: ActivityCategory = 'planning') => {
    const statBoosts: Partial<PlayerStats> = category === 'study' ? { intelligence: 1 } : category === 'fitness' ? { strength: 1, vitality: 1 } : category === 'rest' ? {} : { discipline: 1 };
    const sessionReward = category === 'rest' ? { xp: 10, credits: 0, statBoosts } : { xp: 35, credits: 20, statBoosts };
    updateActive((current) => {
      const today = new Date().toISOString().slice(0, 10);
      const player = current.player.focusStatsDate === today
        ? { ...current.player, focusMinutesToday: current.player.focusMinutesToday + 25, completedPomodoros: current.player.completedPomodoros + 1, focusStatsDate: today }
        : { ...current.player, focusMinutesToday: 25, completedPomodoros: 1, focusStatsDate: today };
      return { ...current, player: applyReward(markActive(player), sessionReward) };
    });
  };

  const setProfileGoals = (activeGoal: string, mainGoals: string[]) => updateActive((current) => ({ ...current, player: { ...current.player, activeGoal: activeGoal.trim(), mainGoals: mainGoals.map((goal) => goal.trim()).filter(Boolean) } }));

  const generateAIQuests = async (goal: string) => {
    const drafts = await generateQuestDrafts({ goal, level: state.player.level, rank: state.player.rank });
    updateActive((current) => ({
      ...current,
      player: { ...current.player, activeGoal: goal.trim() },
      quests: [...current.quests, ...drafts.map((draft, index) => toQuest(draft, `ai-onboarding-${Date.now()}-${index}`))],
    }));
  };

  const generateQuestFromPrompt = async (prompt: string, description = '', existingQuest?: Quest) => {
    const drafts = await generateQuestDrafts({
      goal: `${prompt.trim()}${description.trim() ? `: ${description.trim()}` : ''}`,
      level: state.player.level,
      rank: state.player.rank,
    });
    const generated = toQuest(drafts[0], existingQuest?.id ?? `ai-prompt-${Date.now()}`);
    if (existingQuest) {
      updateActive((current) => ({ ...current, quests: current.quests.map((quest) => quest.id === existingQuest.id ? { ...generated, completed: existingQuest.completed, dueDate: existingQuest.dueDate, subtasks: (generated.subtasks ?? []).map((task, index) => ({ ...task, completed: existingQuest.subtasks?.[index]?.completed ?? false })) } : quest) }));
    } else {
      updateActive((current) => ({ ...current, quests: [...current.quests, generated] }));
    }
  };

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

  const createProfile = (username: string, avatar: string, title: string, playerClass: Player['playerClass'] = 'Shadow Assassin') => {
    const state = createDefaultState(username.trim(), avatar, title.trim() || 'Nexus Initiate');
    state.player.playerClass = playerClass;
    const profile = { id: `profile-${Date.now()}`, username: state.player.name, avatar: state.player.avatar, title: state.player.title, state };
    setProfiles((current) => [...current, profile]); setActiveId(profile.id);
  };
  const updateProfile = (username: string, avatar: string, title: string) => updateActive((current) => ({ ...current, player: { ...current.player, name: username.trim() || current.player.name, avatar, title: title.trim() || current.player.title } }));
  const importProfileData = (data: unknown) => {
    if (!data || typeof data !== 'object') return false;
    const candidate = data as { state?: unknown };
    if (!candidate.state || typeof candidate.state !== 'object') return false;
    const imported = mergeState(candidate.state as Partial<GameState>);
    if (!imported.player?.name || !Array.isArray(imported.quests) || !Array.isArray(imported.shopRewards)) return false;
    updateActive((current) => ({
      ...imported,
      player: {
        ...imported.player,
        level: current.player.level,
        xp: current.player.xp,
        credits: current.player.credits,
        stats: current.player.stats,
        rank: current.player.rank,
        achievements: current.player.achievements,
        equippedEquipment: current.player.equippedEquipment,
        equipmentBonuses: current.player.equipmentBonuses,
      },
      quests: imported.quests.map((quest) => ({ ...quest, reward: calculateQuestReward(quest) })),
    }));
    return true;
  };
  const switchProfile = (profileId: string) => setActiveId(profileId);
  const resetProgress = () => updateActive(() => createDefaultState(state.player.name, state.player.avatar, state.player.title));
  const deleteProfile = () => {
    if (profiles.length <= 1) { resetProgress(); return; }
    const remaining = profiles.filter((profile) => profile.id !== activeId);
    setProfiles(remaining); setActiveId(remaining[0]?.id ?? 'profile-default');
  };

  return <GameStateContext.Provider value={{ state, profiles, activeProfile, scheduleQuest, addQuest, updateQuest, deleteQuest, toggleSubtask, completeQuest, generateAIQuest, generateAIQuests, generateQuestFromPrompt, setProfileGoals, upgradeStat, allocateStatPoint, equipItem, unequipItem, buyReward, addCustomReward, updateCustomReward, deleteCustomReward, completePomodoro, createProfile, updateProfile, importProfileData, switchProfile, resetProgress, deleteProfile }}>{children}</GameStateContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) throw new Error('useGameState must be used within GameStateProvider');
  return context;
};
