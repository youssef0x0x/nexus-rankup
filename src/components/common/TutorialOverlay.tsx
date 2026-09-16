import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TUTORIAL_KEY = 'nexus-tutorial-completed';
const steps = ['stats', 'quests', 'timer', 'rewards'] as const;

export const shouldShowTutorial = () => {
  try {
    return window.localStorage.getItem(TUTORIAL_KEY) !== 'true';
  } catch {
    return true;
  }
};

interface TutorialOverlayProps {
  onComplete: () => void;
  onStepChange?: (step: TutorialStep) => void;
}

export type TutorialStep = typeof steps[number];
interface TooltipPosition {
  top: number;
  left: number;
}

const finishTutorial = (onComplete: () => void) => {
  try {
    window.localStorage.setItem(TUTORIAL_KEY, 'true');
  } catch {
    // The tutorial still dismisses when storage is unavailable.
  }
  onComplete();
};

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete, onStepChange }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = steps[step];

  useEffect(() => {
    onStepChange?.(current);
  }, [current, onStepChange]);

  useLayoutEffect(() => {
    let target: Element | null = null;
    const updateTarget = () => {
      const nextTarget = document.querySelector(`[data-tour="${current}"]`);
      if (nextTarget !== target) {
        target?.classList.remove('tutorial-target');
        target = nextTarget;
        target?.classList.add('tutorial-target');
      }
      const rect = target?.getBoundingClientRect() ?? null;
      setTargetRect(rect);
      if (!rect) {
        setTooltipPosition(null);
        return;
      }
    };
    updateTarget();
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);
    const retry = window.setInterval(updateTarget, 50);
    return () => {
      target?.classList.remove('tutorial-target');
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget, true);
      window.clearInterval(retry);
    };
  }, [current]);

  useLayoutEffect(() => {
    if (!targetRect || !panelRef.current) return;
    const panel = panelRef.current.getBoundingClientRect();
    const gap = 20;
    const margin = 16;
    const targetCoversMostViewport = targetRect.height > window.innerHeight * 0.55 || targetRect.width > window.innerWidth * 0.85;
    if (targetCoversMostViewport) {
      setTooltipPosition({
        top: Math.max(margin, window.innerHeight - panel.height - 32),
        left: Math.max(margin, (window.innerWidth - panel.width) / 2),
      });
      return;
    }
    const candidates = [
      { top: targetRect.bottom + gap, left: targetRect.left },
      { top: targetRect.top - panel.height - gap, left: targetRect.left },
      { top: targetRect.top, left: targetRect.right + gap },
      { top: targetRect.top, left: targetRect.left - panel.width - gap },
    ];
    const fits = candidates.find((candidate) =>
      candidate.top >= margin &&
      candidate.left >= margin &&
      candidate.top + panel.height <= window.innerHeight - margin &&
      candidate.left + panel.width <= window.innerWidth - margin,
    );
    const fallback = {
      top: window.innerHeight - panel.height - 32,
      left: (window.innerWidth - panel.width) / 2,
    };
    setTooltipPosition({
      top: Math.max(margin, Math.min(window.innerHeight - panel.height - margin, (fits ?? fallback).top)),
      left: Math.max(margin, Math.min(window.innerWidth - panel.width - margin, (fits ?? fallback).left)),
    });
  }, [targetRect, current]);

  const spotlightStyle = targetRect ? {
    top: Math.max(12, targetRect.top - 8),
    left: Math.max(12, targetRect.left - 8),
    width: targetRect.width + 16,
    height: targetRect.height + 16,
  } : undefined;
  const isFinalStep = current === 'rewards';

  return <div className="tutorial-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
    {spotlightStyle && <div className="tutorial-overlay__spotlight" style={spotlightStyle} aria-hidden="true" />}
    <div
      ref={panelRef}
      className={`tutorial-overlay__panel ${tooltipPosition ? 'tutorial-overlay__panel--floating' : ''} ${isFinalStep ? 'tutorial-overlay__panel--bottom' : ''}`}
      style={isFinalStep ? undefined : tooltipPosition ?? undefined}
    >
      <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{t('tutorial.eyebrow')}</p><h2 id="tutorial-title" className="mt-2 text-2xl font-black text-white">{t(`tutorial.${current}.title`)}</h2></div><button className="icon-button" onClick={() => finishTutorial(onComplete)} aria-label={t('tutorial.skip')}><X size={20} /></button></div>
      <p className="mt-4 leading-7 text-slate-300">{t(`tutorial.${current}.description`)}</p>
      <div className="tutorial-overlay__footer"><span className="text-xs font-bold uppercase tracking-widest text-cyan-300">{step + 1} / {steps.length}</span><div className="tutorial-overlay__actions"><button className="button-secondary" onClick={() => finishTutorial(onComplete)}>{t('tutorial.skip')}</button>{step > 0 && <button className="button-secondary" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={15} /> {t('tutorial.back')}</button>}<button className="button-primary" onClick={() => step === steps.length - 1 ? finishTutorial(onComplete) : setStep((value) => value + 1)}>{step === steps.length - 1 ? t('tutorial.complete') : t('tutorial.next')} <ArrowRight size={15} /></button></div></div>
    </div>
  </div>;
};

export default TutorialOverlay;
