import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPenToSquare, faCheck, faBan, faTrash, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { saveBooking, deleteBooking } from '../services/storage';
import { useLanguage, fmtEur } from '../context/LanguageContext';
import BookingForm from './BookingForm';

function nights(checkin, checkout) {
  return dayjs(checkout).diff(dayjs(checkin), 'day');
}

const STATUS_CLASS = {
  paid:      'badge badge-paid',
  pending:   'badge badge-pending',
  partial:   'badge badge-partial',
  cancelled: 'badge badge-cancelled',
};

/* ─── Confirm banner shared by both mobile actions & desktop (if ever needed) ── */
function ConfirmBanner({ action, bookingName, t, onConfirm, onDismiss, saving = false }) {
  const meta = {
    paid:   { msg: t.confirmPaidMsg,   cls: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', iconCls: 'text-emerald-500', btnCls: 'bg-emerald-500 hover:bg-emerald-600' },
    cancel: { msg: t.confirmCancelMsg, cls: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',         iconCls: 'text-amber-500',   btnCls: 'bg-amber-500 hover:bg-amber-600' },
    delete: { msg: t.confirmDel(bookingName), cls: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',     iconCls: 'text-rose-500',    btnCls: 'bg-rose-500 hover:bg-rose-600' },
  }[action];

  return (
    <div className={`rounded-xl p-3 flex items-start gap-3 border animate-fade-in ${meta.cls}`}>
      <FontAwesomeIcon icon={faTriangleExclamation} className={`mt-0.5 text-sm flex-shrink-0 ${meta.iconCls}`} />
      <span className="text-sm font-medium text-app flex-1 leading-snug">{meta.msg}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onConfirm}
          disabled={saving}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-1.5 ${meta.btnCls} ${saving ? 'opacity-70 cursor-wait' : ''}`}
        >
          {saving && <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {t.btnConfirm}
        </button>
        <button
          onClick={onDismiss}
          disabled={saving}
          className="w-8 h-8 rounded-lg surface border border-app flex items-center justify-center text-app-3 hover:text-app disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default function BookingModal({ booking, bookings = [], onClose, onRefresh, initialEditing = false }) {
  const { t } = useLanguage();
  const [editing, setEditing]             = useState(initialEditing);
  const [confirmAction, setConfirmAction] = useState(null); // 'paid' | 'cancel' | 'delete'
  const [saving, setSaving]               = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Reset confirm when booking changes
  useEffect(() => { setConfirmAction(null); }, [booking?.id]);

  if (!booking) return null;

  async function executeConfirm() {
    if (saving) return;
    setSaving(true);
    try {
      if (confirmAction === 'paid')   { await saveBooking({ ...booking, status: 'paid' });      await onRefresh(); onClose(); }
      if (confirmAction === 'cancel') { await saveBooking({ ...booking, status: 'cancelled' }); await onRefresh(); onClose(); }
      if (confirmAction === 'delete') { await deleteBooking(booking.id);                        await onRefresh(); onClose(); }
    } finally {
      setSaving(false);
    }
  }

  async function handleSaved() { await onRefresh(); onClose(); }
  function handleOverlay(e) { if (e.target === e.currentTarget) onClose(); }

  const n = nights(booking.checkin, booking.checkout);
  const isPending   = booking.status === 'pending' || booking.status === 'partial';
  const isActive    = booking.status === 'paid' || booking.status === 'pending' || booking.status === 'partial';
  const isCancelled = booking.status === 'cancelled';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={handleOverlay}
    >
      <div className={`surface w-full ${editing ? 'max-w-2xl' : 'max-w-lg'} rounded-t-3xl md:rounded-3xl shadow-pop overflow-hidden md:animate-slide-up animate-sheet-in max-h-[90vh] flex flex-col`}>

        {editing ? (
          /* ── Edit mode ─────────────────────────────────────────── */
          <>
            <ModalHeader name={t.editTitle} initial={booking.name.charAt(0)} onClose={() => setEditing(false)} />
            <div className="overflow-y-auto">
              <BookingForm
                initial={booking}
                bookings={bookings.filter(b => b.id !== booking.id)}
                onRefresh={onRefresh}
                onSave={handleSaved}
              />
            </div>
          </>
        ) : (
          /* ── View mode ─────────────────────────────────────────── */
          <>
            <ModalHeader name={booking.name} initial={booking.name.charAt(0)} status={booking.status} onClose={onClose} />

            {/* Details */}
            <div className="overflow-y-auto p-5 md:p-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Row label={t.lblPhone}    value={booking.phone || '—'} />
                <Row label={t.lblEmail}    value={booking.email || '—'} />
                <Row label={t.lblCheckin}  value={dayjs(booking.checkin).format('DD.MM.YYYY')} />
                <Row label={t.lblCheckout} value={dayjs(booking.checkout).format('DD.MM.YYYY')} />
                <Row label={t.lblNights}   value={n} />
                <Row label={t.lblPersons}  value={booking.persons} />
                <Row label={t.lblAmount}   value={fmtEur(booking.amount)} highlight />
                {booking.status === 'partial' && booking.paid_amount != null && (
                  <>
                    <Row label={t.lblPaidAmount} value={fmtEur(booking.paid_amount)} valueColor="text-orange-500" />
                    <Row label={t.lblRemaining}  value={fmtEur(booking.amount - booking.paid_amount)} valueColor="text-amber-500" />
                  </>
                )}
                <Row label={t.lblSource}   value={t.sources[booking.source] || booking.source} />
              </div>
              {booking.notes && (
                <div className="mt-5 pt-5 border-t border-app">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-app-3 mb-1.5">{t.lblNotes}</div>
                  <p className="text-sm text-app-2 leading-relaxed">{booking.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-app p-3 md:p-4 surface-2 space-y-2.5">

              {/* Confirm banner — shown for any triggered action */}
              {confirmAction && (
                <ConfirmBanner
                  action={confirmAction}
                  bookingName={booking.name}
                  t={t}
                  saving={saving}
                  onConfirm={executeConfirm}
                  onDismiss={() => setConfirmAction(null)}
                />
              )}

              {/* ── Action buttons: mobile/tablet only (md:hidden) ── */}
              {!confirmAction && (
                <div className="md:hidden grid grid-cols-2 gap-2">
                  {/* Edit — always, full width */}
                  <button className="btn-secondary col-span-2" onClick={() => setEditing(true)}>
                    <FontAwesomeIcon icon={faPenToSquare} />
                    {t.btnEdit}
                  </button>

                  {/* Mark Paid — pending only */}
                  {isPending && (
                    <button className="btn-primary" onClick={() => setConfirmAction('paid')}>
                      <FontAwesomeIcon icon={faCheck} />
                      {t.btnMarkPaid}
                    </button>
                  )}

                  {/* Cancel — paid or pending */}
                  {isActive && (
                    <button className="btn-warning" onClick={() => setConfirmAction('cancel')}>
                      <FontAwesomeIcon icon={faBan} />
                      {t.btnCancelBkg}
                    </button>
                  )}

                  {/* Delete — always; full width when cancelled (no siblings) */}
                  <button
                    className={`btn-danger ${isCancelled ? 'col-span-2' : ''}`}
                    onClick={() => setConfirmAction('delete')}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    {t.btnDelete}
                  </button>
                </div>
              )}

              {/* Close — always visible */}
              <div className="flex justify-end">
                <button className="btn-ghost" onClick={onClose}>{t.btnClose}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ModalHeader({ name, initial, status, onClose }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-3 p-4 md:p-5 border-b border-app">
      <div className="avatar avatar-direct w-11 h-11 text-base">{initial.toUpperCase()}</div>
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-base text-app truncate">{name}</h2>
        {status && <span className={`mt-1 ${STATUS_CLASS[status]}`}>{t.statusLong[status]}</span>}
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg hover:surface-2 flex items-center justify-center text-app-3 hover:text-app"
      >
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}

function Row({ label, value, highlight, valueColor }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-app-3 mb-1">{label}</div>
      <div className={`text-sm break-words ${highlight ? 'font-bold text-base text-primary-500' : valueColor || 'text-app'}`}>
        {value}
      </div>
    </div>
  );
}
