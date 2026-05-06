import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faLocationDot, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { saveApartment } from '../services/storage';
import { useLanguage } from '../context/LanguageContext';
import { useApartment } from '../context/ApartmentContext';

export default function Onboarding() {
  const { t } = useLanguage();
  const { refresh } = useApartment();

  const [name, setName]       = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving]   = useState(false);
  const [nameErr, setNameErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setNameErr(t.errRequired); return; }

    setSaving(true);
    try {
      await saveApartment({
        id:      crypto.randomUUID(),
        name:    name.trim(),
        address: address.trim() || null,
        notes:   null,
      });
      await refresh();
      // ApartmentContext will update apartments → App.js re-renders to main app
    } catch {
      setNameErr('Грешка при запазване. Опитай отново.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center mb-5 shadow-pop">
            <FontAwesomeIcon icon={faHouse} className="text-white text-3xl" />
          </div>
          <h1 className="text-white text-3xl font-bold tracking-tight">{t.onboardTitle}</h1>
          <p className="text-white/75 text-base mt-2 max-w-xs leading-relaxed">
            {t.onboardSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="surface rounded-2xl shadow-pop p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name */}
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
              {nameErr && (
                <span className="text-xs text-rose-500 mt-1 block">{nameErr}</span>
              )}
            </div>

            {/* Address */}
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

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2 mt-2"
            >
              {saving ? (
                <span>...</span>
              ) : (
                <>
                  {t.onboardBtn}
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
