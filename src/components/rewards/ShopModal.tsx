import React, { useState } from 'react';
import { Coins, Gem, LockKeyhole, Pencil, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { ShopReward } from '../../types';
import { useGameState } from '../../context/GameStateContext';
import { useTranslation } from 'react-i18next';
import InfoButton from '../common/InfoButton';

const MIN_PERSONAL_REWARD_COST = 50;

export const ShopModal: React.FC = () => {
  const { t } = useTranslation();
  const { state, buyReward, addCustomReward, updateCustomReward, deleteCustomReward } = useGameState();
  const [showForm, setShowForm] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'cosmetic' | 'real'>('all');
  const [form, setForm] = useState({ title: '', description: '', cost: 100, icon: '✨' });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    const reward = { id: editingRewardId ?? `custom-reward-${Date.now()}`, title: form.title.trim(), description: form.description.trim() || t('shop.personalRewardDescription'), cost: Math.max(MIN_PERSONAL_REWARD_COST, form.cost), icon: form.icon || '✨', custom: true, category: 'real' as const };
    if (editingRewardId) updateCustomReward(reward);
    else addCustomReward(reward);
    setForm({ title: '', description: '', cost: 100, icon: '✨' });
    setEditingRewardId(null);
    setShowForm(false);
  };
  const visibleRewards = state.shopRewards.filter((reward) => reward.category !== 'equipment' && (filter === 'all' || (filter === 'cosmetic' ? !!reward.category && ['title', 'glow', 'theme'].includes(reward.category) : !reward.category || reward.category === 'real')));
  const gearRewards = state.shopRewards.filter((reward) => reward.category === 'equipment');
  return <section data-tour="rewards" className="space-y-6">
    <div className="flex justify-end"><InfoButton title="Rewards economy" description="Gold is earned from completed quests and focus sessions. Personal rewards are real-life breaks or cosmetics; equipment remains a separate locked system." /></div>
    <div className="section-heading"><div><p className="eyebrow">PERSONAL REWARDS</p><p className="page-subtitle">Spend Gold on cosmetics, perks, and real-life breaks.</p></div><div className="flex flex-wrap items-center justify-end gap-3"><div className="credit-pill"><Coins size={16} />{state.player.credits} {t('shop.gold')}</div><button className="button-primary" onClick={() => setShowForm(true)}><Plus size={17} /> {t('shop.customReward')}</button></div></div>
    <div className="flex flex-wrap gap-2">{(['all', 'cosmetic', 'real'] as const).map((item) => <button key={item} className={`filter-pill ${filter === item ? 'filter-active' : ''}`} onClick={() => setFilter(item)}>{t(`shop.filter.${item}`)}</button>)}</div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{visibleRewards.map((reward) => {
      const canBuy = state.player.credits >= reward.cost;
      const redeemed = state.redeemedRewardIds.includes(reward.id);
      const bonuses = Object.entries(reward.statBonuses ?? {});
      const removeCustomReward = () => { if (window.confirm(`Delete "${reward.title}"? This cannot be undone.`)) deleteCustomReward(reward.id); };
      const editCustomReward = () => { setEditingRewardId(reward.id); setForm({ title: reward.title, description: reward.description, cost: reward.cost, icon: reward.icon }); setShowForm(true); };
      return <article key={reward.id} className={`glass-card reward-card ${redeemed && reward.category !== 'real' ? 'border-cyan-300/30' : ''}`}><div className="reward-icon">{reward.icon}</div><div className="flex-1"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-white">{reward.title}</h3><div className="flex items-center gap-2">{reward.custom && <><span className="tag tag-purple">{t('shop.custom')}</span><button type="button" className="icon-button p-1.5 text-cyan-400/80 hover:text-cyan-300" onClick={editCustomReward} aria-label={`Edit ${reward.title}`} title="Edit custom reward"><Pencil size={14} /></button><button type="button" className="icon-button p-1.5 text-rose-400/80 hover:text-rose-300" onClick={removeCustomReward} aria-label={`Delete ${reward.title}`} title="Delete custom reward"><Trash2 size={14} /></button></>}</div></div>{reward.slot && <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-violet-300">{reward.slot}</p>}<p className="mt-2 text-sm text-slate-400">{reward.description}</p>{bonuses.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{bonuses.map(([stat, value]) => <span key={stat} className="badge-glow text-[10px]">+{value} {stat.slice(0, 3).toUpperCase()}</span>)}</div>}{redeemed && reward.category !== 'real' && <p className="mt-3 text-xs font-bold uppercase tracking-wider text-cyan-300">{t('shop.equipped')}</p>}</div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><span className="flex items-center gap-1.5 text-sm font-semibold text-amber-300"><Coins size={15} />{reward.cost}</span><button className="button-small" disabled={!canBuy || redeemed} onClick={() => buyReward(reward.id)}>{redeemed ? t('shop.equipped') : canBuy ? t('shop.purchase') : t('shop.locked')}</button></div></article>;
    })}</div>
    <section className="gear-shop-teaser glass-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="eyebrow text-violet-300">GEAR SHOP // FUTURE ARMORY</p><h2 className="mt-1 text-xl font-black text-white">Weapons, Armor & Accessories</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Equipment is separate from Gold rewards. Gear will use Nexus Shards and each item keeps its fixed system-defined price.</p></div>
        <div className="shop-coming-badge"><LockKeyhole size={14} /> COMING SOON</div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-violet-400/20 bg-violet-400/[.06] px-3 py-2 text-xs text-violet-200"><Gem size={14} /> SPECIAL CURRENCY: NEXUS SHARDS <span className="text-violet-400/60">·</span> GEAR PURCHASES ARE NOT AVAILABLE YET</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{gearRewards.map((reward) => <article className="gear-shop-item" key={reward.id}><span className="text-2xl">{reward.icon}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-white">{reward.title}</strong><span className="text-[10px] uppercase tracking-widest text-violet-300">{reward.slot ?? 'equipment'} · FIXED PRICE</span></div><span className="flex shrink-0 items-center gap-1 text-xs font-bold text-violet-200"><Gem size={12} />{reward.cost}</span></article>)}</div>
    </section>
    {showForm && <div className="modal-backdrop"><form onSubmit={submit} className="modal-panel max-w-lg"><div className="flex items-center justify-between"><div><p className="eyebrow">{t('shop.personalLoot')}</p><h2 className="text-2xl font-bold text-white">{editingRewardId ? 'Edit personal reward' : t('shop.addReward')}</h2><p className="mt-1 text-xs text-slate-500">Quest rewards and personal breaks only. Equipment is managed separately in your profile.</p></div><button type="button" className="icon-button" onClick={() => { setShowForm(false); setEditingRewardId(null); }} aria-label="Close"><X size={20} /></button></div><div className="mt-5 grid gap-4"><label className="field"><span>{t('shop.rewardTitle')}</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 1 Hour Gaming Session" /></label><label className="field"><span>{t('shop.description')}</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe your real-life break reward" /></label><div className="grid grid-cols-2 gap-4"><label className="field"><span>{t('shop.cost')} (minimum {MIN_PERSONAL_REWARD_COST} Gold)</span><input required type="number" min={MIN_PERSONAL_REWARD_COST} value={form.cost} onChange={(e) => setForm({ ...form, cost: Math.max(MIN_PERSONAL_REWARD_COST, Number(e.target.value) || MIN_PERSONAL_REWARD_COST) })} /></label><label className="field"><span>{t('shop.icon')}</span><input maxLength={3} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>{t('shop.cancel')}</button><button type="submit" className="button-primary"><ShoppingBag size={16} /> {t('shop.addToShop')}</button></div></form></div>}
  </section>;
};

export default ShopModal;
