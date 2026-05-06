import { supabase } from '../lib/supabase';

// ─── Bookings ──────────────────────────────────────────────────────────────────

export async function getBookings(apartmentId) {
  let q = supabase.from('bookings').select('*').order('checkin', { ascending: false });
  if (apartmentId && apartmentId !== 'all') q = q.eq('apartment_id', apartmentId);
  const { data, error } = await q;
  if (error) { console.error('getBookings:', error.message); return []; }
  return data || [];
}

export async function saveBooking(booking) {
  const { data: { user } } = await supabase.auth.getUser();

  // Only send known DB columns — never camelCase leaks or UI-only fields
  const payload = {
    id:           booking.id,
    user_id:      user.id,
    name:         booking.name,
    phone:        booking.phone        || null,
    email:        booking.email        || null,
    checkin:      booking.checkin,
    checkout:     booking.checkout,
    persons:      Number(booking.persons),
    amount:       Number(booking.amount),
    status:       booking.status,
    source:       booking.source,
    notes:        booking.notes        || null,
    apartment_id: booking.apartment_id || null,
  };

  const { error } = await supabase.from('bookings').upsert(payload);
  if (error) console.error('saveBooking:', error.message);
}

export async function deleteBooking(id) {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) console.error('deleteBooking:', error.message);
}

// ─── Apartments ────────────────────────────────────────────────────────────────

export async function getApartments() {
  const { data, error } = await supabase
    .from('apartments')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) { console.error('getApartments:', error.message); return []; }
  return data || [];
}

export async function saveApartment(apt) {
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    id:      apt.id,
    user_id: user.id,
    name:    apt.name,
    address: apt.address || null,
    notes:   apt.notes   || null,
  };

  const { data, error } = await supabase
    .from('apartments')
    .upsert(payload)
    .select()
    .single();
  if (error) { console.error('saveApartment:', error.message); throw error; }
  return data;
}

export async function deleteApartment(id) {
  const { error } = await supabase.from('apartments').delete().eq('id', id);
  if (error) console.error('deleteApartment:', error.message);
}

// ─── Expenses ──────────────────────────────────────────────────────────────────

export async function getExpenses(apartmentId) {
  let q = supabase.from('expenses').select('*').order('date', { ascending: false });
  if (apartmentId && apartmentId !== 'all') q = q.eq('apartment_id', apartmentId);
  const { data, error } = await q;
  if (error) { console.error('getExpenses:', error.message); return []; }
  return data || [];
}

export async function saveExpense(expense) {
  const { data: { user } } = await supabase.auth.getUser();

  const payload = {
    id:           expense.id,
    user_id:      user.id,
    apartment_id: expense.apartment_id || null,
    date:         expense.date,
    amount:       Number(expense.amount),
    category:     expense.category,
    description:  expense.description  || null,
  };

  const { error } = await supabase.from('expenses').upsert(payload);
  if (error) { console.error('saveExpense:', error.message); throw error; }
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) console.error('deleteExpense:', error.message);
}
