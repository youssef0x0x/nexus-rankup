export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

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
  activeGoal: string;
  mainGoals: string[];
}

export type QuestType = 'Daily' | 'Weekly' | 'Main' | 'Side' | 'Challenge';

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
}

export interface Quest {
  id: string;
  title: string;
  description?: string;
  type: QuestType;
  reward: Reward;
  completed: boolean;
  dueDate?: string; // ISO date
  streak?: number; // for dailies
  focusStat?: keyof PlayerStats;
  subtasks?: Subtask[];
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
