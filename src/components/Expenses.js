import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus, faTrash, faPenToSquare, faBroom, faWrench, faGears, faBolt,
  faFileInvoiceDollar, faEllipsis, faXmark, faCheck, faReceipt,
  faArrowTrendDown,
} from '@fortawesome/free-solid-svg-icons';
import { saveExpense, deleteExpense } from '../services/storage';
import { useLanguage, fmtEur } from '../context/LanguageContext';
import { useApartment } from '../context/ApartmentContext';

/* ─── Category meta ───────────────────────────────────────────────── */
export const CAT_META = {
  'Почистване': { icon: faBroom,             color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/30'     },
  'Ремонт':     { icon: faWrench,            color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
  'Поддръжка':  { icon: faGears,             color: 'text-slate-500',  bg: 'bg-slate-100 dark:bg-slate-700'     },
  'Комунални':  { icon: faBolt,              color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
  'Данъци':     { icon: faFileInvoiceDollar, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  'Друго':      { icon: faEllipsis,          color: 'text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-700'     },
};

const EMPTY_EXPENSE = {
  date: dayjs().format('YYYY-MM-DD'),
  category: 'Друго',
  amount: '',
  description: '',
  apartment_id: null,
};

/* ─── Add / Edit modal ────────────────────────────────────────────── */
function ExpenseModal({ expense, apartments, defaultAptId, onClose, onRefresh, t }) {
  const isNew = !expense?.id;
  const [form, setForm] = useState(
    expense
      ? { ...expense, amount: String(expense.amount) }
      : {
          ...EMPTY_EXPENSE,
          apartment_id: defaultAptId !== 'all' ? defaultAptId : (apartments[0]?.id || null),
        }
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = {};
    if (!form.date)                        errs.date   = t.errRequired;
    if (!form.amount || Number(form.amount) <= 0) errs.amount = t.errAmount;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await saveExpense({
        ...(isNew
          ? { id: crypto.randomUUID(), created_at: new Date().toISOString() }
          : { id: expense.id }),
        ...form,
        amount:       Number(form.amount),
        apartment_id: form.apartment_id || null,
      });
      await onRefresh();
      onClose();
    } catch {
      // error already logged
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="surface w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-pop overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 md:p-5 border-b border-app flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
            <FontAwesomeIcon icon={faArrowTrendDown} className="text-rose-500" />
          </div>
          <h2 className="flex-1 font-bold text-base text-app">
            {isNew ? t.expAdd : t.expEdit}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:surface-2 flex items-center justify-center text-app-3 hover:text-app"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-5 md:p-6 space-y-4 overflow-y-auto">

          {/* Date + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-app-2 mb-1.5">{t.expDate} *</label>
              <input
                type="date"
                className={`input ${errors.date ? 'input-error' : ''}`}
                value={form.date}
                onChange={e => set('date', e.target.value)}
              />
              {errors.date && <span className="text-xs text-rose-500 mt-1 block">{errors.date}</span>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-app-2 mb-1.5">{t.expAmount} *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={`input ${errors.amount ? 'input-error' : ''}`}
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
              />
              {errors.amount && <span className="text-xs text-rose-500 mt-1 block">{errors.amount}</span>}
            </div>
          </div>

          {/* Category grid */}
          <div>
            <label className="block text-xs font-semibold text-app-2 mb-2">{t.expCategory}</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(CAT_META).map(cat => {
                const meta     = CAT_META[cat];
                const isActive = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set('category', cat)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-app surface-2 hover:border-primary-400'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={meta.icon}
                      className={`text-sm ${isActive ? 'text-primary-500' : meta.color}`}
                    />
                    <span className={`text-[10px] font-semibold leading-tight text-center ${isActive ? 'text-primary-500' : 'text-app-2'}`}>
                      {t.expCats[cat] || cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apartment (only if user has apartments) */}
          {apartments.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-app-2 mb-1.5">{t.fldApartment}</label>
              <select
                className="input"
                value={form.apartment_id || ''}
                onChange={e => set('apartment_id', e.target.value || null)}
              >
                <option value="">{t.aptNone}</option>
                {apartments.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-app-2 mb-1.5">{t.expDescription}</label>
            <textarea
              className="input resize-y min-h-[60px] py-2.5"
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder={t.expDescPh}
              rows={2}
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-base">
            {saving ? '...' : t.btnSave}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────── */
export default function Expenses({ expenses, onRefresh }) {
  const { t } = useLanguage();
  const { apartments, currentId } = useApartment();

  const years = [...new Set(expenses.map(e => dayjs(e.date).year()))].sort((a, b) => b - a);
  const [yearFilter, setYearFilter] = useState('all');
  const [modal, setModal]           = useState(null);   // null | 'new' | expense obj
  const [confirmId, setConfirmId]   = useState(null);

  const filtered = yearFilter === 'all'
    ? expenses
    : expenses.filter(e => dayjs(e.date).year() === Number(yearFilter));

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  // By category
  const byCat = Object.keys(CAT_META)
    .map(cat => {
      const sum   = filtered.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0);
      const count = filtered.filter(e => e.category === cat).length;
      return { cat, sum, count };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.sum - a.sum);

  // Group by month
  const groups = {};
  filtered.forEach(e => {
    const key = dayjs(e.date).format('YYYY-MM');
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => (a < b ? 1 : -1));

  async function handleDelete(id) {
    await deleteExpense(id);
    await onRefresh();
    setConfirmId(null);
  }

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          className="input max-w-[140px] py-1.5 text-sm font-semibold"
        >
          <option value="all">{t.allYears}</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setModal('new')}
          className="btn-primary flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          {t.expAdd}
        </button>
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <>
          {/* Total */}
          <div className="card p-4 md:p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faArrowTrendDown} className="text-rose-500 text-lg" />
            </div>
            <div>
              <div className="text-xs font-semibold text-app-3 uppercase tracking-wider">{t.expTotal}</div>
              <div className="text-2xl font-bold mt-0.5 text-rose-500">{fmtEur(total)}</div>
              <div className="text-xs text-app-3 mt-0.5">{filtered.length} {t.expEntries}</div>
            </div>
          </div>

          {/* By category */}
          {byCat.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {byCat.map(({ cat, sum, count }) => {
                const meta = CAT_META[cat];
                return (
                  <div key={cat} className="card p-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <FontAwesomeIcon icon={meta.icon} className={`text-sm ${meta.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-app-3 truncate">{t.expCats[cat] || cat}</div>
                      <div className="text-sm font-bold text-rose-500">{fmtEur(sum)}</div>
                      <div className="text-[10px] text-app-3">{count}×</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Expense list grouped by month */}
      {sortedGroups.length === 0 ? (
        <div className="card p-12 text-center">
          <FontAwesomeIcon icon={faReceipt} className="text-4xl text-app-3 mb-3" />
          <div className="text-sm text-app-2">{t.expNoExp}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map(([key, exps]) => {
            const d          = dayjs(key + '-01');
            const monthLabel = `${t.months[d.month()]} ${d.year()}`;
            const monthTotal = exps.reduce((s, e) => s + Number(e.amount), 0);

            return (
              <div key={key} className="card overflow-hidden">
                {/* Month header */}
                <div className="surface-2 px-4 py-2.5 flex items-center justify-between border-b border-app">
                  <span className="text-xs font-bold uppercase tracking-wider text-app-2 capitalize">
                    {monthLabel}
                  </span>
                  <span className="text-xs font-bold text-rose-500">{fmtEur(monthTotal)}</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-[var(--border)]">
                  {exps.map(exp => {
                    const meta        = CAT_META[exp.category] || CAT_META['Друго'];
                    const apt         = apartments.find(a => a.id === exp.apartment_id);
                    const isConfirming = confirmId === exp.id;

                    return (
                      <div
                        key={exp.id}
                        className="flex items-center gap-3 px-4 py-3 hover:surface-2 transition-colors"
                      >
                        {/* Category icon */}
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                          <FontAwesomeIcon icon={meta.icon} className={`text-sm ${meta.color}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold text-app">
                              {t.expCats[exp.category] || exp.category}
                            </span>
                            {apt && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full surface-2 border border-app text-app-3 font-semibold truncate max-w-[100px]">
                                {apt.name}
                              </span>
                            )}
                          </div>
                          {exp.description && (
                            <div className="text-xs text-app-3 truncate mt-0.5">{exp.description}</div>
                          )}
                          <div className="text-[11px] text-app-3 mt-0.5">
                            {dayjs(exp.date).format('DD.MM.YYYY')}
                          </div>
                        </div>

                        {/* Amount */}
                        <span className="text-sm font-bold text-rose-500 flex-shrink-0 mr-1">
                          -{fmtEur(Number(exp.amount))}
                        </span>

                        {/* Actions */}
                        {isConfirming ? (
                          <div className="flex items-center gap-1.5 animate-fade-in flex-shrink-0">
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="w-8 h-8 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                            >
                              <FontAwesomeIcon icon={faCheck} className="text-xs" />
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="w-8 h-8 rounded-lg surface-2 border border-app text-app-3 hover:text-app flex items-center justify-center transition-colors"
                            >
                              <FontAwesomeIcon icon={faXmark} className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => setModal(exp)}
                              className="w-8 h-8 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center transition-colors"
                              title={t.btnEdit}
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                            </button>
                            <button
                              onClick={() => setConfirmId(exp.id)}
                              className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-colors"
                              title={t.btnDelete}
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-sm" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {modal && (
        <ExpenseModal
          expense={modal === 'new' ? null : modal}
          apartments={apartments}
          defaultAptId={currentId}
          onClose={() => setModal(null)}
          onRefresh={onRefresh}
          t={t}
        />
      )}
    </div>
  );
}
