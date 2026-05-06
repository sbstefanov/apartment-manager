import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark, faPlus, faPenToSquare, faTrash, faCheck, faHouse,
} from '@fortawesome/free-solid-svg-icons';
import { saveApartment, deleteApartment } from '../services/storage';
import { useLanguage } from '../context/LanguageContext';
import { useApartment } from '../context/ApartmentContext';

const EMPTY_FORM = { name: '', address: '', notes: '' };

export default function ApartmentManager({ onClose }) {
  const { t } = useLanguage();
  const { apartments, select, currentId, refresh } = useApartment();

  const [editing, setEditing]     = useState(null);   // null | {} (new) | apt obj (edit)
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [nameErr, setNameErr]     = useState('');

  function startAdd() {
    setEditing({});
    setForm(EMPTY_FORM);
    setNameErr('');
  }

  function startEdit(apt) {
    setEditing(apt);
    setForm({ name: apt.name, address: apt.address || '', notes: apt.notes || '' });
    setNameErr('');
  }

  function cancelEdit() {
    setEditing(null);
    setNameErr('');
  }

  async function handleSave() {
    if (!form.name.trim()) { setNameErr(t.errRequired); return; }
    setSaving(true);
    try {
      const saved = await saveApartment({
        ...(editing.id ? { id: editing.id } : { id: crypto.randomUUID() }),
        name:    form.name.trim(),
        address: form.address.trim() || null,
        notes:   form.notes.trim()   || null,
      });
      await refresh();
      // Auto-select newly created apartment
      if (!editing.id && saved?.id) select(saved.id);
      setEditing(null);
    } catch {
      // error already logged in storage
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    // If deleting the currently selected apartment, fall back to 'all'
    if (currentId === id) select('all');
    await deleteApartment(id);
    await refresh();
    setConfirmId(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="surface w-full max-w-lg rounded-t-3xl md:rounded-3xl shadow-pop overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 md:p-5 border-b border-app flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <FontAwesomeIcon icon={faHouse} className="text-primary-500" />
          </div>
          <h2 className="flex-1 font-bold text-base text-app">{t.aptTitle}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:surface-2 flex items-center justify-center text-app-3 hover:text-app"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 md:p-5 space-y-3 flex-1">

          {/* Add / Edit form */}
          {editing !== null ? (
            <div className="card p-4 space-y-3 animate-fade-in">
              <div className="text-[11px] font-bold uppercase tracking-wider text-app-3">
                {editing.id ? t.aptEdit : t.aptAdd}
              </div>

              <div>
                <input
                  type="text"
                  className={`input ${nameErr ? 'input-error' : ''}`}
                  placeholder={t.aptNamePh}
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setNameErr(''); }}
                  autoFocus
                />
                {nameErr && <span className="text-xs text-rose-500 mt-1 block">{nameErr}</span>}
              </div>

              <input
                type="text"
                className="input"
                placeholder={t.aptAddressPh}
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />

              <textarea
                className="input resize-y min-h-[60px] py-2.5"
                placeholder={t.aptNotesPh}
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? '...' : t.btnSave}
                </button>
                <button onClick={cancelEdit} className="btn-ghost">
                  {t.btnClose}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={startAdd} className="btn-primary w-full flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faPlus} />
              {t.aptAdd}
            </button>
          )}

          {/* Apartment list */}
          {apartments.length === 0 ? (
            <div className="text-center py-8 text-sm text-app-3">{t.aptNoApts}</div>
          ) : (
            <div className="card overflow-hidden divide-y divide-[var(--border)]">
              {apartments.map(apt => (
                <div key={apt.id} className="flex items-center gap-3 px-4 py-3 hover:surface-2 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faHouse} className="text-primary-500 text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-app">{apt.name}</div>
                    {apt.address && (
                      <div className="text-xs text-app-3 truncate">{apt.address}</div>
                    )}
                  </div>

                  {confirmId === apt.id ? (
                    <div className="flex items-center gap-1.5 animate-fade-in">
                      <button
                        onClick={() => handleDelete(apt.id)}
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
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => startEdit(apt)}
                        className="w-8 h-8 rounded-lg text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 flex items-center justify-center transition-colors"
                        title={t.btnEdit}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                      </button>
                      <button
                        onClick={() => setConfirmId(apt.id)}
                        className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center justify-center transition-colors"
                        title={t.btnDelete}
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
