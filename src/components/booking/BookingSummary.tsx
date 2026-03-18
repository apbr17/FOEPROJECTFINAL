import { Calendar, Clock, MapPin, Ticket, User, CreditCard, Check, Lock,
         AlertCircle, RefreshCw, Phone, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Event, Companion } from '@/data/mockData';
import { useState } from 'react';
import { useRazorpay } from '@/hooks/use-razorpay';
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

type Step = 'summary' | 'address' | 'paying' | 'confirmed' | 'refund' | 'refunded';

export const BookingSummary = ({
  event, ticketCount, selectedSeats, companion,
  companionEnabled, totalPrice, onBack, onConfirm,
}: BookingSummaryProps) => {
  const { user, isLoggedIn } = useAuth();
  const { startPayment, processing } = useRazorpay();
  const [step,         setStep]         = useState<Step>('summary');
  const [paymentError, setPaymentError] = useState('');
  const [bookingRef,   setBookingRef]   = useState('');
  const [paymentId,    setPaymentId]    = useState('');
  const [refunding,    setRefunding]    = useState(false);
  const [refundMsg,    setRefundMsg]    = useState('');

  // Checkout address form
  const [address, setAddress] = useState({
    name:    user ? `${(user as any).firstName} ${(user as any).lastName}` : '',
    email:   (user as any)?.email ?? '',
    phone:   '',
    line1:   '',
    city:    event.city,
    pincode: '',
  });
  const [addrErrors, setAddrErrors] = useState<Record<string,string>>({});

  const convenience  = Math.round(totalPrice * 0.05);
  const grandTotal   = totalPrice + convenience;
  const grandPaise   = grandTotal * 100;
  const apiBase      = import.meta.env.VITE_API_BASE || '';

  // ── Validate address ──────────────────────────────────────
  const validateAddress = () => {
    const err: Record<string,string> = {};
    if (!address.name.trim())    err.name    = 'Required';
    if (!address.email.trim())   err.email   = 'Required';
    if (!/^[6-9]\d{9}$/.test(address.phone)) err.phone = 'Enter valid 10-digit mobile';
    if (!address.line1.trim())   err.line1   = 'Required';
    if (!address.city.trim())    err.city    = 'Required';
    if (!/^\d{6}$/.test(address.pincode)) err.pincode = 'Enter valid 6-digit pincode';
    setAddrErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Start Razorpay ────────────────────────────────────────
  const handlePay = () => {
    setPaymentError('');
    setStep('paying');
    startPayment({
      amountPaise:  grandPaise,
      eventId:      event.id,
      eventTitle:   event.title,
      seats:        selectedSeats.join(', ') || `General x${ticketCount}`,
      ticketCount,
      totalPrice:   grandTotal,
      address,
      onSuccess: (ref, pid) => {
        setBookingRef(ref);
        setPaymentId(pid);
        setStep('confirmed');
        onConfirm();
      },
      onFailure: (msg) => {
        setPaymentError(msg);
        setStep('address');
      },
    });
  };

  // ── Refund ────────────────────────────────────────────────
  const handleRefund = async () => {
    setRefunding(true);
    try {
      const res  = await fetch(`${apiBase}/refund.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:     (user as any)?.id ?? 0,
          booking_ref: bookingRef,
          reason:      'customer_request',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRefundMsg(data.note || 'Refund initiated successfully.');
        setStep('refunded');
      } else {
        setRefundMsg(data.message || 'Refund failed. Contact support.');
        setStep('refund');
      }
    } catch {
      setRefundMsg('Could not reach server. Contact support with ref: ' + bookingRef);
    } finally {
      setRefunding(false);
    }
  };

  const field = (
    key: keyof typeof address,
    label: string,
    placeholder: string,
    type = 'text',
    maxLen?: number
  ) => (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
      <input
        type={type}
        value={address[key]}
        onChange={e => setAddress(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        maxLength={maxLen}
        className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-sm text-foreground
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {addrErrors[key] && <p className="text-red-400 text-xs mt-1">{addrErrors[key]}</p>}
    </div>
  );

  // ── STEP: Refunded ────────────────────────────────────────
  if (step === 'refunded') {
    return (
      <div className="animate-scale-in text-center py-12">
        <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/30 rounded-full
          flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-3">Refund Initiated</h2>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{refundMsg}</p>
        <div className="bg-muted rounded-xl p-4 max-w-sm mx-auto text-left text-sm space-y-2 mb-8">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Ref</span>
            <span className="font-mono font-bold">{bookingRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Refund Amount</span>
            <span className="font-bold text-green-500">₹{grandTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timeline</span>
            <span>5–7 business days</span>
          </div>
        </div>
        <Button variant="hero" onClick={() => window.location.reload()}>Back to Events</Button>
      </div>
    );
  }

  // ── STEP: Confirmed ───────────────────────────────────────
  if (step === 'confirmed' || step === 'refund') {
    return (
      <div className="animate-scale-in">
        <div className="text-center py-8">
          <div className="w-20 h-20 gradient-hero rounded-full flex items-center justify-center
            mx-auto mb-5 shadow-lg shadow-primary/30">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground">Payment received. Enjoy the event!</p>
        </div>

        {/* Order details */}
        <div className="bg-muted rounded-2xl p-5 mb-6 space-y-3 text-sm">
          <h3 className="font-semibold text-foreground mb-3">Order Details</h3>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Ref</span>
            <span className="font-mono font-bold text-foreground">{bookingRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-xs text-foreground truncate max-w-[160px]">{paymentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event</span>
            <span className="font-medium text-foreground text-right max-w-[160px]">{event.title}</span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium">{selectedSeats.join(', ')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery Address</span>
            <span className="text-right max-w-[160px] text-xs">{address.line1}, {address.city}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="font-semibold text-foreground">Amount Paid</span>
            <span className="font-bold text-primary text-lg">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Refund section */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-red-400" /> Refund Policy
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cancel within 24 hours for a full refund. Refund will be credited to your original payment method in 5–7 business days.
          </p>
          {step === 'refund' && refundMsg && (
            <p className="text-sm text-red-400 mb-3">{refundMsg}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
            onClick={() => step === 'refund' ? handleRefund() : setStep('refund')}
            disabled={refunding}
          >
            {refunding
              ? <><div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />Processing…</>
              : step === 'refund'
                ? 'Confirm Cancellation & Refund'
                : <><RefreshCw className="w-4 h-4" /> Request Refund</>
            }
          </Button>
          {step === 'refund' && (
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setStep('confirmed')}>
              Keep Booking
            </Button>
          )}
        </div>

        <Button variant="hero" size="lg" className="w-full" onClick={() => window.location.reload()}>
          Browse More Events
        </Button>
      </div>
    );
  }

  // ── STEP: Paying (spinner while Razorpay modal is open) ───
  if (step === 'paying') {
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
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Opening Payment Gateway</h3>
          <p className="text-muted-foreground text-sm">Complete payment in the Razorpay window…</p>
        </div>
        <div className="max-w-xs mx-auto space-y-2 text-sm text-muted-foreground">
          {['UPI / QR Code', 'Debit & Credit Cards', 'Net Banking', 'Wallets (Paytm, PhonePe)'].map(m => (
            <div key={m} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" /> {m}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── STEP: Checkout Address ────────────────────────────────
  if (step === 'address') {
    return (
      <div className="animate-fade-in">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" /> Checkout Details
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          We'll send your e-tickets and booking confirmation here.
        </p>

        {/* Amount reminder */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex justify-between items-center">
          <span className="text-muted-foreground">Total to pay</span>
          <span className="text-2xl font-bold text-primary">₹{grandTotal.toLocaleString()}</span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {field('name',  'Full Name',  'As on your ID')}
            {field('phone', 'Mobile No.', '10-digit number', 'tel', 10)}
          </div>
          {field('email', 'Email',          'For e-ticket delivery', 'email')}
          {field('line1', 'Address Line 1', 'House / Flat / Street')}
          <div className="grid grid-cols-2 gap-4">
            {field('city',    'City',    'City')}
            {field('pincode', 'Pincode', '6-digit PIN', 'text', 6)}
          </div>
        </div>

        {paymentError && (
          <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {paymentError}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Lock className="w-3.5 h-3.5 text-green-500" />
          Secured by Razorpay · 256-bit SSL encryption
        </div>

        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep('summary')}>
            Back
          </Button>
          <Button variant="hero" size="lg" className="flex-1 gap-2"
            onClick={() => { if (validateAddress()) handlePay(); }}
            disabled={processing}
          >
            <Lock className="w-4 h-4" />
            Pay ₹{grandTotal.toLocaleString()}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Accepts UPI · Cards · Net Banking · Wallets
        </p>
      </div>
    );
  }

  // ── STEP: Summary ─────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Booking Summary</h2>

      {/* Event card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="flex gap-4 p-4">
          <img src={event.image} alt={event.title} className="w-24 h-32 rounded-lg object-cover" />
          <div className="flex-1 space-y-1.5 text-sm text-muted-foreground">
            <h3 className="font-display text-lg font-semibold text-foreground">{event.title}</h3>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />
              {new Date(event.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </div>
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{event.time}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{event.venue}, {event.city}</div>
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
            <span className="font-medium">{ticketCount}</span>
          </div>
          {selectedSeats.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium">{selectedSeats.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Companion */}
      {companionEnabled && companion && (
        <div className="bg-muted rounded-2xl p-4 mb-6">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Companion
          </h4>
          <div className="flex items-center gap-3">
            <img src={companion.avatar} alt={companion.name} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-medium text-foreground">{companion.name}</p>
              <p className="text-sm text-muted-foreground">{companion.age} yrs · {companion.interests.slice(0,2).join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Price breakdown */}
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

      {/* Payment methods preview */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        {['UPI', 'Cards', 'Net Banking', 'Wallets'].map(m => (
          <span key={m} className="text-xs px-3 py-1.5 bg-muted rounded-lg text-muted-foreground border border-border">
            {m}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" size="lg" className="flex-1" onClick={onBack}>Back</Button>
        <Button variant="hero" size="lg" className="flex-1 gap-2" onClick={() => setStep('address')}>
          <CreditCard className="w-4 h-4" /> Proceed to Pay
        </Button>
      </div>
    </div>
  );
};
