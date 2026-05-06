import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faEnvelope, faLock, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

/* ─── Check-email screen ─────────────────────────────────────────── */
function CheckEmailScreen({ email, onBack, t }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4 shadow-pop">
            <FontAwesomeIcon icon={faHouse} className="text-white text-2xl" />
          </div>
        </div>

        <div className="surface rounded-2xl shadow-pop p-8 text-center space-y-5">
          {/* Email icon */}
          <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto">
            <FontAwesomeIcon icon={faEnvelope} className="text-primary-500 text-2xl" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-app">{t.authCheckEmail}</h2>
            <p className="text-sm text-app-2 mt-2 leading-relaxed">
              {t.authCheckEmailMsg(email)}
            </p>
          </div>

          <button
            onClick={onBack}
            className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
          >
            {t.authCheckEmailBack}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main auth form ─────────────────────────────────────────────── */
export default function AuthForm() {
  const { t } = useLanguage();
  const [mode, setMode]           = useState('login'); // 'login' | 'register' | 'check-email'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const isLogin = mode === 'login';

  // Check-email screen
  if (mode === 'check-email') {
    return (
      <CheckEmailScreen
        email={email}
        onBack={() => { setMode('login'); setError(''); }}
        t={t}
      />
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validation
    if (!email.includes('@'))   { setError(t.authErrEmail);    return; }
    if (password.length < 6)    { setError(t.authErrPassword); return; }

    if (!isLogin) {
      if (!firstName.trim() || !lastName.trim()) { setError(t.authErrName);        return; }
      if (password !== confirm)                   { setError(t.authErrConfirmPass); return; }
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) setError(t.authErrInvalid);
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name:  lastName.trim(),
              full_name:  `${firstName.trim()} ${lastName.trim()}`,
            },
          },
        });
        if (err) {
          setError(err.message.includes('already') ? t.authErrExists : err.message);
        } else if (data.session) {
          // Email confirmation disabled — user is logged in immediately
          // AuthContext will pick up the session via onAuthStateChange
        } else {
          // Email confirmation required
          setMode('check-email');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setFirstName(''); setLastName('');
    setPassword(''); setConfirm('');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4 shadow-pop">
            <FontAwesomeIcon icon={faHouse} className="text-white text-2xl" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">{t.appTitle}</h1>
          <p className="text-white/70 text-sm mt-1">
            {isLogin ? t.authSubtitle : t.authSubtitleReg}
          </p>
        </div>

        {/* Card */}
        <div className="surface rounded-2xl shadow-pop p-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>

            {/* First + Last name — register only */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t.authFirstName}
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="input pl-10"
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="relative">
                  <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t.authLastName}
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="input pl-10"
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none" />
              <input
                type="email"
                placeholder={t.authEmail}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input pl-10"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none" />
              <input
                type="password"
                placeholder={t.authPassword}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input pl-10"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {/* Confirm password — register only */}
            {!isLogin && (
              <div className="relative">
                <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-app-3 text-sm pointer-events-none" />
                <input
                  type="password"
                  placeholder={t.authConfirmPass}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className="input pl-10"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                : isLogin ? t.authSubmitLogin : t.authSubmitReg
              }
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center text-sm text-app-3 pt-1">
            {isLogin ? t.authToRegister : t.authToLogin}{' '}
            <button
              onClick={switchMode}
              className="text-primary-500 font-semibold hover:text-primary-600 transition-colors"
            >
              {isLogin ? t.authRegister : t.authLogin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
