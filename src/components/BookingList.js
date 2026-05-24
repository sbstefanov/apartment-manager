import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass, faArrowRight, faMoon, faUserGroup, faCalendarXmark,
  faPenToSquare, faCheck, faBan, faTrash, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import BookingModal from './BookingModal';
import DateRangePicker from './DateRangePicker';
import { saveBooking, deleteBooking } from '../services/storage';
import { useLanguage, fmtEur } from '../context/LanguageContext';

const FILTER_IDS = ['all', 'paid', 'partial', 'pending', 'cancelled'];


const STATUS_CLASS = { paid: 'badge badge-paid', pending: 'badge badge-pending', partial: 'badge badge-partial', cancelled: 'badge badge-cancelled' };
const SOURCE_CHIP  = { 'Директна': 'chip chip-direct', 'Airbnb': 'chip chip-airbnb', 'Booking.com': 'chip chip-booking', 'OLX': 'chip chip-olx', 'Facebook': 'chip chip-facebook', 'Друго': 'chip chip-other' };
const AVATAR_CLASS = { 'Директна': 'avatar avatar-direct', 'Airbnb': 'avatar avatar-airbnb', 'Booking.com': 'avatar avatar-booking', 'OLX': 'avatar avatar-olx', 'Facebook': 'avatar avatar-facebook', 'Друго': 'avatar avatar-other' };

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

