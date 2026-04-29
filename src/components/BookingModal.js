import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPenToSquare, faCheck, faBan, faTrash } from '@fortawesome/free-solid-svg-icons';
import { saveBooking, deleteBooking, getBookings } from '../services/storage';
import { useLanguage, fmtEur } from '../context/LanguageContext';
import BookingForm from './BookingForm';

function nights(checkin, checkout) {
  return dayjs(checkout).diff(dayjs(checkin), 'day');
}

const STATUS_CLASS = { paid: 'badge badge-paid', pending: 'badge badge-pending', cancelled: 'badge badge-cancelled' };

export default function BookingModal({ booking, onClose, onRefresh }) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!booking) return null;

  function handleMarkPaid() { saveBooking({ ...booking, status: 'paid' }); onRefresh(); onClose(); }
  function handleCancel()   { saveBooking({ ...booking, status: 'cancelled' }); onRefresh(); onClose(); }
  function handleDelete() {
    if (window.confirm(t.confirmDel(booking.name))) {
      deleteBooking(booking.id); onRefresh(); onClose();
    }
  }
  function handleSaved() { onRefresh(); onClose(); }
  function handleOverlay(e) { if (e.target === e.currentTarget) onClose(); }

  const n = nights(booking.checkin, booking.checkout);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={handleOverlay}
    >
      <div className={`surface w-full ${editing ? 'max-w-2xl' : 'max-w-lg'} rounded-t-3xl md:rounded-3xl shadow-pop overflow-hidden md:animate-slide-up animate-sheet-in max-h-[90vh] flex flex-col`}>

        {editing ? (
          <>
            <ModalHeader name={t.editTitle} initial={booking.name.charAt(0)} onClose={() => setEditing(false)} />
            <div className="overflow-y-auto">
              <BookingForm
                initial={booking}
                bookings={getBookings().filter(b => b.id !== booking.id)}
                onRefresh={onRefresh}
                onSave={handleSaved}
              />
            </div>
          </>
        ) : (
          <>
            <ModalHeader name={booking.name} initial={booking.name.charAt(0)} status={booking.status} onClose={onClose} />

            <div className="overflow-y-auto p-5 md:p-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <Row label={t.lblPhone}    value={booking.phone || '—'} />
                <Row label={t.lblEmail}    value={booking.email || '—'} />
                <Row label={t.lblCheckin}  value={dayjs(booking.checkin).format('DD.MM.YYYY')} />
                <Row label={t.lblCheckout} value={dayjs(booking.checkout).format('DD.MM.YYYY')} />
                <Row label={t.lblNights}   value={n} />
                <Row label={t.lblPersons}  value={booking.persons} />
                <Row label={t.lblAmount}   value={fmtEur(booking.amount)} highlight />
                <Row label={t.lblSource}   value={t.sources[booking.source] || booking.source} />
              </div>

              {booking.notes && (
                <div className="mt-5 pt-5 border-t border-app">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-app-3 mb-1.5">{t.lblNotes}</div>
                  <p className="text-sm text-app-2 leading-relaxed">{booking.notes}</p>
                </div>
              )}
            </div>

            <div className="border-t border-app p-3 md:p-4 flex flex-wrap gap-2 surface-2">
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                <FontAwesomeIcon icon={faPenToSquare} />
                {t.btnEdit}
              </button>
              {booking.status === 'pending' && (
                <button className="btn-primary" onClick={handleMarkPaid}>
                  <FontAwesomeIcon icon={faCheck} />
                  {t.btnMarkPaid}
                </button>
              )}
              {(booking.status === 'paid' || booking.status === 'pending') && (
                <button className="btn-warning" onClick={handleCancel}>
                  <FontAwesomeIcon icon={faBan} />
                  {t.btnCancelBkg}
                </button>
              )}
              <button className="btn-danger" onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} />
                {t.btnDelete}
              </button>
              <button className="btn-ghost ml-auto" onClick={onClose}>{t.btnClose}</button>
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
      <button onClick={onClose} className="w-8 h-8 rounded-lg hover:surface-2 flex items-center justify-center text-app-3 hover:text-app">
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-app-3 mb-1">{label}</div>
      <div className={`text-sm break-words ${highlight ? 'font-bold text-base text-primary-500' : 'text-app'}`}>{value}</div>
    </div>
  );
}
