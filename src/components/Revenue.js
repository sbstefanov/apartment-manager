import React from 'react';
import dayjs from 'dayjs';
import { useLanguage, fmtEur } from '../context/LanguageContext';

export default function Revenue({ bookings }) {
  const { t } = useLanguage();

  const active  = bookings.filter(b => b.status !== 'cancelled');
  const paid    = bookings.filter(b => b.status === 'paid');
  const pending = bookings.filter(b => b.status === 'pending');

  const totalRevenue = active.reduce((s, b) => s + b.amount, 0);
  const totalPaid    = paid.reduce((s, b) => s + b.amount, 0);
  const totalPending = pending.reduce((s, b) => s + b.amount, 0);

  const paidPct    = totalRevenue > 0 ? (totalPaid    / totalRevenue) * 100 : 0;
  const pendingPct = totalRevenue > 0 ? (totalPending / totalRevenue) * 100 : 0;

  const currentYear = dayjs().year();
  const nightsThisYear = active
    .filter(b => dayjs(b.checkin).year() === currentYear || dayjs(b.checkout).year() === currentYear)
    .reduce((s, b) => s + dayjs(b.checkout).diff(dayjs(b.checkin), 'day'), 0);

  const monthMap = {};
  active.forEach(b => {
    const key = dayjs(b.checkin).format('YYYY-MM');
    if (!monthMap[key]) monthMap[key] = { total: 0, count: 0 };
    monthMap[key].total += b.amount;
    monthMap[key].count += 1;
  });

  const months = Object.entries(monthMap)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, val]) => {
      const d = dayjs(key + '-01');
      return { label: `${t.months[d.month()]} ${d.year()}`, ...val };
    });

  const maxTotal = Math.max(...months.map(m => m.total), 1);

  return (
    <div className="revenue">
      <div className="stat-cards">
        <div className="stat-card stat-card--total">
          <div className="stat-icon stat-icon--total">💰</div>
          <div className="stat-label">{t.statTotal}</div>
          <div className="stat-value">{fmtEur(totalRevenue)}</div>
          <div className="stat-sub">{t.statActive(active.length)}</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-icon stat-icon--green">✅</div>
          <div className="stat-label">{t.statPaid}</div>
          <div className="stat-value">{fmtEur(totalPaid)}</div>
          <div className="stat-sub">{t.statPaidCount(paid.length)}</div>
        </div>
        <div className="stat-card stat-card--amber">
          <div className="stat-icon stat-icon--amber">⏳</div>
          <div className="stat-label">{t.statPending}</div>
          <div className="stat-value">{fmtEur(totalPending)}</div>
          <div className="stat-sub">{t.statPaidCount(pending.length)}</div>
        </div>
      </div>

      <div className="stat-card stat-card--nights">
        <div className="stat-icon stat-icon--blue">🌙</div>
        <div className="stat-label">{t.statNights(currentYear)}</div>
        <div className="stat-value">{nightsThisYear} {t.statNightsUnit}</div>
        <div className="stat-sub">{t.statNightsFrom}</div>
      </div>

      {totalRevenue > 0 && (
        <div className="revenue-progress" style={{ marginBottom: '24px' }}>
          <div className="revenue-progress-label">
            <span>{t.collected}</span>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{t.pctPaid(paidPct)}</span>
          </div>
          <div className="revenue-progress-bar">
            <div className="revenue-progress-paid"    style={{ width: `${paidPct}%` }} />
            <div className="revenue-progress-pending" style={{ width: `${pendingPct}%` }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
              {t.statPaid}
            </span>
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-3)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
              {t.statPending}
            </span>
          </div>
        </div>
      )}

      <h3 className="section-title">{t.byMonth}</h3>

      {months.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">{t.noRevData}</div>
        </div>
      ) : (
        <table className="revenue-table">
          <thead>
            <tr>
              <th>{t.colMonth}</th>
              <th>{t.colRes}</th>
              <th>{t.colRevenue}</th>
            </tr>
          </thead>
          <tbody>
            {months.map(m => (
              <tr key={m.label}>
                <td>{m.label}</td>
                <td>{m.count}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="month-bar-wrap">
                      <div className="month-bar" style={{ width: `${(m.total / maxTotal) * 100}%` }} />
                    </div>
                    <span className="revenue-amount" style={{ whiteSpace: 'nowrap' }}>{fmtEur(m.total)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
