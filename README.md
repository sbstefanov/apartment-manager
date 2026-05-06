# Apartment Manager

A React web application for managing short-term apartment rentals. Tracks bookings, revenue, and occupancy across multiple booking platforms — all from a single clean interface.

Built for landlords and property managers who want a lightweight, private alternative to spreadsheets.

---

## Features

### Calendar
- Monthly calendar view with color-coded bookings by platform
- Click any booked day to view full booking details
- Month/year jump picker for quick navigation
- Occupancy percentage and booking count per month

### Bookings
- Full booking list with search by guest name
- Filter by status: All / Paid / Pending / Cancelled
- Date range filter — shows bookings active during a selected period
- Inline actions per row: Edit, Mark as Paid, Cancel, Delete
- Inline confirmation prompt for all destructive actions
- Color stripe per row indicates payment status

### New Booking
- Guest details: name, phone, email, number of guests
- Date range picker with conflict detection (blocks overlapping dates)
- Night rate calculator — enter price per night to auto-fill total
- Payment status and booking source (Airbnb, Booking.com, Direct, Other)
- Notes field for additional info

### Revenue
- Total revenue, paid, and pending amounts
- Nights booked for the current year
- Paid vs pending progress bar
- Revenue breakdown by platform with visual bars
- Monthly revenue table
- Year filter

### General
- Dark / Light mode toggle
- Bulgarian / English language support
- Fully responsive — mobile, tablet, and desktop
- Mobile bottom navigation bar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (Create React App) |
| Styling | Tailwind CSS 3 |
| Icons | Font Awesome 6 |
| Dates | Day.js |
| Storage | localStorage (Supabase migration in progress) |
| Language | JavaScript (JSX) |

---

## Project Structure

```
src/
├── components/
│   ├── Calendar.js         # Monthly calendar with booking overlay
│   ├── BookingList.js      # Filterable booking table with inline actions
│   ├── BookingForm.js      # New / edit booking form
│   ├── BookingModal.js     # Booking detail view and mobile actions
│   ├── DateRangePicker.js  # Custom date range selector with conflict detection
│   ├── Revenue.js          # Analytics and revenue breakdown
│   └── Tabs.js             # Desktop header tabs + mobile bottom nav
├── context/
│   └── LanguageContext.js  # BG/EN translations and language state
├── services/
│   └── storage.js          # Data layer (localStorage CRUD + seed data)
└── App.js                  # App shell, theme picker, language picker
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/sbstefanov/apartment-manager.git
cd apartment-manager
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

---

## Booking Sources

| Source | Color |
|---|---|
| Direct | Green |
| Airbnb | Red / Pink |
| Booking.com | Dark Blue |
| Other | Grey |

## Booking Statuses

| Status | Meaning |
|---|---|
| Pending | Booking confirmed, payment not yet received |
| Paid | Payment received |
| Cancelled | Booking cancelled — excluded from revenue |

---

## Roadmap

- [ ] Supabase integration — auth + cloud database
- [ ] Login / Register with per-user data isolation
- [ ] Multiple apartment management
- [ ] Export to CSV / PDF
- [ ] iCal import from Airbnb / Booking.com
- [ ] Push notifications for upcoming check-ins

---

## License

MIT
