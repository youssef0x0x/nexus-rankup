import { PlayerStats, Quest, QuestDifficulty, QuestType, Rank } from '../types';

export interface QuestGenerationContext {
  goal: string;
  level: number;
  rank: Rank;
}

interface GeneratedQuest {
  title: string;
  description: string;
  type: QuestType;
  difficulty: QuestDifficulty;
  focusDuration: number;
  focusStat: keyof PlayerStats;
  subtasks: string[];
  xpReward: number;
  creditReward: number;
}

interface AIQuestResponse {
  title: string;
  description: string;
  checklist: string[];
  xp_reward: number;
  credit_reward: number;
  stat_boost: string;
}

const endpoint = import.meta.env.VITE_AI_QUEST_ENDPOINT || '/api/quests/generate';
export const AI_GAME_MASTER_PROMPT = `
You are the AI Game Master for NEXUS RANKUP. Analyze the player's goal and create a fair productivity quest.
Return ONLY a JSON object with exactly these keys:
{
  "title": "string",
  "description": "string",
  "checklist": ["string", "string", "string"],
  "xp_reward": 0,
  "credit_reward": 0,
  "stat_boost": "STR|INT|AGI|VIT|DISC"
}
Use these economy bands, based on the actual difficulty of the goal:
- Low: XP 10-30 and Credits 5-15.
- Medium: XP 40-90 and Credits 20-45.
- High: XP 100-250 and Credits 50-150.
Use INT for learning, coding, studying, reading, and analytical tasks.
Use STR or VIT for physical workouts, exercise, diet, and stamina.
Use DISC for habits, routines, waking early, and consistency.
Use AGI for time management, speed, and quick organization.
xp_reward and credit_reward must be positive integers. checklist must contain exactly three small actionable tasks.
`;

const inferStat = (text: string): keyof PlayerStats => {
  if (/fit|fitness|health|run|gym|workout|strength|body/i.test(text)) return 'vitality';
  if (/routine|habit|discipline|focus|organize/i.test(text)) return 'discipline';
  if (/build|code|program|study|learn|exam|math|read/i.test(text)) return 'intelligence';
  return 'discipline';
};

const inferDifficulty = (text: string): QuestDifficulty => {
  if (/2 hour|two hour|large|master|launch|finish|deep dive/i.test(text)) return 'hard';
  if (/quick|5 minute|small|simple|drink water/i.test(text)) return 'easy';
  return 'normal';
};

const rewardBands: Record<QuestDifficulty, { xp: [number, number]; credits: [number, number] }> = {
  easy: { xp: [10, 30], credits: [5, 15] },
  normal: { xp: [40, 90], credits: [20, 45] },
  hard: { xp: [100, 200], credits: [50, 120] },
  legendary: { xp: [150, 250], credits: [75, 150] },
};

const clamp = (value: number, [min, max]: [number, number]) => Math.max(min, Math.min(max, Math.round(value)));

const rewardFor = (difficulty: QuestDifficulty, duration: number) => {
  const band = rewardBands[difficulty];
  const progress = Math.max(0, Math.min(1, duration / 120));
  return {
    xp: clamp(band.xp[0] + (band.xp[1] - band.xp[0]) * progress, band.xp),
    credits: clamp(band.credits[0] + (band.credits[1] - band.credits[0]) * progress, band.credits),
  };
};

const fallback = ({ goal, level, rank }: QuestGenerationContext): GeneratedQuest[] => {
  const focusStat = inferStat(goal);
  const difficulty = inferDifficulty(goal);
  return [
    {
      title: `Daily Protocol: ${goal.trim()}`,
      description: `Make measurable progress toward ${goal.trim()} with one focused execution block.`,
      type: 'Daily',
      difficulty,
      focusDuration: difficulty === 'easy' ? 15 : 25,
      focusStat,
      subtasks: ['Define the smallest useful outcome', 'Complete one focused work block', 'Record what changed'],
      xpReward: rewardFor(difficulty, difficulty === 'easy' ? 15 : 25).xp,
      creditReward: rewardFor(difficulty, difficulty === 'easy' ? 15 : 25).credits,
    },
    {
      title: `Epic Mission: ${goal.trim()}`,
      description: `Rank ${rank}, Level ${level} roadmap mission. Turn your goal into a meaningful milestone and create evidence of progress.`,
      type: 'Epic',
      difficulty: 'hard',
      focusDuration: 60,
      focusStat,
      subtasks: ['Choose a measurable milestone', 'Complete the hardest action', 'Review the result and plan the next step'],
      xpReward: rewardFor('hard', 60).xp,
      creditReward: rewardFor('hard', 60).credits,
    },
  ];
};

const isGeneratedQuest = (value: unknown): value is AIQuestResponse => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AIQuestResponse>;
  const expectedKeys = ['title', 'description', 'checklist', 'xp_reward', 'credit_reward', 'stat_boost'];
  const keys = Object.keys(item);
  return keys.length === expectedKeys.length
    && expectedKeys.every((key) => keys.includes(key))
    && typeof item.title === 'string'
    && typeof item.description === 'string'
    && Array.isArray(item.checklist)
    && item.checklist.length === 3
    && item.checklist.every((task) => typeof task === 'string' && task.trim().length > 0)
    && Number.isInteger(item.xp_reward)
    && Number.isInteger(item.credit_reward)
    && typeof item.stat_boost === 'string';
};

export const generateQuestDrafts = async (context: QuestGenerationContext): Promise<GeneratedQuest[]> => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: AI_GAME_MASTER_PROMPT,
        goal: context.goal,
        player: { level: context.level, rank: context.rank },
      }),
    });
    if (!response.ok) throw new Error(`Quest endpoint returned ${response.status}`);
    const payload: unknown = await response.json();
    const quests = Array.isArray(payload) ? payload : (payload as { quests?: unknown })?.quests;
    if (!Array.isArray(quests) || !quests.every(isGeneratedQuest)) throw new Error('Quest endpoint returned an invalid payload');
    return quests.slice(0, 5).map((quest, index) => {
      const item = quest;
      const goalText = `${item.title} ${item.description} ${context.goal}`;
      const difficulty = inferDifficulty(goalText);
      const focusDuration = difficulty === 'easy' ? 15 : difficulty === 'hard' ? 60 : 30;
      const band = rewardBands[difficulty];
      return {
        title: item.title.trim(),
        description: item.description.trim(),
        type: index === 1 ? 'Epic' : 'Daily',
        difficulty,
        focusDuration,
        focusStat: inferStat(`${item.stat_boost} ${goalText}`),
        subtasks: item.checklist.map((task) => task.trim()),
        xpReward: clamp(item.xp_reward, band.xp),
        creditReward: clamp(item.credit_reward, band.credits),
      };
    });
  } catch {
    return fallback(context);
  }
};

export const toQuest = (draft: GeneratedQuest, id: string): Quest => {
  const balancedReward = rewardFor(draft.difficulty, draft.focusDuration);
  const reward = {
    xp: clamp(draft.xpReward, rewardBands[draft.difficulty].xp) || balancedReward.xp,
    credits: clamp(draft.creditReward, rewardBands[draft.difficulty].credits) || balancedReward.credits,
  };
  return {
    id,
    title: draft.title.trim(),
    description: draft.description.trim(),
    type: draft.type,
    difficulty: draft.difficulty,
    focusDuration: draft.focusDuration,
    focusStat: draft.focusStat,
    reward: { ...reward, statBoosts: { [draft.focusStat]: 1 } },
    completed: false,
    subtasks: draft.subtasks.map((title, index) => ({ id: `${id}-task-${index}`, title, completed: false })),
  };
};
