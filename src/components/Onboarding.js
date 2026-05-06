import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLocationDot, faPlus, faCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { saveApartment } from '../services/storage';
import { useLanguage } from '../context/LanguageContext';
import { useApartment } from '../context/ApartmentContext';

export default function Onboarding() {
  const { t } = useLanguage();
  const { refresh, select } = useApartment();

  const [added, setAdded]     = useState([]);   // запазени имоти в тази сесия
  const [name, setName]       = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving]   = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [nameErr, setNameErr] = useState('');
  const [showForm, setShowForm] = useState(true);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) { setNameErr(t.errRequired); return; }

    setSaving(true);
    try {
      const apt = {
        id:      crypto.randomUUID(),
        name:    name.trim(),
        address: address.trim() || null,
        notes:   null,
      };
      await saveApartment(apt);
      if (added.length === 0) select(apt.id); // първият имот се селектира автоматично
      setAdded(prev => [...prev, apt]);
      setName('');
      setAddress('');
      setNameErr('');
      setShowForm(false);   // скрива формата след добавяне
    } catch {
      setNameErr('Грешка при запазване. Опитай отново.');
    } finally {
      setSaving(false);
    }
  }

  async function handleContinue() {
    setFinishing(true);
    await refresh();
    // ApartmentContext ще обнови → App.js ще премине към главното приложение
  }

return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="flex flex-col items-center mb-2 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center mb-5 shadow-pop">
            <FontAwesomeIcon icon={faHouse} className="text-white text-3xl" />
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">{t.onboardTitle}</h1>
          <p className="text-white/75 text-base mt-2 max-w-xs leading-relaxed">
            {t.onboardSubtitle}
          </p>
        </div>

        {/* Добавени имоти */}
        {added.length > 0 && (
          <div className="surface rounded-2xl shadow-pop overflow-hidden">
            <div className="px-4 py-3 border-b border-app">
              <span className="text-xs font-bold uppercase tracking-wider text-app-3">
                {t.onboardAdded} ({added.length})
              </span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {added.map(apt => (
                <div key={apt.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faHouse} className="text-primary-500 text-xs" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-app truncate">{apt.name}</div>
                    {apt.address && (
                      <div className="text-xs text-app-3 truncate">{apt.address}</div>
                    )}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-500 text-[9px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Форма за добавяне */}
        {showForm ? (
          <div className="surface rounded-2xl shadow-pop p-6">
            <form onSubmit={handleAdd} noValidate className="space-y-4">

              {/* Име */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-app-3 mb-2">
                  {t.onboardName}
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faHouse}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none"
                  />
                  <input
                    type="text"
                    className={`input pl-10 ${nameErr ? 'input-error' : ''}`}
                    placeholder={t.aptNamePh}
                    value={name}
                    onChange={e => { setName(e.target.value); setNameErr(''); }}
                    autoFocus
                  />
                </div>
                {nameErr && <span className="text-xs text-rose-500 mt-1 block">{nameErr}</span>}
              </div>

              {/* Адрес */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-app-3 mb-2">
                  {t.onboardAddress}
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none"
                  />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder={t.aptAddressPh}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 py-3 text-base font-bold"
                >
                  {saving ? '...' : t.onboardBtn}
                </button>
                {added.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary px-4"
                  >
                    {t.btnClose}
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* Бутони след добавяне */
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-white/40 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              {t.onboardAddMore}
            </button>
            <button
              onClick={handleContinue}
              disabled={finishing}
              className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
            >
              {finishing ? '...' : (
                <>
                  {t.onboardContinue}
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
