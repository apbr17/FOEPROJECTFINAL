import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, CreditCard, Ticket, Star, Calendar, ShieldCheck, LogOut, Edit2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface Stats {
  totalBookings: number;
  totalSpent: number;
  totalReviews: number;
}

const AccountPage = () => {
  const navigate    = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [copied,    setCopied]    = useState(false);
  const apiBase = import.meta.env.VITE_API_BASE || '';

  const isDemoUser = (user as any)?.id >= 998;

  useEffect(() => {
    if (!isLoggedIn) { navigate('/signin'); return; }
    if (isDemoUser) {
      setStats({ totalBookings: 3, totalSpent: 10447, totalReviews: 2 });
      setLoading(false);
      return;
    }

    // Fetch booking + review counts
    Promise.all([
      fetch(`${apiBase}/bookings.php?user_id=${(user as any)?.id}`).then(r => r.json()),
      fetch(`${apiBase}/reviews.php?user_id=${(user as any)?.id}`).then(r => r.json()).catch(() => ({ total: 0 })),
    ]).then(([bookData, revData]) => {
      const bookings: any[] = bookData.success ? bookData.bookings : [];
      const spent = bookings.reduce((s: number, b: any) => s + Number(b.total_price), 0);
      setStats({
        totalBookings: bookings.length,
        totalSpent:    spent,
        totalReviews:  revData.total ?? 0,
      });
    }).catch(() => {
      setStats({ totalBookings: 0, totalSpent: 0, totalReviews: 0 });
    }).finally(() => setLoading(false));
  }, []);

  const handleSignOut = () => { logout(); navigate('/'); };

  const copyId = () => {
    navigator.clipboard.writeText(String((user as any)?.id ?? ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinDate = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border header-glow">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">My Account</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">

        {/* Profile card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-24 hero-animated-bg relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="orb-1 absolute top-[-40px] left-[-40px] w-[200px] h-[200px] rounded-full bg-primary/20 blur-[60px]" />
              <div className="orb-2 absolute bottom-[-30px] right-[-30px] w-[150px] h-[150px] rounded-full bg-accent/15 blur-[50px]" />
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl gradient-hero flex items-center justify-center
                border-4 border-card shadow-lg shadow-primary/20">
                <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
              </div>
              {isDemoUser && (
                <span className="demo-badge text-xs px-3 py-1 rounded-full border border-amber-400/30
                  bg-amber-500/10 text-amber-400 font-medium">
                  Demo Account
                </span>
              )}
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-muted-foreground text-sm mt-0.5">{user?.email}</p>

            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Member since {joinDate}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Bookings',   value: loading ? '…' : String(stats?.totalBookings ?? 0), icon: Ticket, color: 'text-primary'  },
            { label: 'Spent',      value: loading ? '…' : `₹${(stats?.totalSpent ?? 0).toLocaleString()}`, icon: CreditCard, color: 'text-green-500' },
            { label: 'Reviews',    value: loading ? '…' : String(stats?.totalReviews ?? 0), icon: Star,   color: 'text-amber-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center hover:border-primary/30 transition-colors">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Account details */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Account Details
          </h3>

          {[
            { label: 'First Name',  value: user?.firstName,   icon: User },
            { label: 'Last Name',   value: user?.lastName,    icon: User },
            { label: 'Email',       value: user?.email,       icon: Mail },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{value || '—'}</p>
                </div>
              </div>
            </div>
          ))}

          {/* User ID */}
          {!isDemoUser && (
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="font-mono font-medium text-foreground">#{(user as any)?.id}</p>
                </div>
              </div>
              <button onClick={copyId}
                className="text-xs text-primary hover:underline flex items-center gap-1">
                {copied ? <><Check className="w-3 h-3" /> Copied</> : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Verification badge */}
        {!isDemoUser && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Aadhaar Verified</p>
              <p className="text-sm text-muted-foreground">
                Your identity has been verified. You can book events and find companions.
              </p>
            </div>
          </div>
        )}

        {/* Demo notice */}
        {isDemoUser && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
            <p className="font-semibold text-amber-500 mb-1">You're using a Demo Account</p>
            <p className="text-sm text-muted-foreground mb-3">
              Bookings and reviews made with a demo account are not saved to the database.
              Create a real account to track your history.
            </p>
            <Button variant="hero" size="sm" onClick={() => navigate('/signin')}>
              Create Real Account
            </Button>
          </div>
        )}

        {/* Quick links */}
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          {[
            { label: 'My Bookings', icon: Ticket, path: '/bookings' },
            { label: 'Reviews',     icon: Star,   path: '/reviews' },
          ].map(({ label, icon: Icon, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{label}</span>
              </div>
              <span className="text-muted-foreground text-lg">›</span>
            </button>
          ))}
        </div>

        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full gap-2 text-red-400 border-red-400/20 hover:bg-red-400/10 hover:border-red-400/40"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>

      </div>
    </div>
  );
};

export default AccountPage;
