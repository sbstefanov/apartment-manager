import React, { useState } from 'react';
import { saveBooking } from '../services/storage';
import DateRangePicker from './DateRangePicker';
import { useLanguage } from '../context/LanguageContext';

const EMPTY = {
  name: '', phone: '', email: '', persons: 2,
  checkin: '', checkout: '', amount: '',
  status: 'pending', source: 'Директна', notes: '',
};

/* ── SVG field icons ── */
const Icon = ({ path, children }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const PersonIcon = () => (
  <Icon>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);
const PhoneIcon = () => (
  <Icon>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.39 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16l.92.92z" />
  </Icon>
);
const MailIcon = () => (
  <Icon>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Icon>
);
const UsersIcon = () => (
  <Icon>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);
const CoinIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Icon>
);
const TagIcon = () => (
  <Icon>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </Icon>
);
const NoteIcon = () => (
  <Icon>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </Icon>
);

/** Reusable field with optional icon wrapper */
function Field({ label, error, icon, children, textarea }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {icon ? (
        <div className={`input-icon-wrap${textarea ? ' input-icon-wrap--textarea' : ''}`}>
          <span className="field-icon">{icon}</span>
          {children}
        </div>
      ) : children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default function BookingForm({ bookings, onRefresh, onNavigate }) {
  const { t } = useLanguage();
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t.errRequired;
    if (!form.checkin)     e.checkin = t.errRequired;
    if (!form.checkout)    e.checkout = t.errRequired;
    if (form.checkin && form.checkout && form.checkout <= form.checkin)
      e.checkout = t.errCheckout;
    if (!form.amount || Number(form.amount) <= 0) e.amount = t.errAmount;
    return e;
  }

  function checkConflict() {
    if (!form.checkin || !form.checkout) return null;
    return bookings.find(
      (b) => b.status !== 'cancelled' && form.checkin < b.checkout && form.checkout > b.checkin
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const conflict = checkConflict();
    if (conflict) {
      alert(t.conflictMsg(conflict.name, conflict.checkin, conflict.checkout));
      return;
    }

    saveBooking({
      id: crypto.randomUUID(),
      ...form,
      persons: Number(form.persons),
      amount:  Number(form.amount),
      createdAt: new Date().toISOString(),
    });

    onRefresh();
    setForm(EMPTY);
    setErrors({});
    if (onNavigate) onNavigate('calendar');
  }

  return (
    <div className="booking-form-wrap">
      <h2 className="form-title">{t.newBookingTitle}</h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* ── Section 1: Guest ── */}
        <div className="form-section">
          <span className="form-section-label">{t.secGuest}</span>
          <div className="form-row">
            <Field label={t.fldName} error={errors.name} icon={<PersonIcon />}>
              <input
                className={`form-input${errors.name ? ' form-input--error' : ''}`}
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={t.phName}
              />
            </Field>
            <Field label={t.fldPersons} icon={<UsersIcon />}>
              <input
                className="form-input"
                type="number"
                min="1"
                value={form.persons}
                onChange={(e) => set('persons', e.target.value)}
              />
            </Field>
          </div>
          <div className="form-row">
            <Field label={t.fldPhone} icon={<PhoneIcon />}>
              <input
                className="form-input"
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder={t.phPhone}
              />
            </Field>
            <Field label={t.fldEmail} icon={<MailIcon />}>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="example@mail.com"
              />
            </Field>
          </div>
        </div>

        {/* ── Section 2: Stay ── */}
        <div className="form-section">
          <span className="form-section-label">{t.secStay}</span>
          <DateRangePicker
            checkin={form.checkin}
            checkout={form.checkout}
            onChange={(ci, co) => {
              set('checkin', ci);
              setErrors(e => ({ ...e, checkin: undefined, checkout: undefined }));
              set('checkout', co);
            }}
            bookedRanges={bookings.filter(b => b.status !== 'cancelled')}
            errorCheckin={errors.checkin}
            errorCheckout={errors.checkout}
          />
        </div>

        {/* ── Section 3: Payment ── */}
        <div className="form-section">
          <span className="form-section-label">{t.secPayment}</span>
          <div className="form-row">
            <Field label={t.fldAmount} error={errors.amount} icon={<CoinIcon />}>
              <input
                className={`form-input${errors.amount ? ' form-input--error' : ''}`}
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                placeholder={t.phAmount}
              />
            </Field>
            <Field label={t.fldStatus}>
              <select className="form-input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="pending">{t.optPending}</option>
                <option value="paid">{t.optPaid}</option>
              </select>
            </Field>
          </div>
          <Field label={t.fldPlatform} icon={<TagIcon />}>
            <select className="form-input" value={form.source} onChange={(e) => set('source', e.target.value)}>
              <option value="Директна">{t.optDirect}</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Друго">{t.optOther}</option>
            </select>
          </Field>
        </div>

        {/* ── Section 4: Notes ── */}
        <div className="form-section">
          <span className="form-section-label">{t.secNotes}</span>
          <Field icon={<NoteIcon />} textarea>
            <textarea
              className="form-input form-textarea"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder={t.phNotes}
              rows={3}
            />
          </Field>
        </div>

        <button type="submit" className="btn btn--primary btn--full">
          {t.btnSave}
        </button>
      </form>
    </div>
  );
}
