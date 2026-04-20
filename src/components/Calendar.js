import React, { useState } from 'react';
import dayjs from 'dayjs';
import BookingModal from './BookingModal';
import { useLanguage } from '../context/LanguageContext';

function pillClass(source) {
  if (source === 'Airbnb')      return 'cal-pill cal-pill--airbnb';
  if (source === 'Booking.com') return 'cal-pill cal-pill--booking';
  if (source === 'Директна')    return 'cal-pill cal-pill--direct';
  return 'cal-pill cal-pill--other';
}

function getBookingsForDay(bookings, dateStr) {
  return bookings.filter(
    b => b.status !== 'cancelled' && dateStr >= b.checkin && dateStr < b.checkout
  );
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

export default function Calendar({ bookings, onRefresh }) {
  const { t } = useLanguage();
  const today  = dayjs();
  const [current, setCurrent]   = useState(today.startOf('month'));
  const [selected, setSelected] = useState(null);

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

  return (
    <div className="calendar">
      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={() => setCurrent(c => c.subtract(1, 'month'))}>‹</button>
        <div className="cal-nav-center">
          <h2 className="cal-title">{t.months[month]} {year}</h2>
          {bookingCount > 0
            ? <div className="cal-stats">{t.calStats(bookingCount, occupancyPct)}</div>
            : <div className="cal-stats">{t.calNoBookings}</div>
          }
        </div>
        <button className="cal-nav-btn" onClick={() => setCurrent(c => c.add(1, 'month'))}>›</button>
      </div>

      <div className="cal-grid cal-grid--header">
        {t.dow.map((d, i) => (
          <div key={d} className={`cal-day-header${i >= 5 ? ' cal-day-header--weekend' : ''}`}>{d}</div>
        ))}
      </div>

      <div className="cal-grid--body">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="cal-cell cal-cell--empty" />;

          const col        = i % 7;
          const isWeekend  = col >= 5;
          const dateStr    = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday    = dateStr === today.format('YYYY-MM-DD');
          const dayBkgs    = getBookingsForDay(bookings, dateStr);
          const hasBooking = dayBkgs.length > 0;
          const primarySource = hasBooking ? dayBkgs[0].source : undefined;

          let cellClass = 'cal-cell';
          if (isToday)         cellClass += ' cal-cell--today';
          else if (hasBooking) cellClass += ' cal-cell--booked';
          else if (isWeekend)  cellClass += ' cal-cell--weekend';

          return (
            <div
              key={dateStr}
              className={cellClass}
              data-source={primarySource}
              onClick={() => hasBooking && setSelected(dayBkgs[0])}
            >
              <span className="cal-day-num">{day}</span>
              {dayBkgs.map(b => (
                <span key={b.id} className={pillClass(b.source)}>
                  {b.name.split(' ')[0]}
                </span>
              ))}
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span className="cal-legend-item"><span className="cal-dot cal-dot--direct" />{t.calLegDirect}</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot--airbnb" />Airbnb</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot--booking" />Booking.com</span>
        <span className="cal-legend-item"><span className="cal-dot cal-dot--other" />{t.calLegOther}</span>
      </div>

      {selected && (
        <BookingModal booking={selected} onClose={() => setSelected(null)} onRefresh={onRefresh} />
      )}
    </div>
  );
}
