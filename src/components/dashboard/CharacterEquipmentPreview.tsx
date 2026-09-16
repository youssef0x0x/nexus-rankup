import React from 'react';
import { Backpack, CircleDot, Heart, Shield, Sparkles, Sword } from 'lucide-react';
import { useGameState } from '../../context/GameStateContext';
import InfoButton from '../common/InfoButton';

const CharacterEquipmentPreview: React.FC = () => {
  const { state, equipItem, unequipItem } = useGameState();
  const { player } = state;
  const ownedEquipment = state.shopRewards.filter((reward) => reward.category === 'equipment' && state.redeemedRewardIds.includes(reward.id));
  const equipment = ownedEquipment.filter((reward) => player.equippedEquipment.includes(reward.id));
  const equippedFor = (slot: 'weapon' | 'armor' | 'accessory') => equipment.find((item) => item.slot === slot);
  const equipmentBonuses = player.equipmentBonuses ?? { strength: 0, intelligence: 0, agility: 0, vitality: 0, discipline: 0 };
  const battlePower = Object.values(player.stats).reduce((total, value) => total + value, 0) + Object.values(equipmentBonuses).reduce((total, value) => total + value, 0);
  const inventory = ownedEquipment.filter((item) => !player.equippedEquipment.includes(item.id));
  const slots = [
    { label: 'Helmet', slot: 'armor' as const, icon: Shield },
    { label: 'Weapon', slot: 'weapon' as const, icon: Sword },
    { label: 'Ring I', slot: 'accessory' as const, icon: Sparkles },
    { label: 'Armor', slot: 'armor' as const, icon: Shield },
    { label: 'Shield', slot: 'weapon' as const, icon: Shield },
    { label: 'Ring II', slot: 'accessory' as const, icon: Sparkles },
  ];
  return <section className="rpg-character glass-card"><div className="flex justify-end"><InfoButton title="Inventory and equipment" description="Owned gear appears in the backpack. Click an item to equip it; click an equipped slot to unequip it. Equipment bonuses are recalculated immediately." /></div>
    <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">CHARACTER / INVENTORY</p><h2 className="mt-1 text-lg font-black text-white">Classic Loadout</h2></div><span className="gear-preview__coming">SYSTEM LOCKED</span></div>
    <div className="mb-3 text-xs uppercase tracking-widest text-slate-500">Class: <span className="text-cyan-300">{player.playerClass}</span> · Stat points: <span className="text-amber-300">{player.statPoints}</span></div>
    <div className="rpg-character__layout">
      <div className="rpg-character__slots">{slots.slice(0, 3).map(({ label, slot, icon: Icon }) => { const item = equippedFor(slot); return <button type="button" className={`rpg-slot text-left ${item ? 'rpg-slot--owned' : ''}`} key={label} onClick={() => item ? unequipItem(item.id) : undefined} title={item ? 'Click to unequip' : 'Empty slot'}><Icon size={16} /><span>{label}</span><strong>{item?.title ?? 'EMPTY'}</strong></button>; })}</div>
      <div className="rpg-character__avatar"><CircleDot size={18} /><span>{player.avatar}</span><small>{player.title}</small></div>
      <div className="rpg-character__slots">{slots.slice(3).map(({ label, slot, icon: Icon }) => { const item = equippedFor(slot); return <button type="button" className={`rpg-slot text-left ${item ? 'rpg-slot--owned' : ''}`} key={label} onClick={() => item ? unequipItem(item.id) : undefined} title={item ? 'Click to unequip' : 'Empty slot'}><Icon size={16} /><span>{label}</span><strong>{item?.title ?? 'EMPTY'}</strong></button>; })}</div>
    </div>
    <div className="rpg-stats-panel"><div><Heart size={14} /><span>HP</span><strong>{100 + player.stats.vitality * 10}</strong></div><div><Sword size={14} /><span>ATK</span><strong>{player.stats.strength * 2 + equipmentBonuses.strength}</strong></div><div><Sparkles size={14} /><span>CRYSTALS</span><strong>{player.credits}</strong></div><div><Shield size={14} /><span>BATTLE POWER</span><strong>{battlePower}</strong></div></div>
    <div className="rpg-inventory"><div className="flex items-center gap-2"><Backpack size={15} className="text-cyan-300" /><p className="eyebrow">BACKPACK / UNEQUIPPED ITEMS</p></div><div className="rpg-inventory__grid">{Array.from({ length: 8 }, (_, index) => { const item = inventory[index]; return <button type="button" className={`rpg-bag-slot ${item ? 'rpg-bag-slot--owned' : ''}`} key={item?.id ?? `empty-${index}`} title={item?.title ?? 'Empty inventory slot'} onClick={() => item && equipItem(item.id)}>{item ? item.icon : '·'}</button>; })}</div></div>
  </section>;
};

export default CharacterEquipmentPreview;
