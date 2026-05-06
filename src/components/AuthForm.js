import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function AuthForm() {
  const { t } = useLanguage();
  const [mode, setMode]       = useState('login');   // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    // Basic validation
    if (!email.includes('@')) { setError(t.authErrEmail); return; }
    if (password.length < 6)  { setError(t.authErrPassword); return; }

    setLoading(true);
    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) setError(t.authErrInvalid);
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) {
          setError(err.message.includes('already') ? t.authErrExists : err.message);
        } else {
          setSuccess(t.authSuccessReg);
          setMode('login');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError(''); setSuccess('');
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

          {/* Success */}
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-sm px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
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
