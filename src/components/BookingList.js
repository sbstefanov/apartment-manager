import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faArrowRight, faMoon, faUserGroup, faCalendarXmark } from '@fortawesome/free-solid-svg-icons';
import BookingModal from './BookingModal';
import { useLanguage, fmtEur } from '../context/LanguageContext';

const FILTER_IDS = ['all', 'paid', 'pending', 'cancelled'];

const STATUS_CLASS = { paid: 'badge badge-paid', pending: 'badge badge-pending', cancelled: 'badge badge-cancelled' };
const SOURCE_CHIP  = { 'Директна': 'chip chip-direct', 'Airbnb': 'chip chip-airbnb', 'Booking.com': 'chip chip-booking', 'Друго': 'chip chip-other' };
const AVATAR_CLASS = { 'Директна': 'avatar avatar-direct', 'Airbnb': 'avatar avatar-airbnb', 'Booking.com': 'avatar avatar-booking', 'Друго': 'avatar avatar-other' };

function initials(name) {
  const p = name.trim().split(' ');
  return (p.length >= 2 ? p[0][0] + p[1][0] : p[0][0]).toUpperCase();
}
function nights(checkin, checkout) {
  return dayjs(checkout).diff(dayjs(checkin), 'day');
}
function statusContext(b, t) {
  if (b.status === 'cancelled') return null;
  const today = dayjs().format('YYYY-MM-DD');
  if (b.checkin <= today && b.checkout > today) return { type: 'active', label: t.activeLabel };
  if (b.checkin > today) {
    const diff = dayjs(b.checkin).diff(dayjs(today), 'day');
    return { type: 'upcoming', label: diff === 0 ? t.todayLabel : t.inDays(diff) };
  }
  return null;
}

export default function BookingList({ bookings, onRefresh }) {
  const { t } = useLanguage();
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  const counts = {
    all:       bookings.length,
    paid:      bookings.filter(b => b.status === 'paid').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const filtered = [...bookings]
    .sort((a, b) => (a.checkin < b.checkin ? 1 : -1))
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="card p-3 md:p-4">
        <div className="relative mb-3">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Filters — 4-up on desktop, 2x2 on mobile */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
          {FILTER_IDS.map(id => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'surface-2 text-app-2 border-app hover:border-primary-500 hover:text-primary-500'
                }`}
              >
                <span>{t.filters[id]}</span>
                <span className={`text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-app-2'
                }`}>
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FontAwesomeIcon icon={faCalendarXmark} className="text-4xl text-app-3 mb-3" />
          <div className="text-sm text-app-2">{t.noBookings}</div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop column headers */}
          <div className="hidden md:grid grid-cols-[40px_1fr_120px_120px_140px] gap-3 px-4 py-3 border-b border-app surface-2 text-[11px] font-bold uppercase tracking-wider text-app-3">
            <span />
            <span>{t.colGuest}</span>
            <span>{t.colPlatform}</span>
            <span>{t.colAmount}</span>
            <span>{t.colStatus}</span>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {filtered.map(b => {
              const ctx       = statusContext(b, t);
              const avatarCls = AVATAR_CLASS[b.source] || 'avatar avatar-other';
              const sourceCls = SOURCE_CHIP[b.source]  || 'chip chip-other';
              const srcLabel  = t.sources[b.source]    || b.source;
              const stripe = b.status === 'paid' ? 'border-l-[3px] border-emerald-500' :
                             b.status === 'pending' ? 'border-l-[3px] border-amber-500' :
                             b.status === 'cancelled' ? 'border-l-[3px] border-rose-500 opacity-60' : '';

              return (
                <button
                  key={b.id}
                  onClick={() => setSelected(b)}
                  className={`w-full text-left grid md:grid-cols-[40px_1fr_120px_120px_140px] grid-cols-[40px_1fr] gap-3 px-3 md:px-4 py-3 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors ${stripe}`}
                >
                  {/* Avatar */}
                  <div className={`${avatarCls} w-10 h-10`}>{initials(b.name)}</div>

                  {/* Name + dates */}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-app truncate">{b.name}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-app-3">
                      <span className="font-semibold text-app-2">{dayjs(b.checkin).format('DD.MM.YY')}</span>
                      <FontAwesomeIcon icon={faArrowRight} className="text-[9px]" />
                      <span className="font-semibold text-app-2">{dayjs(b.checkout).format('DD.MM.YY')}</span>
                      <span className="surface-2 px-1.5 py-px rounded text-[10px] flex items-center gap-1">
                        <FontAwesomeIcon icon={faMoon} className="text-[8px]" />
                        {t.nights(nights(b.checkin, b.checkout))}
                      </span>
                      <span className="surface-2 px-1.5 py-px rounded text-[10px] flex items-center gap-1">
                        <FontAwesomeIcon icon={faUserGroup} className="text-[8px]" />
                        {t.persons(b.persons)}
                      </span>
                      {ctx && (
                        <span className={`text-[10px] font-semibold px-2 py-px rounded-full ${
                          ctx.type === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {ctx.label}
                        </span>
                      )}
                    </div>

                    {/* Mobile-only inline source + amount */}
                    <div className="md:hidden flex items-center justify-between mt-2">
                      <span className={sourceCls}>{srcLabel}</span>
                      <span className="font-bold text-sm">{fmtEur(b.amount)}</span>
                    </div>
                  </div>

                  {/* Desktop columns */}
                  <div className="hidden md:flex items-center"><span className={sourceCls}>{srcLabel}</span></div>
                  <div className="hidden md:flex items-center font-bold text-sm">{fmtEur(b.amount)}</div>
                  <div className="hidden md:flex items-center"><span className={STATUS_CLASS[b.status]}>{t.status[b.status]}</span></div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <BookingModal booking={selected} onClose={() => setSelected(null)} onRefresh={onRefresh} />
      )}
    </div>
  );
}
