import React from 'react';
import { Quest } from '../../types';
import CustomActionButton from '../common/CustomActionButton';

export const NextQuestCard: React.FC<{ quest?: Quest; onOpen?: () => void }> = ({ quest, onOpen }) => {
  if (!quest) return <div className="p-4 bg-white/3 rounded-lg">No upcoming quests</div>;
  return (
    <div className="p-4 bg-gradient-to-r from-black/50 to-black/30 rounded-lg border border-white/5">
      <div className="text-sm text-gray-300">Next Quest</div>
      <div className="mt-2 text-lg font-bold text-cyan-300">{quest.title}</div>
      <div className="text-xs text-gray-400">{quest.description}</div>
      <div className="mt-3 text-xs text-gray-400">Type: {quest.type} • Reward: {quest.reward.xp || 0} XP</div>
      <CustomActionButton className="mt-4" variant="purple" onClick={onOpen}>View mission</CustomActionButton>
    </div>
  );
};

export default NextQuestCard;