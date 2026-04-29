import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faChevronDown, faCheck, faHouse } from '@fortawesome/free-solid-svg-icons';
import Tabs from './components/Tabs';
import Calendar from './components/Calendar';
import BookingList from './components/BookingList';
import BookingForm from './components/BookingForm';
import Revenue from './components/Revenue';
import { getBookings, seedData } from './services/storage';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

/* ─── Theme toggle ─────────────────────────────────────────────── */
function ThemePicker() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 border border-white/20 transition-colors"
      onClick={() => setDark(d => !d)}
      aria-label="Toggle theme"
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <FontAwesomeIcon icon={dark ? faSun : faMoon} className="text-white text-sm" />
    </button>
  );
}

/* ─── Language picker ──────────────────────────────────────────── */
const LANGS = [
  { code: 'bg', flag: '🇧🇬', label: 'Български' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

function LangPicker() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  function pick(code) {
    localStorage.setItem('lang', code);
    setLang(code);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold tracking-wider transition-colors"
      >
        {lang.toUpperCase()}
        <FontAwesomeIcon icon={faChevronDown} className="text-[10px] opacity-70" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 min-w-[180px] surface border border-app rounded-xl shadow-pop overflow-hidden z-50 animate-pop-in">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => pick(l.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:surface-2 ${
                lang === l.code ? 'text-primary-500 font-semibold' : 'text-app-2'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="flex-1">{l.label}</span>
              <span className="text-[11px] font-bold tracking-wider text-app-3">{l.code.toUpperCase()}</span>
              {lang === l.code && <FontAwesomeIcon icon={faCheck} className="text-primary-500 text-xs" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── App shell ─────────────────────────────────────────────────── */
function AppInner() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const { t } = useLanguage();

  const refresh = useCallback(() => setBookings(getBookings()), []);

  useEffect(() => {
    seedData();
    setTimeout(() => { refresh(); setLoading(false); }, 250);
  }, [refresh]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — single row on desktop with tabs inline */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary-500 to-primary-700 shadow-lg">
        <div className="px-4 md:px-6 h-14 flex items-center gap-3 md:gap-5">
          {/* Logo + title (left) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <FontAwesomeIcon icon={faHouse} className="text-white text-base" />
            <h1 className="text-white font-bold text-sm tracking-tight whitespace-nowrap hidden sm:block">
              {t.appTitle}
            </h1>
          </div>

          {/* Tabs — centered in remaining space (desktop only) */}
          <div className="flex-1 flex justify-center">
            <Tabs active={activeTab} onChange={setActiveTab} />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemePicker />
            <LangPicker />
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 md:px-6 py-4 md:py-6 max-w-6xl mx-auto w-full pb-24 md:pb-6">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <div className={activeTab === 'calendar' ? 'animate-fade-in' : 'hidden'}>
              <Calendar bookings={bookings} onRefresh={refresh} />
            </div>
            <div className={activeTab === 'bookings' ? 'animate-fade-in' : 'hidden'}>
              <BookingList bookings={bookings} onRefresh={refresh} />
            </div>
            <div className={activeTab === 'new' ? 'animate-fade-in' : 'hidden'}>
              <BookingForm bookings={bookings} onRefresh={refresh} onNavigate={setActiveTab} />
            </div>
            <div className={activeTab === 'revenue' ? 'animate-fade-in' : 'hidden'}>
              <Revenue bookings={bookings} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-16" />
      <div className="skeleton h-64" />
      <div className="skeleton h-32" />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
