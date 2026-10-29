import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Verify signature
  const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expected) {
    console.warn('Invalid signature received for Razorpay webhook');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = req.body?.event;

  if (event === 'payment.captured') {
    const payment = req.body?.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;

    // Find the payment_request by order_id
    let targetUserId = null;
    if (orderId) {
      const { data: paymentRequest } = await supabase
        .from('payment_requests')
        .select('user_id')
        .eq('razorpay_order_id', orderId)
        .maybeSingle();

      if (paymentRequest?.user_id) {
        targetUserId = paymentRequest.user_id;
      }
    }

    // Fallback: check payment notes for user_id
    if (!targetUserId && payment?.notes?.user_id) {
      targetUserId = payment.notes.user_id;
    }

    if (targetUserId) {
      // Upgrade user to pro
      await supabase
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('id', targetUserId);

      // Update payment_requests status
      if (orderId) {
        await supabase
          .from('payment_requests')
          .update({ status: 'activated', razorpay_payment_id: paymentId })
          .eq('razorpay_order_id', orderId);
      }
    }
  }

  res.status(200).json({ received: true });
}
