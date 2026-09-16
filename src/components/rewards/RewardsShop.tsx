import React, { useState } from 'react';
import { Coins, Plus, ShoppingBag, X } from 'lucide-react';
import { ShopReward } from '../../types';
import { useGameState } from '../../context/GameStateContext';

export const RewardsShop: React.FC = () => {
  const { state, buyReward, addCustomReward } = useGameState();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', cost: 50, icon: '✨' });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || form.cost < 1) return;
    const reward: ShopReward = { id: `custom-reward-${Date.now()}`, title: form.title.trim(), description: form.description.trim() || 'A personal reward worth working toward.', cost: form.cost, icon: form.icon || '✨', custom: true };
    addCustomReward(reward);
    setForm({ title: '', description: '', cost: 50, icon: '✨' });
    setShowForm(false);
  };
  return (
    <section className="space-y-6">
      <div className="section-heading"><div><p className="eyebrow">CREDIT EXCHANGE</p><h2 className="page-title">Rewards shop</h2><p className="page-subtitle">Turn momentum into meaningful breaks.</p></div><div className="flex items-center gap-3"><div className="credit-pill"><Coins size={16} />{state.player.credits}</div><button className="button-primary" onClick={() => setShowForm(true)}><Plus size={17} /> Custom reward</button></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {state.shopRewards.map((reward) => {
          const canBuy = state.player.credits >= reward.cost;
          const redeemed = state.redeemedRewardIds.includes(reward.id);
          return <article key={reward.id} className="glass-card reward-card"><div className="reward-icon">{reward.icon}</div><div className="flex-1"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-white">{reward.title}</h3>{reward.custom && <span className="tag tag-purple">CUSTOM</span>}</div><p className="mt-2 text-sm text-slate-400">{reward.description}</p></div><div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4"><span className="flex items-center gap-1.5 text-sm font-semibold text-amber-300"><Coins size={15} />{reward.cost}</span><button className="button-small" disabled={!canBuy || redeemed} onClick={() => buyReward(reward.id)}>{redeemed ? 'Redeemed' : canBuy ? 'Redeem' : 'Locked'}</button></div></article>;
        })}
      </div>
      {showForm && <div className="modal-backdrop"><form onSubmit={submit} className="modal-panel max-w-lg"><div className="flex items-center justify-between"><div><p className="eyebrow">PERSONAL LOOT</p><h2 className="text-2xl font-bold">Add a reward</h2></div><button type="button" className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={20} /></button></div><div className="mt-5 grid gap-4"><label className="field"><span>Title</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="New book, spa day..." /></label><label className="field"><span>Description</span><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label><div className="grid grid-cols-2 gap-4"><label className="field"><span>Credit cost</span><input required type="number" min="1" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} /></label><label className="field"><span>Icon / emoji</span><input maxLength={3} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></label></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" className="button-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="button-primary"><ShoppingBag size={16} /> Add to shop</button></div></form></div>}
    </section>
  );
};

export default RewardsShop;
