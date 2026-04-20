import React, { createContext, useContext, useState } from 'react';

/* ─── helpers ─── */
export const fmtEur = (n) =>
  n.toLocaleString('bg-BG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + '\u00A0€';

const translations = {
  bg: {
    appTitle: 'Апартамент Мениджър',
    /* Tabs */
    tabs: { calendar: 'Календар', bookings: 'Резервации', new: 'Нова', revenue: 'Приходи' },
    /* Filters */
    filters: { all: 'Всички', paid: 'Платени', pending: 'Очакват', cancelled: 'Отменени' },
    /* Status */
    status:     { paid: 'Платено',        pending: 'Очаква',          cancelled: 'Отменена' },
    statusLong: { paid: 'Платено',        pending: 'Очаква плащане',  cancelled: 'Отменена' },
    /* Sources */
    sources: { 'Директна': 'Директна', 'Airbnb': 'Airbnb', 'Booking.com': 'Booking.com', 'Друго': 'Друго' },
    /* Dates */
    months: ['Януари','Февруари','Март','Април','Май','Юни','Юли','Август','Септември','Октомври','Ноември','Декември'],
    dow: ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],
    /* BookingList */
    searchPlaceholder: 'Търси по име...',
    noBookings:    'Няма намерени резервации',
    colGuest:      'Гост',
    colPlatform:   'Платформа',
    colAmount:     'Сума',
    colStatus:     'Статус',
    nights:        (n) => `${n} нощ.`,
    persons:       (n) => `${n} лица`,
    activeLabel:   'Настанен',
    todayLabel:    'Днес',
    inDays:        (n) => `след ${n} дни`,
    /* BookingForm */
    newBookingTitle:   'Нова резервация',
    secGuest:          'Гост',
    secStay:           'Период на престой',
    secPayment:        'Плащане и източник',
    secNotes:          'Бележки',
    fldName:           'Имена *',
    fldPersons:        'Брой лица',
    fldPhone:          'Телефон',
    fldEmail:          'Имейл',
    fldAmount:         'Обща сума (€) *',
    fldStatus:         'Статус',
    fldPlatform:       'Платформа',
    phName:            'Иван Петров',
    phPhone:           '0888 123 456',
    phNotes:           'Допълнителна информация...',
    phAmount:          '0',
    optPending:        'Очаква плащане',
    optPaid:           'Платено',
    optDirect:         'Директна',
    optOther:          'Друго',
    btnSave:           'Запази резервация',
    errRequired:       'Полето е задължително',
    errCheckout:       'Датата на напускане трябва да е след настаняването',
    errAmount:         'Въведете валидна сума',
    conflictMsg:       (n, ci, co) => `Датите се припокриват с резервацията на ${n} (${ci} – ${co}).`,
    /* BookingModal */
    lblPhone:    'Телефон',   lblEmail:    'Имейл',
    lblCheckin:  'Настаняване', lblCheckout: 'Напускане',
    lblNights:   'Нощувки',   lblPersons:  'Лица',
    lblAmount:   'Сума',      lblSource:   'Източник',
    lblNotes:    'Бележки',
    btnMarkPaid: 'Маркирай като платено',
    btnCancelBkg:'Отмени резервацията',
    btnDelete:   'Изтрий',
    btnClose:    'Затвори',
    confirmDel:  (n) => `Сигурни ли сте, че искате да изтриете резервацията на ${n}?`,
    /* Revenue */
    statTotal:       'Общо приходи',
    statActive:      (n) => `${n} активни резервации`,
    statPaid:        'Платено',
    statPaidCount:   (n) => `${n} резервации`,
    statPending:     'Очаква плащане',
    statNights:      (y) => `Наети нощи за ${y} г.`,
    statNightsFrom:  'от всички активни резервации',
    statNightsUnit:  'нощи',
    collected:       'Събрани средства',
    pctPaid:         (n) => `${Math.round(n)}% платено`,
    byMonth:         'По месеци',
    noRevData:       'Няма данни за приходи',
    colMonth:        'Месец',
    colRes:          'Рез.',
    colRevenue:      'Приходи',
    /* Calendar */
    calNoBookings:   'Няма резервации',
    calStats:        (n, pct) => `${n} рез. · ${pct}% заетост`,
    calLegDirect:    'Директна',
    calLegOther:     'Друго',
    /* DateRangePicker */
    drpPlaceholder:  'Изберете период на престой',
    drpPickEnd:      'изберете напускане',
    drpHintStart:    'Изберете дата на настаняване',
    drpHintEnd:      'Изберете дата на напускане',
    drpNights:       (n) => `${n} ${n === 1 ? 'нощувка' : 'нощувки'}`,
    drpBooked:       'Заето',
    drpTurnover:     'Смяна',
    drpSelected:     'Избрано',
  },

  en: {
    appTitle: 'Apartment Manager',
    tabs: { calendar: 'Calendar', bookings: 'Bookings', new: 'New', revenue: 'Revenue' },
    filters: { all: 'All', paid: 'Paid', pending: 'Pending', cancelled: 'Cancelled' },
    status:     { paid: 'Paid',    pending: 'Pending',           cancelled: 'Cancelled' },
    statusLong: { paid: 'Paid',    pending: 'Awaiting payment',  cancelled: 'Cancelled' },
    sources: { 'Директна': 'Direct', 'Airbnb': 'Airbnb', 'Booking.com': 'Booking.com', 'Друго': 'Other' },
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    dow: ['Mo','Tu','We','Th','Fr','Sa','Su'],
    searchPlaceholder: 'Search by name...',
    noBookings:    'No bookings found',
    colGuest:      'Guest',
    colPlatform:   'Platform',
    colAmount:     'Amount',
    colStatus:     'Status',
    nights:        (n) => `${n} nights`,
    persons:       (n) => `${n} guests`,
    activeLabel:   'Checked in',
    todayLabel:    'Today',
    inDays:        (n) => n === 1 ? 'Tomorrow' : `in ${n} days`,
    newBookingTitle:   'New Booking',
    secGuest:          'Guest',
    secStay:           'Stay Period',
    secPayment:        'Payment & Source',
    secNotes:          'Notes',
    fldName:           'Full Name *',
    fldPersons:        'Guests',
    fldPhone:          'Phone',
    fldEmail:          'Email',
    fldAmount:         'Total Amount (€) *',
    fldStatus:         'Status',
    fldPlatform:       'Platform',
    phName:            'John Smith',
    phPhone:           '+359 888 123 456',
    phNotes:           'Additional information...',
    phAmount:          '0',
    optPending:        'Awaiting payment',
    optPaid:           'Paid',
    optDirect:         'Direct',
    optOther:          'Other',
    btnSave:           'Save Booking',
    errRequired:       'This field is required',
    errCheckout:       'Check-out must be after check-in',
    errAmount:         'Enter a valid amount',
    conflictMsg:       (n, ci, co) => `Dates overlap with ${n}'s booking (${ci} – ${co}).`,
    lblPhone:    'Phone',     lblEmail:    'Email',
    lblCheckin:  'Check-in',  lblCheckout: 'Check-out',
    lblNights:   'Nights',    lblPersons:  'Guests',
    lblAmount:   'Amount',    lblSource:   'Source',
    lblNotes:    'Notes',
    btnMarkPaid: 'Mark as paid',
    btnCancelBkg:'Cancel booking',
    btnDelete:   'Delete',
    btnClose:    'Close',
    confirmDel:  (n) => `Are you sure you want to delete ${n}'s booking?`,
    statTotal:       'Total Revenue',
    statActive:      (n) => `${n} active bookings`,
    statPaid:        'Paid',
    statPaidCount:   (n) => `${n} bookings`,
    statPending:     'Awaiting Payment',
    statNights:      (y) => `Nights booked in ${y}`,
    statNightsFrom:  'from all active bookings',
    statNightsUnit:  'nights',
    collected:       'Collected funds',
    pctPaid:         (n) => `${Math.round(n)}% paid`,
    byMonth:         'By Month',
    noRevData:       'No revenue data',
    colMonth:        'Month',
    colRes:          'Bkgs.',
    colRevenue:      'Revenue',
    calNoBookings:   'No bookings',
    calStats:        (n, pct) => `${n} bkgs · ${pct}% occupancy`,
    calLegDirect:    'Direct',
    calLegOther:     'Other',
    drpPlaceholder:  'Select stay period',
    drpPickEnd:      'select check-out',
    drpHintStart:    'Select check-in date',
    drpHintEnd:      'Select check-out date',
    drpNights:       (n) => `${n} ${n === 1 ? 'night' : 'nights'}`,
    drpBooked:       'Booked',
    drpTurnover:     'Turnover',
    drpSelected:     'Selected',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'bg');

  function toggleLang() {
    const next = lang === 'bg' ? 'en' : 'bg';
    localStorage.setItem('lang', next);
    setLang(next);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
