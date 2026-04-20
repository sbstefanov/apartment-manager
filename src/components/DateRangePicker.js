import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { useLanguage } from '../context/LanguageContext';

const CalSVG = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8"  y1="2" x2="8"  y2="6"/>
    <line x1="3"  y1="10" x2="21" y2="10"/>
  </svg>
);

export default function DateRangePicker({ checkin, checkout, onChange, bookedRanges = [], errorCheckin, errorCheckout }) {
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

  function isBooked(d) {
    return bookedRanges.some(r => d >= r.checkin && d < r.checkout);
  }
  function isCheckoutDay(d) {
    return bookedRanges.some(r => d === r.checkout);
  }
  function rangeOverlaps(s, e) {
    return bookedRanges.some(r => s < r.checkout && e > r.checkin);
  }
  function previewEnd() {
    return pickingEnd ? (hoverDate || checkout) : checkout;
  }
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
    if (past) return;
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

  const displayText = () => {
    if (checkin && checkout)
      return `${dayjs(checkin).format('DD.MM.YYYY')} → ${dayjs(checkout).format('DD.MM.YYYY')}`;
    if (checkin)
      return `${dayjs(checkin).format('DD.MM.YYYY')} → ${t.drpPickEnd}`;
    return null;
  };
  const text = displayText();
  const hasError = errorCheckin || errorCheckout;

  const hint = () => {
    if (!checkin)  return t.drpHintStart;
    if (!checkout) return t.drpHintEnd;
    const n = dayjs(checkout).diff(dayjs(checkin), 'day');
    return t.drpNights(n);
  };

  return (
    <div className="drp-wrap" ref={wrapRef}>
      <div
        className={`drp-trigger${open ? ' drp-trigger--open' : ''}${hasError ? ' drp-trigger--error' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="drp-trigger-icon"><CalSVG /></span>
        <span className={`drp-trigger-value${!text ? ' drp-placeholder' : ''}`}>
          {text || t.drpPlaceholder}
        </span>
        {checkin && (
          <button className="drp-clear"
            onClick={e => { e.stopPropagation(); onChange('', ''); setHoverDate(null); }}>
            ×
          </button>
        )}
      </div>
      {hasError && (
        <span className="form-error">{errorCheckin || errorCheckout}</span>
      )}

      {open && (
        <div className="drp-popup">
          <div className="drp-header">
            <button className="drp-nav" onClick={() => setMonth(m => m.subtract(1, 'month'))}>‹</button>
            <span className="drp-month-label">{t.months[month.month()]} {month.year()}</span>
            <button className="drp-nav" onClick={() => setMonth(m => m.add(1, 'month'))}>›</button>
          </div>

          <div className="drp-hint">{hint()}</div>

          <div className="drp-dow-row">
            {t.dow.map(d => <span key={d} className="drp-dow">{d}</span>)}
          </div>

          <div className="drp-grid">
            {cells.map(cell => {
              if (cell.empty) return <span key={cell.key} className="drp-cell drp-cell--empty" />;

              let cls = 'drp-cell';
              if (cell.past)        cls += ' drp-cell--past';
              else if (cell.booked) cls += ' drp-cell--booked';
              else                  cls += ' drp-cell--free';
              if (cell.isCheckout)  cls += ' drp-cell--turnover';
              if (cell.isToday && !cell.past) cls += ' drp-cell--today';
              if (cell.isStart)     cls += ' drp-cell--start';
              if (cell.isEnd)       cls += ' drp-cell--end';
              if (cell.inRange)     cls += ' drp-cell--range';
              if (cell.conflict)    cls += ' drp-cell--conflict';
              if (cell.isHoverEnd)  cls += ' drp-cell--hover-end';

              return (
                <span
                  key={cell.key}
                  className={cls}
                  onClick={() => handleDay(cell.dateStr, cell.booked, cell.past)}
                  onMouseEnter={() => pickingEnd && setHoverDate(cell.dateStr)}
                  onMouseLeave={() => pickingEnd && setHoverDate(null)}
                >
                  {cell.d}
                </span>
              );
            })}
          </div>

          <div className="drp-legend">
            <span className="drp-legend-item">
              <span className="drp-legend-swatch drp-legend-swatch--booked" />{t.drpBooked}
            </span>
            <span className="drp-legend-item">
              <span className="drp-legend-swatch drp-legend-swatch--turnover" />{t.drpTurnover}
            </span>
            <span className="drp-legend-item">
              <span className="drp-legend-swatch drp-legend-swatch--selected" />{t.drpSelected}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
