import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faPhone, faEnvelope, faUserGroup, faCoins, faTag, faNoteSticky, faHouse,
} from '@fortawesome/free-solid-svg-icons';
import { saveBooking } from '../services/storage';
import DateRangePicker from './DateRangePicker';
import { useLanguage } from '../context/LanguageContext';
import { useApartment } from '../context/ApartmentContext';

const EMPTY = {
  name: '', phone: '', email: '', persons: 2,
  checkin: '', checkout: '', amount: '', nightRate: '',
  status: 'pending', source: 'Директна', notes: '', apartment_id: null,
};

function Field({ label, error, icon, children, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      {label && <label className="block text-xs font-semibold text-app-2 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none"
          />
        )}
        {children}
      </div>
      {error && <span className="text-xs text-rose-500 mt-1 block">{error}</span>}
    </div>
  );
}

export default function BookingForm({ bookings, onRefresh, onNavigate, initial = null, onSave = null }) {
  const { t } = useLanguage();
  const { apartments, currentId } = useApartment();

  const [form, setForm] = useState(
    initial
      ? { ...EMPTY, ...initial }
      : { ...EMPTY, apartment_id: currentId !== 'all' ? currentId : null }
  );
  const [errors, setErrors] = useState({});

  const nightCount = form.checkin && form.checkout
    ? Math.max(0, (new Date(form.checkout) - new Date(form.checkin)) / 86400000)
    : 0;

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      const ni = field === 'checkin'   ? value : next.checkin;
      const no = field === 'checkout'  ? value : next.checkout;
      const nr = field === 'nightRate' ? value : next.nightRate;
      if (nr && ni && no) {
        const n = Math.max(0, (new Date(no) - new Date(ni)) / 86400000);
        next.amount = n > 0 ? String(Math.round(n * Number(nr))) : next.amount;
      }
      return next;
    });
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t.errRequired;
    if (!form.checkin)     e.checkin = t.errRequired;
    if (!form.checkout)    e.checkout = t.errRequired;
    if (form.checkin && form.checkout && form.checkout <= form.checkin) e.checkout = t.errCheckout;
    if (!form.amount || Number(form.amount) <= 0) e.amount = t.errAmount;
    return e;
  }

  function checkConflict() {
    if (!form.checkin || !form.checkout) return null;
    return bookings.find(b => b.status !== 'cancelled' && form.checkin < b.checkout && form.checkout > b.checkin);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const conflict = checkConflict();
    if (conflict) {
      alert(t.conflictMsg(conflict.name, conflict.checkin, conflict.checkout));
      return;
    }
    // eslint-disable-next-line no-unused-vars
    const { nightRate, ...formData } = form;
    await saveBooking({
      id: initial ? initial.id : crypto.randomUUID(),
      ...formData,
      persons:      Number(formData.persons),
      amount:       Number(formData.amount),
      apartment_id: formData.apartment_id || null,
    });
    await onRefresh();
    if (onSave) { onSave(); return; }
    setForm({ ...EMPTY, apartment_id: currentId !== 'all' ? currentId : null });
    setErrors({});
    if (onNavigate) onNavigate('calendar');
  }

  const inputCls = (err) => `input pl-10 ${err ? 'input-error' : ''}`;

  return (
    <div className="card max-w-2xl mx-auto p-5 md:p-8">
      <h2 className="text-xl font-bold mb-6 tracking-tight">{t.newBookingTitle}</h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-7">

        {/* Section 1: Guest */}
        <Section label={t.secGuest}>
          <Field label={t.fldName} error={errors.name} icon={faUser}>
            <input
              className={inputCls(errors.name)} type="text" value={form.name}
              onChange={e => set('name', e.target.value)} placeholder={t.phName}
            />
          </Field>
          <Field label={t.fldPersons} icon={faUserGroup}>
            <input
              className="input pl-10" type="number" min="1" value={form.persons}
              onChange={e => set('persons', e.target.value)}
            />
          </Field>
          <Field label={t.fldPhone} icon={faPhone}>
            <input
              className="input pl-10" type="tel" value={form.phone}
              onChange={e => set('phone', e.target.value)} placeholder={t.phPhone}
            />
          </Field>
          <Field label={t.fldEmail} icon={faEnvelope}>
            <input
              className="input pl-10" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="example@mail.com"
            />
          </Field>
        </Section>

        {/* Section 2: Stay */}
        <Section label={t.secStay} cols={1}>
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
        </Section>

        {/* Section 3: Payment */}
        <Section label={t.secPayment}>
          <Field label={t.fldNightRate} icon={faCoins}>
            <input
              className="input pl-10" type="number" min="0" step="1" value={form.nightRate}
              onChange={e => set('nightRate', e.target.value)} placeholder={t.phNightRate}
            />
          </Field>
          <Field label={t.fldAmount} error={errors.amount} icon={faCoins}>
            <input
              className={inputCls(errors.amount)} type="number" min="0" step="0.01" value={form.amount}
              onChange={e => set('amount', e.target.value)} placeholder={t.phAmount}
            />
          </Field>
          {nightCount > 0 && form.nightRate && Number(form.nightRate) > 0 && (
            <div className="col-span-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 text-xs font-semibold py-2 px-3 rounded-lg">
              {t.calcNights(nightCount, Number(form.nightRate), nightCount * Number(form.nightRate))}
            </div>
          )}
          <Field label={t.fldStatus} full>
            <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="pending">{t.optPending}</option>
              <option value="paid">{t.optPaid}</option>
            </select>
          </Field>
          <Field label={t.fldPlatform} icon={faTag} full>
            <select className="input pl-10" value={form.source} onChange={e => set('source', e.target.value)}>
              <option value="Директна">{t.optDirect}</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Друго">{t.optOther}</option>
            </select>
          </Field>
        </Section>

        {/* Section 4: Apartment (only if user has apartments) */}
        {apartments.length > 0 && (
          <Section label={t.fldApartment} cols={1}>
            <Field icon={faHouse}>
              <select
                className="input pl-10"
                value={form.apartment_id || ''}
                onChange={e => set('apartment_id', e.target.value || null)}
              >
                <option value="">{t.aptNone}</option>
                {apartments.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
          </Section>
        )}

        {/* Section 5: Notes */}
        <Section label={t.secNotes} cols={1}>
          <Field icon={faNoteSticky}>
            <textarea
              className="input pl-10 resize-y min-h-[80px] py-2.5"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder={t.phNotes}
              rows={3}
            />
          </Field>
        </Section>

        <button type="submit" className="btn-primary w-full py-3 text-base">
          {t.btnSave}
        </button>
      </form>
    </div>
  );
}

function Section({ label, cols = 2, children }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-app-3 mb-3">{label}</div>
      <div className={`grid gap-3 ${cols === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {children}
      </div>
    </div>
  );
}
