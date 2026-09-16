export type Rank = 'F' | 'E' | 'D' | 'C-' | 'C' | 'C+' | 'B-' | 'B' | 'B+' | 'A-' | 'A' | 'A+' | 'S' | 'SS';

export interface PlayerStats {
  strength: number;
  intelligence: number;
  agility: number;
  vitality: number;
  discipline: number;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  xp: number;
  credits: number;
  stats: PlayerStats;
  rank: Rank;
  achievements: Achievement[];
  activeDays: number;
  currentStreak: number;
  lastActiveDate?: string;
  avatar: string;
  title: string;
  playerClass: 'Mage' | 'Shadow Assassin' | 'Tank' | 'Paladin' | 'Necromancer' | 'Striker';
  statPoints: number;
  activeGoal: string;
  mainGoals: string[];
  equippedTitle?: string;
  activeTheme?: 'cyan' | 'purple' | 'crimson';
  activeGlow?: 'cyan' | 'purple' | 'crimson';
  equippedEquipment: string[];
  equipmentBonuses: PlayerStats;
  focusMinutesToday: number;
  completedPomodoros: number;
  focusStatsDate: string;
  activePenaltyQuestId?: string;
  dailyReviewDate: string;
}

export type QuestType = 'Daily' | 'Weekly' | 'Main' | 'Epic' | 'Side' | 'Challenge';
export type ActivityCategory = 'study' | 'fitness' | 'planning' | 'rest';

export interface Reward {
  xp?: number;
  credits?: number;
  statBoosts?: Partial<PlayerStats>;
  achievementId?: string;
}

export interface ShopReward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
  custom?: boolean;
  category?: 'real' | 'title' | 'glow' | 'theme' | 'equipment';
  value?: string;
  slot?: 'weapon' | 'armor' | 'accessory';
  statBonuses?: Partial<PlayerStats>;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'legendary';
export interface Quest {
  id: string;
  title: string;
  description?: string;
  type: QuestType;
  reward: Reward;
  completed: boolean;
  failed?: boolean;
  penaltyApplied?: boolean;
  dueDate?: string; // ISO date
  streak?: number; // for dailies
  focusStat?: keyof PlayerStats;
  difficulty?: QuestDifficulty;
  focusDuration?: number;
  dailyCompletions?: number;
  lastCompletionDate?: string;
  subtasks?: Subtask[];
  isPenalty?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Profile {
  id: string;
  username: string;
  avatar: string;
  title: string;
  state: GameState;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number; // 0-100
  relatedQuestIds?: string[];
}

export interface Mission {
  id: string;
  title: string;
  quests: string[]; // quest ids
  reward?: Reward;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO
  end?: string; // ISO
  description?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  awardedAt: string; // ISO
}

export interface GameState {
  player: Player;
  quests: Quest[];
  goals: Goal[];
  missions: Mission[];
  calendar: CalendarEvent[];
  shopRewards: ShopReward[];
  redeemedRewardIds: string[];
}
