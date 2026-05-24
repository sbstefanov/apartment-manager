import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faList, faCirclePlus, faChartColumn, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../context/LanguageContext';

const TABS = [
  { id: 'calendar', icon: faCalendarDays },
  { id: 'bookings', icon: faList },
  { id: 'new',      icon: faCirclePlus },
  { id: 'revenue',  icon: faChartColumn },
  { id: 'expenses', icon: faReceipt },
];

export default function Tabs({ active, onChange }) {
  const { t } = useLanguage();

  return (
    <>
      {/* Desktop: inline pills inside header row */}
      <nav className="hidden md:flex items-center gap-1">
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-white/80 hover:bg-white/15 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="text-xs" />
              {t.tabs[tab.id]}
            </button>
          );
        })}
      </nav>

      {/* Mobile: bottom nav with pill indicator — 5 columns */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 surface border-t border-app pb-safe">
        <div className="grid grid-cols-5">
          {TABS.map(tab => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                aria-label={t.tabs[tab.id]}
                className="flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
              >
                <div
                  className={`w-10 h-7 flex items-center justify-center rounded-full transition-all ${
                    isActive ? 'bg-primary-50 dark:bg-primary-500/20' : 'bg-transparent'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={tab.icon}
                    className={`text-base ${isActive ? 'text-primary-500' : 'text-app-3'}`}
                  />
                </div>
                <span className={`text-[9px] font-semibold ${isActive ? 'text-primary-500' : 'text-app-3'}`}>
                  {t.tabs[tab.id]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
