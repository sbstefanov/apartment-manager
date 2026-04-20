import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Tabs from './components/Tabs';
import Calendar from './components/Calendar';
import BookingList from './components/BookingList';
import BookingForm from './components/BookingForm';
import Revenue from './components/Revenue';
import { getBookings, seedData } from './services/storage';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

const LANGS = [
  { code: 'bg', flag: '🇧🇬', label: 'Български' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
];

function LangPicker() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen]   = useState(false);
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
    <div className="lang-picker" ref={ref}>
      <button className="lang-badge" onClick={() => setOpen(o => !o)}>
        {lang.toUpperCase()}
        <svg className="lang-chevron" viewBox="0 0 10 6" fill="none">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="lang-dropdown">
          {LANGS.map(l => (
            <button
              key={l.code}
              className={`lang-option${lang === l.code ? ' lang-option--active' : ''}`}
              onClick={() => pick(l.code)}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-label">{l.label}</span>
              <span className="lang-code">{l.code.toUpperCase()}</span>
              {lang === l.code && (
                <svg className="lang-check" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AppInner() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [bookings, setBookings]   = useState([]);
  const { t } = useLanguage();

  const refresh = useCallback(() => setBookings(getBookings()), []);
  useEffect(() => { seedData(); refresh(); }, [refresh]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-logo">🏠</span>
          <h1 className="app-title">{t.appTitle}</h1>
          <LangPicker />
        </div>
        <Tabs active={activeTab} onChange={setActiveTab} />
      </header>

      <main className="app-content">
        <div className={`tab-panel${activeTab === 'calendar' ? ' tab-panel--active' : ''}`}>
          <Calendar bookings={bookings} onRefresh={refresh} />
        </div>
        <div className={`tab-panel${activeTab === 'bookings' ? ' tab-panel--active' : ''}`}>
          <BookingList bookings={bookings} onRefresh={refresh} />
        </div>
        <div className={`tab-panel${activeTab === 'new' ? ' tab-panel--active' : ''}`}>
          <BookingForm bookings={bookings} onRefresh={refresh} onNavigate={setActiveTab} />
        </div>
        <div className={`tab-panel${activeTab === 'revenue' ? ' tab-panel--active' : ''}`}>
          <Revenue bookings={bookings} />
        </div>
      </main>
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
