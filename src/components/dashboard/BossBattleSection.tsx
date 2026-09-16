import React from 'react';
import { ShieldAlert } from 'lucide-react';

const BossBattleSection: React.FC = () => (
  <section className="boss-teaser glass-card overflow-hidden">
    <div className="boss-teaser__scanlines" aria-hidden="true" />
    <div className="boss-teaser__content">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-rose-300/80">NEXUS THREAT PROTOCOL</p>
          <h2 className="mt-2 text-2xl font-black text-white">Boss Battles</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Your stats, weapons, and armor will become your battle power when the first boss enters the Nexus.</p>
        </div>
        <div className="boss-teaser__badge"><ShieldAlert size={15} /> COMING SOON</div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="boss-teaser__silhouette" aria-label="Epic boss silhouette">
          <div className="boss-teaser__horn boss-teaser__horn--left" />
          <div className="boss-teaser__horn boss-teaser__horn--right" />
          <div className="boss-teaser__head"><span /><span /></div>
          <div className="boss-teaser__body" />
        </div>
        <p className="max-w-sm text-right text-xs uppercase tracking-[0.18em] text-slate-500">Combat systems are being prepared for a future Nexus release.</p>
      </div>
    </div>
  </section>
);

export default BossBattleSection;
