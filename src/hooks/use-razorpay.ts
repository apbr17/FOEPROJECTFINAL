import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface PaymentOptions {
  amountPaise: number;
  eventId: string;
  eventTitle: string;
  seats: string;
  ticketCount: number;
  totalPrice: number;
  address: {
    name: string;
    email: string;
    phone: string;
    line1: string;
    city: string;
    pincode: string;
  };
  onSuccess: (bookingRef: string, paymentId: string) => void;
  onFailure: (msg: string) => void;
}

declare global {
  interface Window { Razorpay: any; }
}

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) { resolve(true); return; }
    const s = document.createElement('script');
    s.id  = 'razorpay-sdk';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export const useRazorpay = () => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const apiBase = import.meta.env.VITE_API_BASE || '';

  const startPayment = async (opts: PaymentOptions) => {
    setProcessing(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      opts.onFailure('Could not load Razorpay SDK. Check your internet connection.');
      setProcessing(false);
      return;
    }

    try {
      // Step 1 — Create order on backend
      const orderRes  = await fetch(`${apiBase}/payment.php`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:       'create_order',
          user_id:      (user as any)?.id ?? 0,
          amount_paise: opts.amountPaise,
        }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        opts.onFailure(orderData.message || 'Could not create payment order.');
        setProcessing(false);
        return;
      }

      // Step 2 — Open Razorpay checkout with full config
      const rzp = new window.Razorpay({
        key:         orderData.key_id,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'Companion',
        description: opts.eventTitle,
        order_id:    orderData.order_id,
        image:       'https://companion.app/logo.png',

        // Pre-fill from checkout address
        prefill: {
          name:    opts.address.name,
          email:   opts.address.email,
          contact: opts.address.phone,
        },

        // Shipping/billing address
        notes: {
          address: `${opts.address.line1}, ${opts.address.city} - ${opts.address.pincode}`,
          event:   opts.eventTitle,
          seats:   opts.seats,
        },

        // All payment methods enabled
        config: {
          display: {
            blocks: {
              utib: { name: 'Pay via UPI',    instruments: [{ method: 'upi' }] },
              card: { name: 'Pay via Card',   instruments: [{ method: 'card' }] },
              nb:   { name: 'Net Banking',    instruments: [{ method: 'netbanking' }] },
              wallet:{ name: 'Wallets',       instruments: [{ method: 'wallet' }] },
            },
            sequence: ['block.utib', 'block.card', 'block.nb', 'block.wallet'],
            preferences: { show_default_blocks: true },
          },
        },

        theme: { color: '#e63946' },

        modal: {
          ondismiss: () => {
            opts.onFailure('Payment cancelled.');
            setProcessing(false);
          },
        },

        // Step 3 — Verify after payment
        handler: async (response: any) => {
          try {
            const verifyRes  = await fetch(`${apiBase}/payment.php`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action:               'verify_payment',
                user_id:              (user as any)?.id ?? 0,
                razorpay_order_id:    response.razorpay_order_id,
                razorpay_payment_id:  response.razorpay_payment_id,
                razorpay_signature:   response.razorpay_signature,
                event_id:             opts.eventId,
                event_title:          opts.eventTitle,
                seats:                opts.seats,
                ticket_count:         opts.ticketCount,
                total_price:          opts.totalPrice,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              opts.onSuccess(verifyData.booking_ref, response.razorpay_payment_id);
            } else {
              opts.onFailure(verifyData.message || 'Payment verification failed.');
            }
          } catch {
            opts.onFailure('Could not verify payment. Contact support.');
          } finally {
            setProcessing(false);
          }
        },
      });

      rzp.open();
    } catch (e: any) {
      opts.onFailure(e?.message || 'Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  return { startPayment, processing };
};