/* ─── Action button: colored icon + left-side tooltip on hover ── */
function ActionBtn({ icon, title, colorCls, onClick }) {
  return (
    <div className="relative group/btn flex-shrink-0">
      <button
        onClick={onClick}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 border border-transparent ${colorCls}`}
      >
        <FontAwesomeIcon icon={icon} className="text-sm" />
      </button>
      {/* Tooltip — appears to the LEFT (stays inside the card bounds) */}
      <div className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity duration-150 shadow-lg z-20">
        {title}
        {/* Caret pointing right toward the button */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-l-slate-800 dark:border-l-slate-700" />
      </div>
    </div>
  );
}

/* ─── Inline confirmation cell ────────────────────────────────── */
function ConfirmCell({ action, t, onConfirm, onDismiss }) {
  const meta = {
    paid:   { label: t.confirmPaidShort,   labelCls: 'text-emerald-600 dark:text-emerald-400', btnCls: 'bg-emerald-500 hover:bg-emerald-600' },
    cancel: { label: t.confirmCancelShort, labelCls: 'text-amber-600 dark:text-amber-400',   btnCls: 'bg-amber-500 hover:bg-amber-600' },
    delete: { label: t.confirmDelShort,    labelCls: 'text-rose-600 dark:text-rose-400',     btnCls: 'bg-rose-500 hover:bg-rose-600' },
  }[action];

  return (
    <div className="flex items-center gap-1.5 animate-fade-in">
      <span className={`text-xs font-bold whitespace-nowrap ${meta.labelCls}`}>{meta.label}</span>
      <button
        title={t.btnConfirm}
        onClick={onConfirm}
        className={`w-8 h-8 rounded-lg text-white flex items-center justify-center transition-colors ${meta.btnCls}`}
      >
        <FontAwesomeIcon icon={faCheck} className="text-xs" />
      </button>
      <button
        title={t.btnClose}
        onClick={onDismiss}
        className="w-8 h-8 rounded-lg surface-2 border border-app text-app-3 hover:text-app flex items-center justify-center transition-colors"
      >
        <FontAwesomeIcon icon={faXmark} className="text-xs" />
      </button>
    </div>
  );
}

export default function BookingList({ bookings, onRefresh }) {
  const { t } = useLanguage();
  const [filter, setFilter]                 = useState('all');
  const [search, setSearch]                 = useState('');
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo, setDateTo]                 = useState('');
  const [selected, setSelected]             = useState(null);
  const [openInEditMode, setOpenInEditMode] = useState(false);
  const [confirm, setConfirm]               = useState(null);

  const hasDateFilter = dateFrom || dateTo;

  const counts = {
    all:       bookings.length,
    paid:      bookings.filter(b => b.status === 'paid').length,
    partial:   bookings.filter(b => b.status === 'partial').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const filtered = [...bookings]
    .sort((a, b) => (a.checkin < b.checkin ? 1 : -1))
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()))
    // Date range: show bookings that overlap with [dateFrom, dateTo]
    .filter(b => {
      if (!dateFrom && !dateTo) return true;
      if (dateFrom && dateTo)   return b.checkin <= dateTo && b.checkout >= dateFrom;
      if (dateFrom)             return b.checkout >= dateFrom;
      if (dateTo)               return b.checkin  <= dateTo;
      return true;
    });

  /* ─── Open modal helpers ─────────────────────────────────────── */
  function openView(b) { setSelected(b); setOpenInEditMode(false); }
  function openEdit(b, e) { e.stopPropagation(); setConfirm(null); setSelected(b); setOpenInEditMode(true); }
  function closeModal()  { setSelected(null); setOpenInEditMode(false); }

  /* ─── Confirm-gated inline handlers ─────────────────────────── */
  function requestAction(b, action, e) {
    e.stopPropagation();
    setConfirm({ id: b.id, action });
  }

  async function executeConfirm(b, e) {
    e.stopPropagation();
    if (!confirm) return;
    if (confirm.action === 'paid')   { await saveBooking({ ...b, status: 'paid' });      await onRefresh(); }
    if (confirm.action === 'cancel') { await saveBooking({ ...b, status: 'cancelled' }); await onRefresh(); }
    if (confirm.action === 'delete') { await deleteBooking(b.id);                        await onRefresh(); }
    setConfirm(null);
  }

  function dismissConfirm(e) { e.stopPropagation(); setConfirm(null); }

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

        {/* Status filters + date range — same row */}
        <div className="flex flex-wrap gap-2 items-start">
          {FILTER_IDS.map(id => {
            const isActive = filter === id;
            return (
              <button
                key={id}
                onClick={() => { setFilter(id); setConfirm(null); }}
                className={`flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all flex-1 min-w-[calc(50%-4px)] md:flex-none ${
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

          {/* Date range picker — same row on desktop, full width on mobile */}
          <div className="w-full md:flex-1 md:min-w-[220px]">
            <DateRangePicker
              checkin={dateFrom}
              checkout={dateTo}
              onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
              bookedRanges={[]}
              allowPast
              placeholder={t.filterDatePh}
            />
          </div>
        </div>

        {/* Active date filter indicator */}
        {hasDateFilter && (
          <p className="mt-2 text-[11px] text-primary-500 font-semibold">
            {t.filterActive(filtered.length)}
          </p>
        )}
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
          <div className="hidden md:grid grid-cols-[40px_1fr_110px_110px_110px_164px] gap-3 pl-4 pr-6 py-3 border-b border-app surface-2 text-[11px] font-bold uppercase tracking-wider text-app-3">
            <span />
            <span>{t.colGuest}</span>
            <span>{t.colPlatform}</span>
            <span>{t.colAmount}</span>
            <span>{t.colStatus}</span>
            <span>{t.colActions}</span>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {filtered.map(b => {
              const ctx       = statusContext(b, t);
              const avatarCls = AVATAR_CLASS[b.source] || 'avatar avatar-other';
              const sourceCls = SOURCE_CHIP[b.source]  || 'chip chip-other';
              const srcLabel  = t.sources[b.source]    || b.source;
              const stripe = b.status === 'paid'      ? 'border-l-[3px] border-emerald-500' :
                             b.status === 'pending'   ? 'border-l-[3px] border-amber-500' :
                             b.status === 'partial'   ? 'border-l-[3px] border-orange-500' :
                             b.status === 'cancelled' ? 'border-l-[3px] border-rose-500 opacity-60' : '';

              const isConfirming = confirm?.id === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => openView(b)}
                  className={`w-full text-left grid md:grid-cols-[40px_1fr_110px_110px_110px_164px] grid-cols-[40px_1fr] gap-3 px-3 md:pl-4 md:pr-6 py-3 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors cursor-pointer ${stripe}`}
                >
                  {/* Avatar */}
                  <div className={`${avatarCls} w-10 h-10 self-center`}>{initials(b.name)}</div>

                  {/* Name + dates */}
                  <div className="min-w-0 self-center">
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
                    {/* Mobile-only: source + amount */}
                    <div className="md:hidden flex items-center justify-between mt-2">
                      <span className={sourceCls}>{srcLabel}</span>
                      <span className="font-bold text-sm">{fmtEur(b.amount)}</span>
                    </div>
                  </div>

                  {/* Desktop: Platform */}
                  <div className="hidden md:flex items-center self-center">
                    <span className={sourceCls}>{srcLabel}</span>
                  </div>

                  {/* Desktop: Amount */}
                  <div className="hidden md:flex flex-col justify-center self-center">
                    <span className="font-bold text-sm">{fmtEur(b.amount)}</span>
                    {b.status === 'partial' && b.paid_amount != null && (
                      <span className="text-[10px] text-orange-500 font-semibold">
                        {fmtEur(b.paid_amount)} / {fmtEur(b.amount - b.paid_amount)}
                      </span>
                    )}
                  </div>

                  {/* Desktop: Status */}
                  <div className="hidden md:flex items-center self-center">
                    <span className={STATUS_CLASS[b.status]}>{t.status[b.status]}</span>
                  </div>

                  {/* Desktop: Actions column */}
                  <div
                    className="hidden md:flex items-center self-center"
                    onClick={e => e.stopPropagation()}
                  >
                    {isConfirming ? (
                      /* ── Inline confirmation ── */
                      <ConfirmCell
                        action={confirm.action}
                        t={t}
                        onConfirm={e => executeConfirm(b, e)}
                        onDismiss={dismissConfirm}
                      />
                    ) : (
                      /* ── Normal action buttons ── */
                      <div className="flex items-center gap-0.5">
                        {/* Edit */}
                        <ActionBtn
                          icon={faPenToSquare}
                          title={t.btnEdit}
                          colorCls="text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/40 dark:hover:text-blue-300"
                          onClick={e => openEdit(b, e)}
                        />
                        {/* Mark Paid — pending only */}
                        {b.status === 'pending' && (
                          <ActionBtn
                            icon={faCheck}
                            title={t.btnMarkPaid}
                            colorCls="text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300"
                            onClick={e => requestAction(b, 'paid', e)}
                          />
                        )}
                        {/* Cancel — paid or pending */}
                        {(b.status === 'paid' || b.status === 'pending') && (
                          <ActionBtn
                            icon={faBan}
                            title={t.btnCancelBkg}
                            colorCls="text-amber-500 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/40 dark:hover:text-amber-300"
                            onClick={e => requestAction(b, 'cancel', e)}
                          />
                        )}
                        {/* Delete */}
                        <ActionBtn
                          icon={faTrash}
                          title={t.btnDelete}
                          colorCls="text-rose-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/40 dark:hover:text-rose-300"
                          onClick={e => requestAction(b, 'delete', e)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <BookingModal
          booking={selected}
          bookings={bookings}
          initialEditing={openInEditMode}
          onClose={closeModal}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}
