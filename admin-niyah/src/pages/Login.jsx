import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import logo from '../assets/logo.jpeg';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRequest('/admin/login', { method: 'POST', body: form });
      sessionStorage.setItem('niyah_admin_token', data.token);
      sessionStorage.setItem('niyah_admin_must_change', data.mustChangePassword ? '1' : '0');
      navigate(data.mustChangePassword ? '/change-password' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (hasErr) =>
    `w-full font-body text-sm text-ink bg-cream border rounded-xl px-4 py-3 outline-none transition-all duration-150 focus:border-red-brand focus:ring-2 focus:ring-red-brand/10 placeholder:text-ink-muted ${
      hasErr ? 'border-red-brand/60' : 'border-border'
    }`;

  return (
    <div className="min-h-screen bg-cream-dark flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/8 p-10">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="niyah" className="h-[120px] w-auto object-contain mix-blend-multiply opacity-95 mb-6" />
            <h1 className="font-brand font-extrabold text-2xl text-ink mb-1">Admin Portal</h1>
            <p className="text-sm text-ink-muted">Sign in to manage your store</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">Username</label>
              <input name="username" value={form.username} onChange={handleChange} type="text" autoComplete="username" required className={inputClass(false)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-mid tracking-wide mb-1.5">Password</label>
              <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" autoComplete="current-password" required className={inputClass(!!error)} />
            </div>

            {error && (
              <div className="bg-red-light border border-red-brand/20 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-red-brand">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-red w-full py-3.5 mt-2 rounded-xl text-sm">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
