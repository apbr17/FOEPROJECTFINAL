import { Calendar, Clock, MapPin, Ticket, User, CreditCard, Check, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event, Companion } from '@/data/mockData';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface BookingSummaryProps {
  event: Event;
  ticketCount: number;
  selectedSeats: string[];
  companion: Companion | null;
  companionEnabled: boolean;
  totalPrice: number;
  onBack: () => void;
  onConfirm: () => void;
}

// ── Mock card validation helpers ─────────────────────────────
const formatCardNumber = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const getCardType = (num: string) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n))        return { label: 'Visa',       color: 'text-blue-400' };
  if (/^5[1-5]/.test(n))  return { label: 'Mastercard', color: 'text-orange-400' };
  if (/^37/.test(n))       return { label: 'Amex',       color: 'text-green-400' };
  if (/^6/.test(n))        return { label: 'Rupay',      color: 'text-purple-400' };
  return null;
};

type PayStep = 'summary' | 'card' | 'processing' | 'confirmed' | 'failed';

export const BookingSummary = ({
  event, ticketCount, selectedSeats, companion,
  companionEnabled, totalPrice, onBack, onConfirm,
}: BookingSummaryProps) => {
  const { user, isLoggedIn } = useAuth();
  const [payStep,   setPayStep]   = useState<PayStep>('summary');
  const [cardNum,   setCardNum]   = useState('');
  const [expiry,    setExpiry]    = useState('');
  const [cvv,       setCvv]       = useState('');
  const [name,      setName]      = useState(user ? `${(user as any).firstName} ${(user as any).lastName}` : '');
  const [cardError, setCardError] = useState('');
  const [bookingRef] = useState('CPN' + Math.random().toString(36).substr(2, 8).toUpperCase());

  const convenience = Math.round(totalPrice * 0.05);
  const grandTotal  = totalPrice + convenience;

  // ── Card form validation ──────────────────────────────────
  const validateCard = () => {
    const num = cardNum.replace(/\s/g, '');
    if (num.length < 16)         return 'Enter a valid 16-digit card number';
    if (expiry.length < 5)       return 'Enter expiry as MM/YY';
    const [mm] = expiry.split('/').map(Number);
    if (mm < 1 || mm > 12)       return 'Invalid expiry month';
    if (cvv.length < 3)          return 'Enter a valid CVV';
    if (!name.trim())            return 'Enter the cardholder name';
    return null;
  };

  const handlePay = () => {
    const err = validateCard();
    if (err) { setCardError(err); return; }
    setCardError('');
    setPayStep('processing');

    // Simulate payment processing (2.5 seconds)
    setTimeout(() => {
      // 90% success rate in demo — makes it feel real
      const success = Math.random() > 0.1;
      setPayStep(success ? 'confirmed' : 'failed');
      if (success) onConfirm();

      // Save booking to backend if logged in
      if (success && isLoggedIn) {
        const apiBase = import.meta.env.VITE_API_BASE || '';
        fetch(`${apiBase}/booking.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id:      (user as any)?.id,
            event_ext_id: event.id,
            event_title:  event.title,
            seats:        selectedSeats.join(', '),
            ticket_count: ticketCount,
            total_price:  grandTotal,
            booking_ref:  bookingRef,
          }),
        }).catch(() => {}); // silent fail if backend offline
      }
    }, 2500);
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  };

  const cardType = getCardType(cardNum);

  // ── Confirmed ─────────────────────────────────────────────
  if (payStep === 'confirmed') {
    return (
      <div className="animate-scale-in text-center py-12">
        <div className="w-20 h-20 gradient-hero rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
          <Check className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Your tickets are booked. Check your email for confirmation.
        </p>
        <div className="bg-muted rounded-2xl p-6 max-w-md mx-auto mb-8 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Ref</span>
            <span className="font-mono font-bold text-foreground">{bookingRef}</span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-semibold text-foreground">{selectedSeats.join(', ')}</span>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-bold text-primary text-lg">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>
        <Button variant="hero" size="lg" onClick={() => window.location.reload()}>
          Browse More Events
        </Button>
      </div>
    );
  }

  // ── Failed ────────────────────────────────────────────────
  if (payStep === 'failed') {
    return (
      <div className="animate-scale-in text-center py-12">
        <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">Payment Failed</h2>
        <p className="text-muted-foreground mb-8">Your card was declined. Please check your details and try again.</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" size="lg" onClick={() => setPayStep('summary')}>Back</Button>
          <Button variant="hero" size="lg" onClick={() => setPayStep('card')}>Try Again</Button>
        </div>
      </div>
    );
  }

  // ── Processing ────────────────────────────────────────────
  if (payStep === 'processing') {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Processing Payment</h3>
          <p className="text-muted-foreground text-sm">Please wait, do not close this window…</p>
        </div>
        <div className="max-w-xs mx-auto space-y-2">
          {['Verifying card details', 'Contacting bank', 'Confirming booking'].map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-4 h-4 rounded-full border-2 border-primary/40 border-t-primary animate-spin"
                style={{ animationDelay: `${i * 0.3}s` }} />
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Card entry form ───────────────────────────────────────
  if (payStep === 'card') {
    return (
      <div className="animate-fade-in">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" /> Payment Details
        </h2>

        {/* Amount reminder */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex justify-between items-center">
          <span className="text-muted-foreground">Total to pay</span>
          <span className="text-2xl font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
        </div>

        {/* Card form */}
        <div className="space-y-4 mb-6">
          {/* Card number */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Card Number</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={cardNum}
                onChange={e => setCardNum(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
              {cardType && (
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${cardType.color}`}>
                  {cardType.label}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Cardholder Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name as on card"
              className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
            />
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Expiry</label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">CVV</label>
              <input
                type="password"
                inputMode="numeric"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                maxLength={4}
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
              />
            </div>
          </div>
        </div>

        {cardError && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {cardError}
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Lock className="w-3.5 h-3.5 text-green-500" />
          256-bit SSL encrypted · Your card details are never stored
        </div>

        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => setPayStep('summary')}>
            Back
          </Button>
          <Button variant="hero" size="lg" className="flex-1 gap-2" onClick={handlePay}>
            <Lock className="w-4 h-4" />
            Pay ₹{grandTotal.toLocaleString()}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Demo mode — no real charge will be made
        </p>
      </div>
    );
  }

  // ── Summary ───────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Booking Summary</h2>

      {/* Event */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="flex gap-4 p-4">
          <img src={event.image} alt={event.title} className="w-24 h-32 rounded-lg object-cover" />
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">{event.title}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(event.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />{event.time}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />{event.venue}, {event.city}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="bg-muted rounded-2xl p-4 mb-6">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" /> Ticket Details
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tickets</span>
            <span className="font-medium text-foreground">{ticketCount}</span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium text-foreground">{selectedSeats.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Companion */}
      {companionEnabled && companion && (
        <div className="bg-muted rounded-2xl p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Your Companion
          </h4>
          <div className="flex items-center gap-3">
            <img src={companion.avatar} alt={companion.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-medium text-foreground">{companion.name}</p>
              <p className="text-sm text-muted-foreground">{companion.age} yrs • {companion.interests.slice(0,2).join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" /> Price Breakdown
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ticket Price</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Convenience Fee (5%)</span>
            <span>₹{convenience.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" size="lg" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="hero" size="lg" className="flex-1 gap-2" onClick={() => setPayStep('card')}>
          <CreditCard className="w-4 h-4" />
          Proceed to Pay
        </Button>
      </div>
    </div>
  );
};
