import React, { useState } from 'react';
import { authService } from '../services/authService.js';
import { BrandLogo } from '../components/BrandLogo.jsx';

export function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await authService.signUp(email, password, name);
        setNotice('Check your email to verify the account, then sign in.');
      } else if (mode === 'reset') {
        await authService.resetPassword(email);
        setNotice('Password reset link sent.');
      } else {
        await authService.signIn(email, password);
      }
    } catch (x) {
      setError(x.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="onboard">
      <div className="brand-onboard" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <BrandLogo size="lg" showTagline layout="vertical" />
      </div>
      <form className="on-card auth-card" onSubmit={submit}>
        <span className="eyebrow">SECURE STUDY SPACE</span>
        <h1>
          {mode === 'signup'
            ? 'Create your account'
            : mode === 'reset'
            ? 'Reset password'
            : 'Welcome back.'}
        </h1>
        <p>
          {mode === 'signup'
            ? 'Your study data will follow you across devices.'
            : mode === 'reset'
            ? 'We’ll email you a secure reset link.'
            : 'Continue where you left off.'}
        </p>
        {mode === 'signup' && (
          <label>
            Display name
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              minLength="1"
              maxLength="80"
              autoComplete="name"
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        {mode !== 'reset' && (
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength="8"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </label>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="form-notice" role="status">
            {notice}
          </div>
        )}
        <button className="primary wide big" disabled={busy}>
          {busy
            ? 'Working…'
            : mode === 'signup'
            ? 'Create account'
            : mode === 'reset'
            ? 'Send reset link'
            : 'Sign in'}
        </button>
        <div className="auth-links">
          {mode === 'login' ? (
            <>
              <button type="button" onClick={() => setMode('signup')}>
                Create account
              </button>
              <button type="button" onClick={() => setMode('reset')}>
                Forgot password?
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setMode('login')}>
              Back to sign in
            </button>
          )}
        </div>
      </form>
    </main>
  );
}

