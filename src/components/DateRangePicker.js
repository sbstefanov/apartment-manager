import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faChevronLeft, faChevronRight, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../context/LanguageContext';

export default function DateRangePicker({ checkin, checkout, onChange, bookedRanges = [], errorCheckin, errorCheckout, allowPast = false, placeholder }) {
  const { t } = useLanguage();
  const today = dayjs().format('YYYY-MM-DD');

  const [open, setOpen]           = useState(false);
  const [month, setMonth]         = useState(() =>
    checkin ? dayjs(checkin).startOf('month') : dayjs().startOf('month')
  );
  const [hoverDate, setHoverDate] = useState(null);
  const wrapRef = useRef(null);

  const pickingEnd = !!(checkin && !checkout);

  useEffect(() => {
    if (!open) return;
    const h = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setHoverDate(null);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  function isBooked(d)        { return bookedRanges.some(r => d >= r.checkin && d < r.checkout); }
  function isCheckoutDay(d)   { return bookedRanges.some(r => d === r.checkout); }
  function rangeOverlaps(s,e) { return bookedRanges.some(r => s < r.checkout && e > r.checkin); }
  function previewEnd()       { return pickingEnd ? (hoverDate || checkout) : checkout; }
  function isInRange(d) {
    const s = checkin, e = previewEnd();
    if (!s || !e) return false;
    const [lo, hi] = s <= e ? [s, e] : [e, s];
    return d > lo && d < hi;
  }
  function isHoverConflict(d) {
    if (!pickingEnd || !hoverDate) return false;
    const [s, e] = hoverDate > checkin ? [checkin, hoverDate] : [hoverDate, checkin];
    return isBooked(d) && d > s && d < e;
  }

  function handleDay(dateStr, booked, past) {
    if (past && !allowPast) return;
    if (!checkin || (checkin && checkout)) {
      onChange(booked ? '' : dateStr, '');
      if (!booked) return;
    } else {
      if (dateStr === checkin) return;
      const [s, e] = dateStr > checkin ? [checkin, dateStr] : [dateStr, checkin];
      if (rangeOverlaps(s, e)) return;
      onChange(s, e);
      setOpen(false); setHoverDate(null);
    }
  }

  const daysInMonth = month.daysInMonth();
  const firstDow    = month.startOf('month').day();
  const offset      = firstDow === 0 ? 6 : firstDow - 1;

  const cells = [];
  for (let i = 0; i < offset; i++) cells.push({ empty: true, key: `e${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr    = month.date(d).format('YYYY-MM-DD');
    const booked     = isBooked(dateStr);
    const past       = dateStr < today;
    const isCheckout = !booked && isCheckoutDay(dateStr);
    cells.push({
      key: dateStr, dateStr, d,
      booked, past, isCheckout,
      isToday:    dateStr === today,
      isStart:    dateStr === checkin,
      isEnd:      dateStr === checkout,
      inRange:    isInRange(dateStr),
      conflict:   isHoverConflict(dateStr),
      isHoverEnd: pickingEnd && dateStr === hoverDate && hoverDate !== checkin,
    });
  }

  const text = checkin && checkout
    ? `${dayjs(checkin).format('DD.MM.YYYY')} → ${dayjs(checkout).format('DD.MM.YYYY')}`
    : checkin
      ? `${dayjs(checkin).format('DD.MM.YYYY')} → ${t.drpPickEnd}`
      : null;

  const hasError = errorCheckin || errorCheckout;

  const hint = () => {
    if (!checkin)  return t.drpHintStart;
    if (!checkout) return t.drpHintEnd;
    return t.drpNights(dayjs(checkout).diff(dayjs(checkin), 'day'));
  };

  function cellClasses(c) {
    if (c.empty) return '';
    let base = 'aspect-square flex items-center justify-center text-sm rounded-lg transition-all relative select-none';
    if (c.past && !allowPast) return `${base} text-app-3 opacity-40 cursor-default`;
    if (c.isStart || c.isEnd) return `${base} bg-primary-500 text-white font-bold cursor-pointer ${c.isStart ? 'rounded-r-none' : ''} ${c.isEnd ? 'rounded-l-none' : ''} ${c.isStart && c.isEnd ? 'rounded-lg' : ''}`;
    if (c.inRange)     return `${base} bg-primary-500/15 rounded-none cursor-pointer`;
    if (c.isHoverEnd)  return `${base} bg-primary-500/20 border-2 border-dashed border-primary-500 cursor-pointer`;
    if (c.conflict)    return `${base} bg-rose-200 text-rose-600 cursor-not-allowed`;
    if (c.booked)      return `${base} booked-stripes text-rose-400 cursor-not-allowed`;
    if (c.isCheckout)  return `${base} turnover-bg cursor-pointer hover:brightness-95 ${c.isToday ? 'font-bold text-primary-500' : ''}`;
    if (c.isToday)     return `${base} font-bold text-primary-500 cursor-pointer hover:bg-primary-50`;
    return `${base} text-app-2 cursor-pointer hover:bg-primary-50 hover:text-primary-500`;
  }

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border cursor-pointer transition-all ${
          hasError ? 'border-rose-500' : open ? 'border-primary-500 ring-2 ring-primary-500/15' : 'border-app hover:border-primary-500'
        }`}
        style={{ background: 'var(--surface)' }}
      >
        <FontAwesomeIcon icon={faCalendarDays} className="text-app-3 text-sm" />
        <span className={`flex-1 text-sm ${text ? 'text-app font-semibold' : 'text-app-3'}`}>
          {text || placeholder || t.drpPlaceholder}
        </span>
        {checkin && (
          <button
            onClick={e => { e.stopPropagation(); onChange('', ''); setHoverDate(null); }}
            className="text-app-3 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 w-6 h-6 rounded flex items-center justify-center"
            aria-label="Clear"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>
      {hasError && (
        <span className="text-xs text-rose-500 mt-1.5 block">{errorCheckin || errorCheckout}</span>
      )}

      {/* Popup */}
      {open && (
        <div className="absolute top-full mt-2 left-0 w-full md:w-[340px] z-50 card p-4 animate-pop-in">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setMonth(m => m.subtract(1, 'month'))}
              className="w-8 h-8 rounded-lg border border-app hover:border-primary-500 hover:text-primary-500 flex items-center justify-center flex-shrink-0"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <span className="font-bold text-sm capitalize w-40 text-center">{t.months[month.month()]} {month.year()}</span>
            <button
              onClick={() => setMonth(m => m.add(1, 'month'))}
              className="w-8 h-8 rounded-lg border border-app hover:border-primary-500 hover:text-primary-500 flex items-center justify-center flex-shrink-0"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          {/* Hint */}
          <div className="text-center text-xs font-semibold text-primary-500 mb-2 min-h-[18px]">{hint()}</div>

          {/* Day-of-week */}
          <div className="grid grid-cols-7 mb-1">
            {t.dow.map(d => (
              <span key={d} className="text-center text-[11px] font-bold text-app-3 py-1">{d}</span>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-0.5 min-h-[260px]">
            {cells.map(cell => {
              if (cell.empty) return <span key={cell.key} className="aspect-square" />;
              return (
                <span
                  key={cell.key}
                  className={cellClasses(cell)}
                  onClick={() => handleDay(cell.dateStr, cell.booked, cell.past)}
                  onMouseEnter={() => pickingEnd && setHoverDate(cell.dateStr)}
                  onMouseLeave={() => pickingEnd && setHoverDate(null)}
                >
                  {cell.d}
                </span>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center flex-wrap gap-3 mt-3 pt-3 border-t border-app text-[11px] text-app-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded booked-stripes border border-rose-300" />{t.drpBooked}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded turnover-bg border border-slate-300" />{t.drpTurnover}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary-500" />{t.drpSelected}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
