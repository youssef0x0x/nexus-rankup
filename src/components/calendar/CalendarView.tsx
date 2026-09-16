import React, { useMemo, useState } from 'react';
import { CalendarDays, Clock3, GripVertical, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGameState } from '../../context/GameStateContext';
import { Quest } from '../../types';

const dayKey = (date: Date) => date.toISOString().slice(0, 10);
const startOfWeek = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());
  return result;
};

export const CalendarView: React.FC<{ onCreateQuest: () => void }> = ({ onCreateQuest }) => {
  const { t } = useTranslation();
  const { state, scheduleQuest } = useGameState();
  const [mode, setMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(dayKey(new Date()));
  const weekStart = useMemo(() => startOfWeek(new Date()), []);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const assignQuest = (quest: Quest, date: Date, time = quest.dueDate?.slice(11, 16) || '09:00') => {
    const scheduled = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    scheduled.setHours(hours || 9, minutes || 0, 0, 0);
    scheduleQuest(quest.id, scheduled.toISOString());
  };
  const onDrop = (event: React.DragEvent, date: Date) => {
    event.preventDefault();
    const questId = event.dataTransfer.getData('text/quest-id');
    const quest = state.quests.find((item) => item.id === questId);
    if (quest) assignQuest(quest, date);
  };
  const visibleDays = mode === 'day' ? days.filter((date) => dayKey(date) === selectedDay) : days;
  return <section className="space-y-5">
    <div className="section-heading"><div><p className="eyebrow">{t('calendar.eyebrow')}</p><h2 className="page-title">{t('calendar.title')}</h2><p className="page-subtitle">{t('calendar.subtitle')}</p></div><div className="flex flex-wrap gap-2"><button className="button-secondary" onClick={() => setMode(mode === 'week' ? 'day' : 'week')}><CalendarDays size={16} /> {mode === 'week' ? t('calendar.daily') : t('calendar.weekly')}</button><button className="button-primary" onClick={onCreateQuest}><Plus size={16} /> {t('calendar.addQuest')}</button></div></div>
    <div className="flex items-center gap-2 overflow-x-auto">{days.map((date) => <button key={dayKey(date)} className={`filter-pill whitespace-nowrap ${selectedDay === dayKey(date) ? 'filter-active' : ''}`} onClick={() => setSelectedDay(dayKey(date))}>{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</button>)}</div>
    <div className={`grid gap-3 ${mode === 'week' ? 'md:grid-cols-4 xl:grid-cols-7' : 'max-w-xl'}`}>{visibleDays.map((date) => {
      const key = dayKey(date);
      const quests = state.quests.filter((quest) => quest.dueDate?.slice(0, 10) === key);
      return <div key={key} className="calendar-day" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, date)}><div className="calendar-day__header"><strong>{date.toLocaleDateString(undefined, { weekday: 'short' })}</strong><span>{date.getDate()}</span></div><div className="space-y-2">{quests.map((quest) => <article key={quest.id} className={`calendar-quest ${quest.completed ? 'opacity-50' : ''}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/quest-id', quest.id)}><GripVertical size={14} className="shrink-0 text-slate-600" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{quest.title}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-cyan-300"><Clock3 size={11} />{new Date(quest.dueDate ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p></div></article>)}</div>{!quests.length && <p className="py-8 text-center text-xs text-slate-600">{t('calendar.dropHere')}</p>}</div>;
    })}</div>
  </section>;
};

export default CalendarView;
