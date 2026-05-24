import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSackDollar, faCircleCheck, faClock, faMoon, faChartColumn,
  faArrowTrendDown, faScaleBalanced,
} from '@fortawesome/free-solid-svg-icons';
import { useLanguage, fmtEur } from '../context/LanguageContext';

const PLATFORMS = ['Директна', 'Airbnb', 'Booking.com', 'OLX', 'Facebook', 'Друго'];
const PLATFORM_BAR = {
  'Директна':    'bg-direct',
  'Airbnb':      'bg-airbnb',
  'Booking.com': 'bg-booking',
  'OLX':         'bg-violet-500',
  'Facebook':    'bg-sky-500',
  'Друго':       'bg-slate-400',
};

export default function Revenue({ bookings, expenses = [] }) {
  const { t } = useLanguage();
  const currentYear = dayjs().year();

  const years = [
    ...new Set([
      ...bookings.map(b => dayjs(b.checkin).year()),
      ...expenses.map(e => dayjs(e.date).year()),
    ]),
  ].sort((a, b) => b - a);

  const [yearFilter, setYearFilter] = useState('all');

  const filtered = yearFilter === 'all'
    ? bookings
    : bookings.filter(b => dayjs(b.checkin).year() === Number(yearFilter));

  const expFiltered = yearFilter === 'all'
    ? expenses
    : expenses.filter(e => dayjs(e.date).year() === Number(yearFilter));

  const active  = filtered.filter(b => b.status !== 'cancelled');
  const paid    = filtered.filter(b => b.status === 'paid');
  const partial = filtered.filter(b => b.status === 'partial');
  const pending = filtered.filter(b => b.status === 'pending');

  const totalRevenue      = active.reduce((s, b) => s + b.amount, 0);
  const totalPaid         = paid.reduce((s, b) => s + b.amount, 0);
  const partialCollected  = partial.reduce((s, b) => s + (Number(b.paid_amount) || 0), 0);
  const partialRemaining  = partial.reduce((s, b) => s + (b.amount - (Number(b.paid_amount) || 0)), 0);
  const totalCollected    = totalPaid + partialCollected;
  const totalPending      = pending.reduce((s, b) => s + b.amount, 0) + partialRemaining;
  const totalExpenses     = expFiltered.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit         = totalRevenue - totalExpenses;

  const collectedPct = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;
  const pendingPct   = totalRevenue > 0 ? (totalPending   / totalRevenue) * 100 : 0;
  const partialPct   = totalRevenue > 0 ? (partialCollected / totalRevenue) * 100 : 0;

  const allActive = bookings.filter(b => b.status !== 'cancelled');
  const yearStart = `${currentYear}-01-01`;
  const yearEnd   = `${currentYear + 1}-01-01`;
  const nightsThisYear = allActive
    .filter(b => b.checkin < yearEnd && b.checkout > yearStart)
    .reduce((s, b) => {
      const from = b.checkin  > yearStart ? b.checkin  : yearStart;
      const to   = b.checkout < yearEnd   ? b.checkout : yearEnd;
      return s + dayjs(to).diff(dayjs(from), 'day');
    }, 0);

  // Monthly breakdown (revenue)
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

  // Platform breakdown
  const platformData = PLATFORMS.map(src => {
    const bkgs  = active.filter(b => b.source === src);
    const total = bkgs.reduce((s, b) => s + b.amount, 0);
    const pct   = totalRevenue > 0 ? Math.round((total / totalRevenue) * 100) : 0;
    return { src, label: t.sources[src] || src, total, count: bkgs.length, pct, bar: PLATFORM_BAR[src] };
  }).filter(p => p.count > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-5">
      {/* Year filter */}
      <div className="flex justify-end">
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="input max-w-[160px] py-1.5 text-sm font-semibold"
        >
          <option value="all">{t.allYears}</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Stat cards — revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          icon={faSackDollar} bg="bg-primary-50 dark:bg-primary-900/30" iconColor="text-primary-500"
          label={t.statTotal} value={fmtEur(totalRevenue)} sub={t.statActive(active.length)} />
        <StatCard
          icon={faCircleCheck} bg="bg-emerald-50 dark:bg-emerald-900/30" iconColor="text-emerald-500"
          label={t.statPaid} value={fmtEur(totalCollected)} sub={t.statPaidCount(paid.length + partial.length)} />
        <StatCard
          icon={faClock} bg="bg-amber-50 dark:bg-amber-900/30" iconColor="text-amber-500"
          label={t.statPending} value={fmtEur(totalPending)} sub={t.statPaidCount(pending.length + partial.length)} />
      </div>

      {/* Expense + Net profit cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StatCard
          icon={faArrowTrendDown} bg="bg-rose-50 dark:bg-rose-900/30" iconColor="text-rose-500"
          label={t.statExpenses} value={fmtEur(totalExpenses)}
          sub={`${expFiltered.length} ${t.expEntries}`}
          valueColor="text-rose-500"
        />
        <StatCard
          icon={faScaleBalanced}
          bg={netProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/30'}
          iconColor={netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}
          label={t.statNet}
          value={fmtEur(netProfit)}
          sub={`${t.statTotal} − ${t.statExpenses}`}
          valueColor={netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}
        />
      </div>

      {/* Nights card */}
      <div className="card p-4 md:p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon icon={faMoon} className="text-blue-500 text-lg" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-app-3 uppercase tracking-wider">
            {t.statNights(currentYear)}
          </div>
          <div className="text-xl font-bold mt-0.5">{nightsThisYear} {t.statNightsUnit}</div>
          <div className="text-xs text-app-3 mt-0.5">{t.statNightsFrom}</div>
        </div>
      </div>

      {/* Progress bar */}
      {totalRevenue > 0 && (
        <div className="card p-4 md:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-app-2">{t.collected}</span>
            <span className="text-sm font-bold">{t.pctPaid(collectedPct)}</span>
          </div>
          <div className="h-2.5 surface-2 rounded-full overflow-hidden flex">
            <div className="bg-primary-500 transition-all duration-500" style={{ width: `${collectedPct - partialPct}%` }} />
            <div className="bg-orange-400 transition-all duration-500" style={{ width: `${partialPct}%` }} />
            <div className="bg-amber-500 transition-all duration-500" style={{ width: `${pendingPct}%` }} />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-app-3 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-500" />{t.statPaid}
            </span>
            {partial.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />{t.status.partial}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />{t.statPending}
            </span>
          </div>
        </div>
      )}

      {/* Platform breakdown */}
      {platformData.length > 0 && (
        <section>
          <h3 className="text-base font-bold mb-3">{t.byPlatform}</h3>
          <div className="space-y-2">
            {platformData.map(p => (
              <div key={p.src} className="card p-3.5 md:p-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-semibold">{p.label}</span>
                  <span className="text-base font-bold">{fmtEur(p.total)}</span>
                </div>
                <div className="h-2 surface-2 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${p.bar}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-app-3">
                  <span>{p.count} {t.colRes.toLowerCase()}</span>
                  <span>{p.pct}% {t.ofTotal}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly breakdown */}
      <section>
        <h3 className="text-base font-bold mb-3">{t.byMonth}</h3>
        {months.length === 0 ? (
          <div className="card p-12 text-center">
            <FontAwesomeIcon icon={faChartColumn} className="text-3xl text-app-3 mb-2" />
            <div className="text-sm text-app-2">{t.noRevData}</div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="surface-2">
                <tr>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-app-3 py-2.5 px-4">
                    {t.colMonth}
                  </th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-app-3 py-2.5 px-4 w-16">
                    {t.colRes}
                  </th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-wider text-app-3 py-2.5 px-4">
                    {t.colRevenue}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {months.map(m => (
                  <tr key={m.label} className="hover:surface-2 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium capitalize">{m.label}</td>
                    <td className="py-3 px-4 text-sm">{m.count}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 surface-2 rounded-full overflow-hidden max-w-[200px]">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500"
                            style={{ width: `${(m.total / maxTotal) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold whitespace-nowrap">{fmtEur(m.total)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, bg, iconColor, label, value, sub, valueColor }) {
  return (
    <div className="card p-4 md:p-5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <FontAwesomeIcon icon={icon} className={`${iconColor} text-base`} />
      </div>
      <div className="text-xs font-semibold text-app-3 uppercase tracking-wider">{label}</div>
      <div className={`text-xl md:text-2xl font-bold mt-1 tracking-tight ${valueColor || ''}`}>{value}</div>
      <div className="text-xs text-app-3 mt-1">{sub}</div>
    </div>
  );
}
