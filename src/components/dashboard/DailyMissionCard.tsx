import React from 'react';
import { Quest } from '../../types';
import { useGameState } from '../../context/GameStateContext';

export const DailyMissionCard: React.FC<{ quest: Quest }> = ({ quest }) => {
  const { completeQuest } = useGameState();
  return (
    <div className="p-4 bg-white/3 rounded-lg border border-white/5">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-cyan-300">{quest.title}</div>
          <div className="text-xs text-gray-300">{quest.description}</div>
        </div>
        <div>
          <button
            onClick={() => completeQuest(quest.id)}
            disabled={quest.completed}
            className="px-3 py-1 bg-cyan-500 text-black rounded-md font-semibold hover:scale-105 transition-transform disabled:opacity-50"
          >
            {quest.completed ? 'Done' : 'Complete'}
          </button>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-400">Reward: {quest.reward.xp || 0} XP • {quest.reward.credits || 0} credits</div>
    </div>
  );
};

export default DailyMissionCard;