import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const CalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
);
const ListIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9"  y1="6"  x2="20" y2="6" />
    <line x1="9"  y1="12" x2="20" y2="12" />
    <line x1="9"  y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6"  r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8"  y1="12" x2="16" y2="12" />
  </svg>
);
const ChartIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="6"  y1="20" x2="6"  y2="16" />
    <line x1="3"  y1="20" x2="21" y2="20" />
  </svg>
);

const TAB_IDS = [
  { id: 'calendar', Icon: CalendarIcon },
  { id: 'bookings', Icon: ListIcon },
  { id: 'new',      Icon: PlusIcon },
  { id: 'revenue',  Icon: ChartIcon },
];

export default function Tabs({ active, onChange }) {
  const { t } = useLanguage();

  return (
    <>
      <nav className="header-tabs">
        {TAB_IDS.map(({ id, Icon }) => (
          <button
            key={id}
            className={`header-tab${active === id ? ' header-tab--active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon className="header-tab-icon" />
            {t.tabs[id]}
          </button>
        ))}
      </nav>

      <nav className="bottom-nav">
        {TAB_IDS.map(({ id, Icon }) => (
          <button
            key={id}
            className={`bottom-nav-btn bottom-nav-btn--${id}${active === id ? ' bottom-nav-btn--active' : ''}`}
            onClick={() => onChange(id)}
            aria-label={t.tabs[id]}
          >
            <div className="bottom-nav-pill">
              <Icon className="bottom-nav-icon" />
            </div>
            <span className="bottom-nav-label">{t.tabs[id]}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
