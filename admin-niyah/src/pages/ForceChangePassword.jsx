import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import logo from '../assets/logo.jpeg';

export default function ForceChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('niyah_admin_token');

  if (!token) {
    navigate('/');
    return null;
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await apiRequest('/admin/change-password', {
        method: 'POST',
        token,
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      sessionStorage.setItem('niyah_admin_must_change', '0');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full font-body text-sm text-ink bg-cream border border-border rounded-xl px-4 py-3 outline-none transition-all duration-150 focus:border-red-brand focus:ring-2 focus:ring-red-brand/10 placeholder:text-ink-muted';

  return (
    <div className="min-h-screen bg-cream-dark flex items-center justify-center px-6">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/8 p-10">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="niyah" className="h-[120px] w-auto object-contain mix-blend-multiply opacity-95 mb-6" />
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-xs font-bold text-amber-700">Action required</span>
            </div>
            <h1 className="font-brand font-extrabold text-2xl text-ink mb-2 text-center">Set your password</h1>
            <p className="text-sm text-ink-muted text-center max-w-xs">
              You&apos;re using a one-time password. Please set a permanent password to continue.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">One-Time Password</label>
              <input name="currentPassword" value={form.currentPassword} onChange={handleChange} type="password" placeholder="Enter your OTP" autoComplete="current-password" required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">New Password</label>
              <input name="newPassword" value={form.newPassword} onChange={handleChange} type="password" placeholder="Min. 8 characters" autoComplete="new-password" required className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">Confirm New Password</label>
              <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" placeholder="••••••••" autoComplete="new-password" required className={inputClass} />
            </div>

            {error && (
              <div className="bg-red-light border border-red-brand/20 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-brand">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-red w-full py-3.5 mt-2 rounded-xl text-sm">
              {loading ? 'Setting password...' : 'Set Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
