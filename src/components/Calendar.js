import React, { useState, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faCalendarXmark, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import BookingModal from './BookingModal';
import { useLanguage } from '../context/LanguageContext';

const SOURCE_PILL = {
  'Airbnb':      'bg-airbnb text-white',
  'Booking.com': 'bg-booking text-white',
  'Директна':    'bg-direct text-white',
  'Друго':       'bg-slate-500 text-white',
};

const SOURCE_CELL = {
  'Airbnb':      'cal-cell-airbnb',
  'Booking.com': 'cal-cell-booking',
  'Директна':    'cal-cell-direct',
  'Друго':       'cal-cell-other',
};

function getBookingsForDay(bookings, dateStr) {
  return bookings.filter(b => b.status !== 'cancelled' && dateStr >= b.checkin && dateStr < b.checkout);
}

function calcOccupancy(bookings, year, month, daysInMonth) {
  const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const monthEnd   = dayjs(monthStart).add(1, 'month').format('YYYY-MM-DD');
  const active = bookings.filter(
    b => b.status !== 'cancelled' && b.checkin < monthEnd && b.checkout > monthStart
  );
  let bookedDays = 0;
  active.forEach(b => {
    const start = b.checkin > monthStart ? b.checkin : monthStart;
    const end   = b.checkout < monthEnd  ? b.checkout : monthEnd;
    bookedDays += dayjs(end).diff(dayjs(start), 'day');
  });
  return { count: active.length, pct: Math.round((bookedDays / daysInMonth) * 100) };
}

/* ─── Year/Month picker popup ─────────────────────────────────── */
function MonthYearPicker({ open, year, month, onClose, onPick }) {
  const { t } = useLanguage();
  const [pickerYear, setPickerYear] = useState(year);
  const ref = useRef(null);

  useEffect(() => { if (open) setPickerYear(year); }, [open, year]);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] z-30 card p-4 animate-pop-in"
    >
      {/* Year nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setPickerYear(y => y - 1)}
          className="w-8 h-8 rounded-lg border border-app hover:border-primary-500 hover:text-primary-500 flex items-center justify-center"
          aria-label="Previous year"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div className="font-bold text-base text-app">{pickerYear}</div>
        <button
          onClick={() => setPickerYear(y => y + 1)}
          className="w-8 h-8 rounded-lg border border-app hover:border-primary-500 hover:text-primary-500 flex items-center justify-center"
          aria-label="Next year"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>

      {/* 12 months grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {t.months.map((m, i) => {
          const isCurrent = pickerYear === year && i === month;
          return (
            <button
              key={m}
              onClick={() => onPick(pickerYear, i)}
              className={`py-2 rounded-lg text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-primary-500 text-white'
                  : 'surface-2 text-app-2 hover:bg-primary-50 hover:text-primary-500'
              }`}
            >
              {m.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Calendar({ bookings, onRefresh }) {
  const { t } = useLanguage();
  const today = dayjs();
  const [current, setCurrent]     = useState(today.startOf('month'));
  const [selected, setSelected]   = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const year        = current.year();
  const month       = current.month();
  const firstDay    = current.day();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = current.daysInMonth();

  const { count: bookingCount, pct: occupancyPct } = calcOccupancy(bookings, year, month, daysInMonth);

  const cells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function jumpTo(y, m) {
    setCurrent(dayjs(`${y}-${String(m + 1).padStart(2, '0')}-01`));
    setPickerOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Navigation + month/year picker trigger */}
      <div className="card flex items-center justify-between p-3 md:p-4 relative">
        <button
          onClick={() => setCurrent(c => c.subtract(1, 'month'))}
          className="w-9 h-9 rounded-lg border border-app surface-2 hover:bg-primary-50 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center"
          aria-label="Previous month"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Clickable title — opens picker */}
        <button
          onClick={() => setPickerOpen(o => !o)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg hover:surface-2 transition-colors"
        >
          <span className="flex items-center gap-2 text-base md:text-lg font-bold text-app capitalize">
            {t.months[month]} {year}
            <FontAwesomeIcon icon={faChevronDown} className={`text-xs text-app-3 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </span>
          <span className="text-xs text-app-3">
            {bookingCount > 0 ? t.calStats(bookingCount, occupancyPct) : t.calNoBookings}
          </span>
        </button>

        <button
          onClick={() => setCurrent(c => c.add(1, 'month'))}
          className="w-9 h-9 rounded-lg border border-app surface-2 hover:bg-primary-50 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center"
          aria-label="Next month"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        <MonthYearPicker
          open={pickerOpen}
          year={year}
          month={month}
          onClose={() => setPickerOpen(false)}
          onPick={jumpTo}
        />
      </div>

      {/* "Jump to today" — only when not on current month */}
      {!current.isSame(today.startOf('month'), 'month') && (
        <div className="flex justify-center">
          <button
            onClick={() => setCurrent(today.startOf('month'))}
            className="text-xs font-semibold text-primary-500 hover:text-primary-600 px-3 py-1 rounded-full hover:bg-primary-50 transition-colors"
          >
            {t.todayLabel} →
          </button>
        </div>
      )}

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-app-3 px-1">
        {t.dow.map((d, i) => (
          <div key={d} className={i >= 5 ? 'text-rose-400' : ''}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="aspect-square" />;

          const col       = i % 7;
          const isWeekend = col >= 5;
          const dateStr   = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday   = dateStr === today.format('YYYY-MM-DD');
          const dayBkgs   = getBookingsForDay(bookings, dateStr);
          const hasBkg    = dayBkgs.length > 0;
          const primary   = hasBkg ? dayBkgs[0].source : undefined;

          let cls = 'relative aspect-square rounded-lg p-1 md:p-1.5 flex flex-col gap-0.5 surface border border-app text-[11px] md:text-xs overflow-hidden transition-all';
          if (isToday) {
            cls += ' ring-2 ring-primary-500 ring-offset-1 font-bold';
          } else if (hasBkg) {
            cls += ` ${SOURCE_CELL[primary] || ''} cursor-pointer hover:scale-[1.04] hover:shadow-soft`;
          } else if (isWeekend) {
            cls += ' bg-slate-50 dark:bg-slate-900/40';
          }

          return (
            <div
              key={dateStr}
              className={cls}
              onClick={() => hasBkg && setSelected(dayBkgs[0])}
            >
              <span className={`${isToday ? 'text-primary-500' : 'text-app-2'} font-semibold`}>{day}</span>
              {dayBkgs.slice(0, 2).map(b => (
                <span
                  key={b.id}
                  className={`${SOURCE_PILL[b.source] || 'bg-slate-500 text-white'} rounded px-1 py-0 text-[9px] md:text-[10px] truncate font-semibold leading-tight`}
                >
                  {b.name.split(' ')[0]}
                </span>
              ))}
              {dayBkgs.length > 2 && (
                <span className="text-[9px] text-app-3 font-semibold">+{dayBkgs.length - 2}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {bookingCount === 0 && (
        <div className="card p-8 text-center">
          <FontAwesomeIcon icon={faCalendarXmark} className="text-3xl text-app-3 mb-2" />
          <div className="text-sm text-app-2">{t.calNoBookings}</div>
        </div>
      )}

      {/* Platform legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-app-2 pt-2">
        <LegendDot color="bg-direct"    label={t.calLegDirect} />
        <LegendDot color="bg-airbnb"    label="Airbnb" />
        <LegendDot color="bg-booking"   label="Booking.com" />
        <LegendDot color="bg-slate-500" label={t.calLegOther} />
      </div>

      {selected && (
        <BookingModal booking={selected} bookings={bookings} onClose={() => setSelected(null)} onRefresh={onRefresh} />
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
