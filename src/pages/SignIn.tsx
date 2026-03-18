import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Zap } from 'lucide-react';

type Tab = 'login' | 'register';

// Demo accounts — no backend needed
const DEMO_ACCOUNTS = [
  { id: 999, firstName: 'Demo', lastName: 'User',  email: 'demo@companion.app',  role: 'User'  },
  { id: 998, firstName: 'Admin', lastName: 'Demo', email: 'admin@companion.app', role: 'Admin' },
];

// ─────────────────────────────────────────────────────────────
// Login form
// ─────────────────────────────────────────────────────────────
const LoginForm = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const apiBase = import.meta.env.VITE_API_BASE || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Both fields are required.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${apiBase}/login.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login({ ...data.user, rememberMe });
        navigate('/');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch {
      setError('Could not reach server. Check VITE_API_BASE in .env');
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    login({ id: account.id, firstName: account.firstName, lastName: account.lastName, email: account.email, rememberMe: false });
    navigate('/');
  };

  return (
    <div className="space-y-5">
      {/* ── Demo login cards ── */}
      <div className="space-y-2">
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Try instantly — no signup needed
        </p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.email}
              type="button"
              onClick={() => loginAsDemo(acc)}
              className="demo-badge relative flex flex-col items-start p-3 rounded-xl border border-amber-400/30
                bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:from-amber-500/20
                hover:to-orange-500/10 transition-all text-left group overflow-hidden"
            >
              {/* shimmer strip */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"
                style={{ backgroundSize: '200% auto', animation: 'shimmer 2s linear infinite' }}
              />
              <span className="text-xs font-semibold text-amber-300">{acc.role}</span>
              <span className="text-xs text-slate-400 mt-0.5 truncate w-full">{acc.firstName} {acc.lastName}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 truncate w-full">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-xs text-slate-500">or sign in with your account</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      {/* ── Real login form ── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white
              placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white
              placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-red-500 cursor-pointer" />
          <span className="text-xs text-slate-300">Remember me</span>
        </label>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition">
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Register form
// ─────────────────────────────────────────────────────────────
const RegisterForm = () => {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const apiBase   = import.meta.env.VITE_API_BASE || '';

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', aadhaar: '',
    password: '', confirmPassword: '', ageConfirmed: false, rememberMe: false,
  });
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading,     setLoading]     = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.firstName.trim()) err.firstName = 'Required';
    if (!formData.lastName.trim())  err.lastName  = 'Required';
    if (!/^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook)\.(com|in)$/.test(formData.email))
      err.email = 'Use a gmail, yahoo, or outlook address';
    if (!/^[2-9][0-9]{11}$/.test(formData.aadhaar))
      err.aadhaar = 'Must be 12 digits starting with 2–9';
    if (formData.password.length < 8)          err.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(formData.password)) err.password = 'Must include an uppercase letter';
    else if (!/[a-z]/.test(formData.password)) err.password = 'Must include a lowercase letter';
    if (formData.password !== formData.confirmPassword) err.confirmPassword = 'Passwords do not match';
    if (!formData.ageConfirmed) err.ageConfirmed = 'You must confirm you are 18+';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${apiBase}/register.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName,
          email: formData.email, aadhaar: formData.aadhaar, password: formData.password }),
      });
      const data = await res.json();
      if (data.success) {
        const lr   = await fetch(`${apiBase}/login.php`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: formData.email, password: formData.password }),
        });
        const ld = await lr.json();
        if (ld.success) login({ ...ld.user, rememberMe: formData.rememberMe });
        navigate('/');
      } else {
        setServerError(data.message || 'Registration failed.');
      }
    } catch {
      setServerError('Could not reach server. Check VITE_API_BASE in .env');
    } finally {
      setLoading(false);
    }
  };

  const field = (id: keyof typeof formData, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">{label}</label>
      <input type={type} name={id} value={formData[id] as string} onChange={handle}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white
          placeholder-slate-500 focus:outline-none focus:border-red-500 transition" />
      {errors[id] && <p className="text-red-400 text-xs mt-1">{errors[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {field('firstName', 'First Name', 'text', 'First name')}
        {field('lastName',  'Last Name',  'text', 'Last name')}
      </div>
      {field('email', 'Email', 'email', 'gmail / yahoo / outlook')}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-1">Aadhaar Number</label>
        <input type="text" name="aadhaar" maxLength={12} placeholder="12-digit Aadhaar"
          value={formData.aadhaar}
          onChange={e => setFormData(prev => ({ ...prev, aadhaar: e.target.value.replace(/\D/g, '') }))}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white
            placeholder-slate-500 focus:outline-none focus:border-red-500 transition" />
        {errors.aadhaar && <p className="text-red-400 text-xs mt-1">{errors.aadhaar}</p>}
      </div>
      {field('password',        'Password',         'password', 'Min 8 chars, upper + lower')}
      {field('confirmPassword', 'Confirm Password', 'password', 'Re-enter password')}

      <div className="space-y-2 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="ageConfirmed" checked={formData.ageConfirmed} onChange={handle}
            className="w-4 h-4 accent-red-500 cursor-pointer" />
          <span className="text-xs text-slate-300">I confirm I am above 18 years of age</span>
        </label>
        {errors.ageConfirmed && <p className="text-red-400 text-xs ml-6">{errors.ageConfirmed}</p>}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handle}
            className="w-4 h-4 accent-red-500 cursor-pointer" />
          <span className="text-xs text-slate-300">Remember me</span>
        </label>
      </div>

      {serverError && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
          {serverError}
        </div>
      )}

      <Button type="submit" disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition">
        {loading ? 'Creating Account…' : 'Create Account'}
      </Button>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
const SignIn = () => {
  const [tab,          setTab]          = useState<Tab>('login');
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const apiBase = import.meta.env.VITE_API_BASE || '';

  useEffect(() => {
    if (!apiBase) { setServerOnline(false); return; }
    let cancelled = false;
    fetch(`${apiBase}/ping.php`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setServerOnline(!!d.success); })
      .catch(() => { if (!cancelled) setServerOnline(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 hero-animated-bg relative overflow-hidden">
      {/* Background orbs matching homepage */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb-1 absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px]" />
        <div className="orb-2 absolute bottom-[-80px] right-[-80px] w-[450px] h-[450px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">

          {/* Brand */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-1">
              Companion<span className="text-red-500">.</span>
            </h1>
            <p className="text-slate-400 text-sm">Experience events together</p>
          </div>

          {/* Server warning */}
          {serverOnline === false && (
            <div className="mb-4 text-sm text-yellow-400 bg-yellow-400/10 rounded-lg p-3 border border-yellow-400/20 text-center">
              ⚠️ Backend offline — use <span className="font-semibold">Demo Login</span> above to explore
            </div>
          )}

          {/* Tab switcher */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 mb-6">
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {tab === 'login' ? <LoginForm /> : <RegisterForm />}

          {tab === 'register' && (
            <div className="mt-5 p-3.5 bg-slate-800/50 rounded-lg text-xs text-slate-300 border border-slate-700">
              <p className="font-semibold text-slate-200 mb-2">What you can do on Companion:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>🎟 Book tickets for movies, concerts & live events</li>
                <li>👥 Find companions to attend with</li>
                <li>⭐ Leave reviews for events and the site</li>
                <li>🔐 Safe, Aadhaar age-verified community</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
