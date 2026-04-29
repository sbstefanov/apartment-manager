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

export function clearAndReseed() {
  localStorage.removeItem(STORAGE_KEY);
  seedData();
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
      checkin: '2026-04-28',
      checkout: '2026-05-05',
      amount: 980,
      status: 'paid',
      notes: 'Предпочитат тиха стая.',
      source: 'Директна',
      createdAt: new Date('2026-04-10').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Мария Колева',
      phone: '0877 654 321',
      email: 'maria.koleva@abv.bg',
      persons: 3,
      checkin: '2026-05-10',
      checkout: '2026-05-17',
      amount: 1260,
      status: 'paid',
      notes: '',
      source: 'Airbnb',
      createdAt: new Date('2026-04-22').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Георги Димитров',
      phone: '0899 111 222',
      email: 'g.dimitrov@mail.bg',
      persons: 4,
      checkin: '2026-05-22',
      checkout: '2026-05-30',
      amount: 1440,
      status: 'pending',
      notes: 'Пристигат късно — след 22:00.',
      source: 'Booking.com',
      createdAt: new Date('2026-04-28').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Елена Стоянова',
      phone: '0876 333 444',
      email: 'elena.stoyanova@gmail.com',
      persons: 2,
      checkin: '2026-06-05',
      checkout: '2026-06-12',
      amount: 1050,
      status: 'paid',
      notes: '',
      source: 'Директна',
      createdAt: new Date('2026-05-01').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Николай Тодоров',
      phone: '0888 555 777',
      email: 'niki.todorov@abv.bg',
      persons: 1,
      checkin: '2026-06-18',
      checkout: '2026-06-22',
      amount: 520,
      status: 'cancelled',
      notes: 'Отказа поради лично обстоятелство.',
      source: 'Airbnb',
      createdAt: new Date('2026-05-15').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Sophie Müller',
      phone: '+49 151 234 567',
      email: 'sophie.mueller@gmail.com',
      persons: 2,
      checkin: '2026-07-01',
      checkout: '2026-07-08',
      amount: 1120,
      status: 'pending',
      notes: 'Late check-in requested.',
      source: 'Booking.com',
      createdAt: new Date('2026-05-20').toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Димитър Василев',
      phone: '0899 876 543',
      email: 'd.vasilev@abv.bg',
      persons: 3,
      checkin: '2026-07-15',
      checkout: '2026-07-22',
      amount: 1330,
      status: 'paid',
      notes: '',
      source: 'Airbnb',
      createdAt: new Date('2026-06-01').toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}
