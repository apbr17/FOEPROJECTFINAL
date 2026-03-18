import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, Calendar, Clock, Search, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: number;
  event_ext_id: string;
  event_title: string;
  seats: string;
  ticket_count: number;
  total_price: number;
  booking_ref: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  created_at: string;
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending:   'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

// Demo booking history shown for demo accounts
const DEMO_BOOKINGS: Booking[] = [
  {
    id: 1,
    event_ext_id: '2',
    event_title: 'Coldplay: Music of the Spheres',
    seats: 'D4, D5',
    ticket_count: 2,
    total_price: 5250,
    booking_ref: 'CPNDEMO01',
    status: 'confirmed',
    created_at: '2026-02-10T14:30:00',
  },
  {
    id: 2,
    event_ext_id: '1',
    event_title: 'Dune: Part Three',
    seats: 'B7',
    ticket_count: 1,
    total_price: 472,
    booking_ref: 'CPNDEMO02',
    status: 'confirmed',
    created_at: '2026-01-20T18:15:00',
  },
  {
    id: 3,
    event_ext_id: '3',
    event_title: 'IPL 2026: Mumbai vs Chennai',
    seats: 'General x3',
    ticket_count: 3,
    total_price: 4725,
    booking_ref: 'CPNDEMO03',
    status: 'confirmed',
    created_at: '2026-03-01T11:00:00',
  },
];

const BookingsPage = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');
  const apiBase = import.meta.env.VITE_API_BASE || '';
  const isDemoUser = (user as any)?.id >= 998;

  useEffect(() => {
    if (!isLoggedIn) { navigate('/signin'); return; }

    if (isDemoUser) {
      // Show pre-built demo history instantly
      setBookings(DEMO_BOOKINGS);
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/bookings.php?user_id=${(user as any)?.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setBookings(data.bookings);
        else setError(data.message || 'Could not load bookings');
      })
      .catch(() => setError('Backend offline — bookings unavailable'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b =>
    b.event_title.toLowerCase().includes(search.toLowerCase()) ||
    b.booking_ref.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatTime = (str: string) =>
    new Date(str).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border header-glow">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">My Bookings</h1>
            <p className="text-xs text-muted-foreground">{user?.firstName} {user?.lastName}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">

        {/* Demo notice */}
        {isDemoUser && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <p className="text-sm text-amber-400">
              Showing sample booking history for demo account.{' '}
              <a href="/signin" className="underline font-medium">Create a real account</a>{' '}
              to track your actual bookings.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by event name or booking ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border-0 text-foreground
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse bg-card rounded-2xl p-5 border border-border">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
              <Ticket className="w-9 h-9 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              {search ? 'No bookings match your search' : 'No bookings yet'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? 'Try a different search term' : 'Book your first event to see it here'}
            </p>
            {!search && (
              <button onClick={() => navigate('/')} className="text-primary font-medium hover:underline">
                Browse Events →
              </button>
            )}
          </div>
        )}

        {/* Booking cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
            {filtered.map(booking => (
              <div key={booking.id}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground leading-tight">{booking.event_title}</h3>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{booking.booking_ref}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs border flex-shrink-0 ${statusColors[booking.status]}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ticket className="w-4 h-4 text-primary flex-shrink-0" />
                    {booking.ticket_count} ticket{booking.ticket_count !== 1 ? 's' : ''}
                    {booking.seats ? ` · ${booking.seats}` : ''}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    {formatDate(booking.created_at)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    Booked at {formatTime(booking.created_at)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="text-lg font-bold text-primary">
                    ₹{Number(booking.total_price).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
