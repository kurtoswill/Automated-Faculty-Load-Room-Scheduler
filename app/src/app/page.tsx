'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────
type FormState = 'idle' | 'loading' | 'error';
type Role      = 'student' | 'instructor' | 'admin';

// ─── Config ───────────────────────────────────────────────────
const ALLOWED_DOMAIN = 'cvsu.edu.ph';

// ─────────────────────────────────────────────────────────────
// Brand Logo
// ─────────────────────────────────────────────────────────────
function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#1a7a3c" />
      <path d="M20 8L30 13.5V25L20 30.5L10 25V13.5L20 8Z" fill="#22a050" />
      <path
        d="M15.5 20.5L18.5 23.5L25 17"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 15h4M13 19h2"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeOpacity=".25" />
      <path d="M12 2v4" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Background
// ─────────────────────────────────────────────────────────────
function BackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(34,160,80,.10) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(34,160,80,.07) 0%, transparent 70%)' }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(34,160,80,.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,160,80,.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Role config
// ─────────────────────────────────────────────────────────────
const ROLES: { key: Role; label: string }[] = [
  { key: 'student',    label: 'Student'    },
  { key: 'instructor', label: 'Instructor' },
  { key: 'admin',      label: 'Admin'      },
];

const ROLE_BADGE: Record<Role, { label: string; bg: string; color: string }> = {
  student:    { label: 'Student',    bg: '#e8f5ee', color: '#1a7a3c' },
  instructor: { label: 'Instructor', bg: '#fff8e6', color: '#92620a' },
  admin:      { label: 'Admin',      bg: '#eef2ff', color: '#3730a3' },
};

// ─────────────────────────────────────────────────────────────
// Login Form
// ─────────────────────────────────────────────────────────────
function LoginForm() {
  const [role, setRole]           = useState<Role>('student');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [remember, setRemember]   = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg]   = useState('');

  const badge     = ROLE_BADGE[role];
  const isLoading = formState === 'loading';

  function clearError() {
    setErrorMsg('');
    setFormState('idle');
  }

  function validate(): string | null {
    if (!email) return 'Email is required.';
    if (!email.includes('@')) return 'Enter a valid email address.';
    if (email.split('@')[1] !== ALLOWED_DOMAIN)
      return `Only @${ALLOWED_DOMAIN} accounts are allowed.`;
    if (!password) return 'Password is required.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    const err = validate();
    if (err) { setErrorMsg(err); return; }
    setFormState('loading');
    // TODO: replace with real auth (NextAuth / server action)
    await new Promise(r => setTimeout(r, 1200));
    setFormState('error');
    setErrorMsg('Invalid credentials. Please try again.');
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Role selector */}
      <div
        className="flex rounded-lg p-1 gap-1"
        style={{ background: 'var(--color-surface-2)' }}
      >
        {ROLES.map(r => (
          <button
            key={r.key}
            type="button"
            onClick={() => { setRole(r.key); clearError(); }}
            className="flex-1 py-[7px] text-xs font-semibold rounded-md transition-all duration-150"
            style={role === r.key ? {
              background: 'var(--color-surface)',
              color: 'var(--color-primary)',
              boxShadow: 'var(--shadow-xs)',
            } : {
              background: 'transparent',
              color: 'var(--color-text-muted)',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Error banner */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg border animate-fade-in"
            style={{
              background:   'var(--color-error-light)',
              borderColor:  'rgba(217,48,37,.2)',
              color:        'var(--color-error)',
              fontSize:     '13px',
            }}
          >
            <AlertIcon />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">Institutional Email</label>
          <div className="input-icon-wrapper">
            <span className="input-icon-left"><MailIcon /></span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              placeholder={`yourname@${ALLOWED_DOMAIN}`}
              autoComplete="email"
              disabled={isLoading}
              className="input-has-left-icon"
            />
          </div>
          <p className="form-hint">Must be a @{ALLOWED_DOMAIN} account</p>
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="form-label">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--color-primary-light)' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="input-icon-wrapper">
            <span className="input-icon-left"><LockIcon /></span>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              className="input-has-left-icon input-has-right-icon"
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              className="input-icon-right bg-transparent border-0 transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <EyeIcon open={showPass} />
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded cursor-pointer"
            style={{ accentColor: 'var(--color-primary-light)' }}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Keep me signed in
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary btn-full mt-1"
          style={{
            opacity: isLoading ? 0.8 : 1,
            cursor:  isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading
            ? <><Spinner /> Signing in…</>
            : <>Sign In <ArrowIcon /></>
          }
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div
      className="page-shell relative flex items-center justify-center px-4 py-10"
      style={{ minHeight: '100vh' }}
    >
      <BackgroundPattern />

      <div
        className="relative z-10 w-full max-w-[420px] transition-all duration-300"
        style={{
          opacity:   mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        {/* ── Brand ── */}
        <div className="flex flex-col items-center text-center mb-7">
          {/* <div className="flex items-center gap-3 mb-5">
            <BrandLogo size={44} />
            <div className="text-left">
              <p
                className="text-[17px] font-bold leading-tight"
                style={{ color: 'var(--color-text)' }}
              >
                SchedMaster
              </p>
              <p
                className="text-[10.5px] font-medium uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Faculty Load &amp; Room Scheduler
              </p>
            </div>
          </div> */}

          <h1
            className="text-[22px] font-bold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Sign in with your institutional email to continue
          </p>

          {/* Partnership */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              In partnership with
            </span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: 'var(--color-primary-light)' }}
            >
              CvSali
            </span>
          </div>
        </div>

        {/* ── Card ── */}
        <div className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="card-body">
            <LoginForm />
          </div>
        </div>

        {/* ── Footer ── */}
        <p
          className="text-center mt-5 text-xs leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Access is restricted to enrolled students and staff.
          <br />
          Contact your administrator for account issues.
        </p>
        {/* <p
          className="text-center mt-2 text-[11px]"
          style={{ color: 'var(--color-border)' }}
        >
          SchedMaster v1.0 &nbsp;·&nbsp; {new Date().getFullYear()}
        </p> */}
      </div>
    </div>
  );
}