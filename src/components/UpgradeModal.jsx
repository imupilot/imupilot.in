import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function UpgradeModal({
  isOpen = true,
  onClose,
  userId,
  title = 'Upgrade to Pro',
  subtitle = 'Unlock all Mock Tests, Notes, and premium content'
}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (isOpen === false) return null;

  async function handlePayment() {
    try {
      setLoading(true);
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: authData } = await supabase.auth.getUser();
        targetUserId = authData?.user?.id;
        if (!targetUserId) {
          try {
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            targetUserId = localUser?.id;
          } catch (e) {}
        }
      }

      const res = await fetch('/api/create-order', { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment order. Please ensure Razorpay keys are configured.');
      }
      const order = await res.json();

      if (typeof window.Razorpay === 'undefined') {
        alert('Razorpay SDK is still loading. Please try again in a few seconds.');
        setLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'IMUpilot',
        description: 'Pro Plan — Unlock Everything',
        order_id: order.id,
        handler: async function (response) {
          try {
            await supabase.from('payment_requests').insert({
              user_id: targetUserId,
              amount: 999,
              status: 'paid',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
            });
          } catch (dbErr) {
            console.error('Error saving payment record:', dbErr);
          }
          alert('Payment successful! Admin will activate your Pro plan shortly.');
          onClose();
        },
        prefill: {},
        theme: { color: '#1a2f5a' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        alert('Payment failed: ' + (resp.error?.description || 'Transaction declined'));
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Error initiating payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
    >
      <div style={{
        background: 'var(--bg-primary, #ffffff)', borderRadius: '16px',
        padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: 'var(--accent-navy, #1a2f5a)', marginBottom: '0.5rem', fontWeight: 750 }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary, #64748B)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {subtitle}
        </p>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-navy, #1a2f5a)', marginBottom: '1.5rem' }}>
          ₹999 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>one-time</span>
        </div>
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            background: 'var(--accent-navy, #1a2f5a)', color: 'white',
            border: 'none', borderRadius: '8px', padding: '0.8rem 2rem',
            fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', width: '100%', marginBottom: '0.8rem',
            opacity: loading ? 0.7 : 1, transition: 'opacity 0.15s'
          }}
        >
          {loading ? 'Initiating...' : 'Pay ₹999 — Unlock Pro'}
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', color: 'var(--text-secondary, #64748B)',
            border: 'none', cursor: 'pointer', fontSize: '0.9rem'
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
