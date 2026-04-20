const STORAGE_KEY = 'apartment_bookings';

export function getBookings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveBooking(booking) {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === booking.id);
  if (index >= 0) {
    bookings[index] = booking;
  } else {
    bookings.push(booking);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function deleteBooking(id) {
  const bookings = getBookings().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function seedData() {
  const existing = getBookings();
  if (existing.length > 0) return;

  const samples = [
    {
      id: crypto.randomUUID(),
      name: 'Иван Петров',
      phone: '0888 123 456',
      email: 'ivan.petrov@gmail.com',
      persons: 2,
      checkin: '2025-07-05',
      checkout: '2025-07-12',
      amount: 980,
      status: 'paid',
      notes: 'Предпочитат тиха стая.',
      source: 'Директна',
      createdAt: new Date('2025-06-10').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Мария Колева',
      phone: '0877 654 321',
      email: 'maria.koleva@abv.bg',
      persons: 3,
      checkin: '2025-07-18',
      checkout: '2025-07-25',
      amount: 1260,
      status: 'paid',
      notes: '',
      source: 'Airbnb',
      createdAt: new Date('2025-06-22').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Георги Димитров',
      phone: '0899 111 222',
      email: 'g.dimitrov@mail.bg',
      persons: 4,
      checkin: '2025-08-02',
      checkout: '2025-08-10',
      amount: 1440,
      status: 'pending',
      notes: 'Пристигат късно — след 22:00.',
      source: 'Booking.com',
      createdAt: new Date('2025-07-01').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Елена Стоянова',
      phone: '0876 333 444',
      email: 'elena.stoyanova@gmail.com',
      persons: 2,
      checkin: '2025-08-14',
      checkout: '2025-08-21',
      amount: 1050,
      status: 'paid',
      notes: '',
      source: 'Директна',
      createdAt: new Date('2025-07-15').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Николай Тодоров',
      phone: '0888 555 777',
      email: 'niki.todorov@abv.bg',
      persons: 1,
      checkin: '2025-07-28',
      checkout: '2025-08-01',
      amount: 520,
      status: 'cancelled',
      notes: 'Отказа поради лично обстоятелство.',
      source: 'Airbnb',
      createdAt: new Date('2025-07-05').toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}
