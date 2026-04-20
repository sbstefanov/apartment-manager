import React from 'react';
import dayjs from 'dayjs';
import { saveBooking, deleteBooking } from '../services/storage';
import { useLanguage, fmtEur } from '../context/LanguageContext';

function nights(checkin, checkout) {
  return dayjs(checkout).diff(dayjs(checkin), 'day');
}

const STATUS_CLASS = {
  paid:      'badge badge--paid',
  pending:   'badge badge--pending',
  cancelled: 'badge badge--cancelled',
};

export default function BookingModal({ booking, onClose, onRefresh }) {
  const { t } = useLanguage();
  if (!booking) return null;

  function handleMarkPaid() {
    saveBooking({ ...booking, status: 'paid' });
    onRefresh(); onClose();
  }
  function handleCancel() {
    saveBooking({ ...booking, status: 'cancelled' });
    onRefresh(); onClose();
  }
  function handleDelete() {
    if (window.confirm(t.confirmDel(booking.name))) {
      deleteBooking(booking.id);
      onRefresh(); onClose();
    }
  }
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const n = nights(booking.checkin, booking.checkout);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-avatar">{booking.name.charAt(0)}</div>
          <div>
            <h2 className="modal-name">{booking.name}</h2>
            <span className={STATUS_CLASS[booking.status]}>{t.statusLong[booking.status]}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-grid">
            <div className="modal-field">
              <span className="modal-label">{t.lblPhone}</span>
              <span className="modal-value">{booking.phone || '—'}</span>
            </div>
            <div className="modal-field">
              <span className="modal-label">{t.lblEmail}</span>
              <span className="modal-value">{booking.email || '—'}</span>
            </div>
            <div className="modal-field">
              <span className="modal-label">{t.lblCheckin}</span>
              <span className="modal-value">{dayjs(booking.checkin).format('DD.MM.YYYY')}</span>
            </div>
            <div className="modal-field">
              <span className="modal-label">{t.lblCheckout}</span>
              <span className="modal-value">{dayjs(booking.checkout).format('DD.MM.YYYY')}</span>
            </div>
            <div className="modal-field">
              <span className="modal-label">{t.lblNights}</span>
              <span className="modal-value">{n}</span>
            </div>
            <div className="modal-field">
              <span className="modal-label">{t.lblPersons}</span>
              <span className="modal-value">{booking.persons}</span>
            </div>
            <div className="modal-field">
              <span className="modal-label">{t.lblAmount}</span>
              <span className="modal-value modal-amount">{fmtEur(booking.amount)}</span>
            </div>
            <div className="modal-field">
              <span className="modal-label">{t.lblSource}</span>
              <span className="modal-value">{t.sources[booking.source] || booking.source}</span>
            </div>
          </div>

          {booking.notes && (
            <div className="modal-notes">
              <span className="modal-label">{t.lblNotes}</span>
              <p className="modal-notes-text">{booking.notes}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {booking.status === 'pending' && (
            <button className="btn btn--primary" onClick={handleMarkPaid}>{t.btnMarkPaid}</button>
          )}
          {(booking.status === 'paid' || booking.status === 'pending') && (
            <button className="btn btn--warning" onClick={handleCancel}>{t.btnCancelBkg}</button>
          )}
          <button className="btn btn--danger" onClick={handleDelete}>{t.btnDelete}</button>
          <button className="btn btn--ghost" onClick={onClose}>{t.btnClose}</button>
        </div>
      </div>
    </div>
  );
}
