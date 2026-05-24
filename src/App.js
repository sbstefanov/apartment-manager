import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun, faMoon, faChevronDown, faCheck, faHouse,
  faArrowRightFromBracket, faGear,
} from '@fortawesome/free-solid-svg-icons';
import Tabs from './components/Tabs';
import Calendar from './components/Calendar';
import BookingList from './components/BookingList';
import BookingForm from './components/BookingForm';
import Revenue from './components/Revenue';
import Expenses from './components/Expenses';
import AuthForm, { ResetPasswordScreen } from './components/AuthForm';
import ApartmentManager from './components/ApartmentManager';
import Onboarding from './components/Onboarding';
import { getBookings, getExpenses } from './services/storage';
import { supabase } from './lib/supabase';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ApartmentProvider, useApartment } from './context/ApartmentContext';

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
    localStorage.setItem('lang-set', '1');
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

/* ─── User menu ─────────────────────────────────────────────────── */
function UserMenu({ user, onLogout, onManageApts }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { apartments, currentId, select } = useApartment();

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const firstName   = user?.user_metadata?.first_name || '';
  const lastName    = user?.user_metadata?.last_name  || '';
  const fullName    = [firstName, lastName].filter(Boolean).join(' ') || user?.email?.split('@')[0] || '—';
  const email       = user?.email || '';
  const letter      = firstName ? firstName[0].toUpperCase() : (email[0]?.toUpperCase() ?? '?');
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('bg-BG', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button — показва буква + текущ имот */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full border text-white select-none flex-shrink-0 transition-all ${
          open ? 'bg-white/40 border-white/60' : 'bg-white/25 border-white/30 hover:bg-white/35'
        }`}
      >
        <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">{letter}</span>
        {apartments.length > 0 && (
          <span className="text-[11px] font-semibold opacity-90 max-w-[80px] truncate hidden sm:block">
            {currentId === 'all'
              ? 'Всички'
              : (apartments.find(a => a.id === currentId)?.name ?? 'Всички')}
          </span>
        )}
        <FontAwesomeIcon icon={faChevronDown} className={`text-[9px] opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 animate-pop-in">
          <div className="surface border border-app rounded-2xl shadow-pop overflow-hidden">

            {/* Header gradient */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-5 py-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/25 border-2 border-white/40 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {letter}
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold text-base leading-tight truncate">{fullName}</div>
                <div className="text-white/70 text-xs mt-0.5 truncate">{email}</div>
                {memberSince && (
                  <div className="text-white/50 text-[11px] mt-1">Член от {memberSince}</div>
                )}
              </div>
            </div>

            {/* Apartments section — само на desktop */}
            <div className="hidden md:block border-b border-app">
              <div className="px-4 pt-3 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-app-3 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faHouse} className="text-[10px]" />
                  Имоти ({apartments.length})
                </span>
              </div>

              {apartments.length === 0 ? (
                <div className="px-4 pb-3 text-xs text-app-3">Няма добавени имоти</div>
              ) : (
                <div className="px-3 pb-2 space-y-0.5">
                  {/* Всички */}
                  <button
                    onClick={() => { select('all'); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      currentId === 'all'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                        : 'hover:surface-2 text-app-2'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faHouse} className="text-primary-400 text-[9px]" />
                    </span>
                    <span className="flex-1 text-left">Всички имоти</span>
                    {currentId === 'all' && <FontAwesomeIcon icon={faCheck} className="text-primary-500 text-[10px]" />}
                  </button>
                  {/* Индивидуални */}
                  {apartments.map(apt => (
                    <button
                      key={apt.id}
                      onClick={() => { select(apt.id); setOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        currentId === apt.id
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                          : 'hover:surface-2 text-app-2'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faHouse} className="text-primary-400 text-[9px]" />
                      </span>
                      <div className="flex-1 text-left min-w-0">
                        <div className="truncate">{apt.name}</div>
                        {apt.address && <div className="text-[10px] text-app-3 font-normal truncate">{apt.address}</div>}
                      </div>
                      {currentId === apt.id && <FontAwesomeIcon icon={faCheck} className="text-primary-500 text-[10px]" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Управление — голям, ясен бутон, отделен визуално */}
              <div className="px-3 pb-3 pt-1 border-t border-app mt-1">
                <button
                  onClick={() => { setOpen(false); onManageApts(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-app-2 text-xs font-bold transition-colors"
                >
                  <FontAwesomeIcon icon={faGear} className="text-sm text-app-3" />
                  Управление на имоти
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="px-3 py-2">
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-sm" />
                Изход
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Mobile apartment context bar ─────────────────────────────── */
function MobileAptBar({ onManage }) {
  const { t } = useLanguage();
  const { apartments, currentId, select } = useApartment();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const current = apartments.find(a => a.id === currentId);
  const label   = currentId === 'all' ? t.aptAll : (current?.name ?? t.aptAll);

  return (
    <div className="md:hidden border-t border-white/10 bg-black/10" ref={ref}>
      {/* Trigger strip */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-center gap-2 py-1.5 text-white/90 text-xs font-semibold"
      >
        <FontAwesomeIcon icon={faHouse} className="text-[9px] opacity-70" />
        <span>{label}</span>
        <FontAwesomeIcon icon={faChevronDown} className={`text-[9px] opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown — bottom sheet style */}
      {open && (
        <div className="absolute left-0 right-0 z-50 animate-fade-in">
          <div className="surface border-b border-app shadow-lg">
            <div className="px-4 pt-3 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-app-3">Избери имот</span>
            </div>
            <div className="px-3 pt-1 pb-2 grid grid-cols-2 gap-1.5">
              {/* Всички */}
              <button
                onClick={() => { select('all'); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentId === 'all'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-app text-app-2'
                }`}
              >
                <FontAwesomeIcon icon={faHouse} className="text-[10px]" />
                {t.aptAll}
                {currentId === 'all' && <FontAwesomeIcon icon={faCheck} className="ml-auto text-[10px]" />}
              </button>
              {/* Имоти */}
              {apartments.map(apt => (
                <button
                  key={apt.id}
                  onClick={() => { select(apt.id); setOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                    currentId === apt.id
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-app text-app-2'
                  }`}
                >
                  <FontAwesomeIcon icon={faHouse} className="text-[10px] flex-shrink-0" />
                  <span className="truncate flex-1">{apt.name}</span>
                  {currentId === apt.id && <FontAwesomeIcon icon={faCheck} className="text-[10px] flex-shrink-0" />}
                </button>
              ))}
            </div>

            {/* Управление — отделен, ясно различим */}
            <div className="px-3 pb-3 pt-2 border-t border-app">
              <button
                onClick={() => { setOpen(false); onManage(); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-app-2 text-sm font-bold transition-colors"
              >
                <FontAwesomeIcon icon={faGear} className="text-base text-app-3" />
                Управление на имоти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── App shell ─────────────────────────────────────────────────── */
function AppInner() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [bookings, setBookings]   = useState([]);
  const [expenses, setExpenses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [aptManager, setAptManager] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currentId, apartments, loaded: aptsLoaded } = useApartment();

  const refresh = useCallback(async () => {
    const [bkgs, exps] = await Promise.all([
      getBookings(currentId),
      getExpenses(currentId),
    ]);
    setBookings(bkgs);
    setExpenses(exps);
  }, [currentId]);

  useEffect(() => {
    if (!user) return;
    refresh().then(() => setLoading(false));
  }, [user, refresh]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Onboarding — show when apartments are loaded but empty
  if (!loading && aptsLoaded && apartments.length === 0) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary-500 to-primary-700 shadow-lg">
        {/* Main nav row */}
        <div className="px-4 md:px-6 h-14 flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-2 flex-shrink-0">
            <FontAwesomeIcon icon={faHouse} className="text-white text-base" />
            <h1 className="text-white font-bold text-sm tracking-tight whitespace-nowrap hidden sm:block">
              {t.appTitle}
            </h1>
          </div>

          <div className="flex-1 flex justify-center">
            <Tabs active={activeTab} onChange={setActiveTab} />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemePicker />
            <LangPicker />
            {/* User menu */}
            <UserMenu user={user} onLogout={handleLogout} onManageApts={() => setAptManager(true)} />
          </div>
        </div>

        {/* Mobile apartment context bar — само на мобилен */}
        {!loading && apartments.length > 0 && (
          <MobileAptBar onManage={() => setAptManager(true)} />
        )}
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
              <Revenue bookings={bookings} expenses={expenses} />
            </div>
            <div className={activeTab === 'expenses' ? 'animate-fade-in' : 'hidden'}>
              <Expenses expenses={expenses} onRefresh={refresh} />
            </div>
          </>
        )}
      </main>

      {/* Apartment manager modal */}
      {aptManager && (
        <ApartmentManager onClose={() => setAptManager(false)} />
      )}
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

/* ─── Auth gate ─────────────────────────────────────────────────── */
function AppGate() {
  const { user, loading, recoveryMode, clearRecoveryMode } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Password recovery flow — user clicked the reset link in email
  if (recoveryMode) {
    return <ResetPasswordScreen onDone={clearRecoveryMode} t={t} />;
  }

  return user ? <AppInner /> : <AuthForm />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ApartmentProvider>
          <AppGate />
        </ApartmentProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
