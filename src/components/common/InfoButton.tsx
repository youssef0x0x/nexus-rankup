import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface InfoButtonProps {
  title: string;
  description: string;
}

const InfoButton: React.FC<InfoButtonProps> = ({ title, description }) => {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="icon-button p-1.5 text-cyan-400/80 hover:text-cyan-300" onClick={() => setOpen(true)} aria-label={`Explain ${title}`} title={`Explain ${title}`}><HelpCircle size={15} /></button>
    {open && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby={`info-${title}`}><div className="modal-panel max-w-md"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">NEXUS GUIDE</p><h2 id={`info-${title}`} className="mt-1 text-xl font-black text-white">{title}</h2></div><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close explanation"><X size={18} /></button></div><p className="mt-4 leading-7 text-slate-300">{description}</p><div className="mt-6 flex justify-end"><button type="button" className="button-primary" onClick={() => setOpen(false)}>Understood</button></div></div></div>}
  </>;
};

export default InfoButton;
