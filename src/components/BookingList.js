import React, { useState } from 'react';
import dayjs from 'dayjs';
import BookingModal from './BookingModal';
import { useLanguage } from '../context/LanguageContext';
import { fmtEur } from '../context/LanguageContext';

const FILTER_IDS = ['all', 'paid', 'pending', 'cancelled'];

const STATUS_CLASS = {
  paid:      'badge badge--paid',
  pending:   'badge badge--pending',
  cancelled: 'badge badge--cancelled',
};
const SOURCE_CLASS = {
  'Директна':    'source-badge source-badge--direct',
  'Airbnb':      'source-badge source-badge--airbnb',
  'Booking.com': 'source-badge source-badge--booking',
  'Друго':       'source-badge source-badge--other',
};
const AVATAR_CLASS = {
  'Директна':    'booking-avatar booking-avatar--direct',
  'Airbnb':      'booking-avatar booking-avatar--airbnb',
  'Booking.com': 'booking-avatar booking-avatar--booking',
  'Друго':       'booking-avatar booking-avatar--other',
};

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

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

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
    <div className="booking-list">

      {/* ── Search ── */}
      <div className="search-bar">
        <div className="search-wrap">
          <span className="search-icon-wrap"><SearchIcon /></span>
          <input
            className="search-input"
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Filters — 2×2 grid on mobile, row on desktop ── */}
        <div className="filter-bar">
          {FILTER_IDS.map(id => (
            <button
              key={id}
              className={`filter-btn${filter === id ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(id)}
            >
              {t.filters[id]}
              <span className="filter-count">{counts[id]}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">{t.noBookings}</div>
        </div>
      ) : (
        <>
          <div className="booking-list-header">
            <span />
            <span>{t.colGuest}</span>
            <span className="blh-source">{t.colPlatform}</span>
            <span className="blh-amount">{t.colAmount}</span>
            <span className="blh-status">{t.colStatus}</span>
          </div>

          <div className="booking-rows">
            {filtered.map(b => {
              const ctx       = statusContext(b, t);
              const avatarCls = AVATAR_CLASS[b.source] || 'booking-avatar booking-avatar--other';
              const sourceCls = SOURCE_CLASS[b.source]  || 'source-badge source-badge--other';
              const srcLabel  = t.sources[b.source]     || b.source;

              return (
                <div
                  key={b.id}
                  className={`booking-row booking-row--${b.status}`}
                  onClick={() => setSelected(b)}
                >
                  <div className={avatarCls}>{initials(b.name)}</div>

                  <div className="booking-info">
                    <div className="booking-name-row">
                      <span className="booking-name">{b.name}</span>
                    </div>
                    <div className="booking-dates">
                      <span className="booking-date-from">{dayjs(b.checkin).format('DD.MM.YY')}</span>
                      <span className="booking-date-arrow">→</span>
                      <span className="booking-date-to">{dayjs(b.checkout).format('DD.MM.YY')}</span>
                      <span className="booking-nights">{t.nights(nights(b.checkin, b.checkout))}</span>
                      <span className="booking-persons">{t.persons(b.persons)}</span>
                      {ctx && (
                        <span className={ctx.type === 'active' ? 'active-badge active-badge--inline' : 'upcoming-badge upcoming-badge--inline'}>
                          {ctx.label}
                        </span>
                      )}
                    </div>

                    {/* Mobile card footer */}
                    <div className="booking-card-footer">
                      <span className={sourceCls}>{srcLabel}</span>
                      <span className="booking-amount">{fmtEur(b.amount)}</span>
                    </div>
                  </div>

                  <div className="booking-col booking-col--source">
                    <span className={sourceCls}>{srcLabel}</span>
                  </div>
                  <div className="booking-col booking-col--amount">
                    <span className="booking-amount">{fmtEur(b.amount)}</span>
                  </div>
                  <div className="booking-col booking-col--status">
                    <span className={STATUS_CLASS[b.status]}>{t.status[b.status]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <BookingModal booking={selected} onClose={() => setSelected(null)} onRefresh={onRefresh} />
      )}
    </div>
  );
}
