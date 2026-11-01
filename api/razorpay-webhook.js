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

      let userEmail = payment?.notes?.email || payment?.email;
      let userName = payment?.notes?.name || 'Student';

      if (!userEmail && targetUserId) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name, name')
            .eq('id', targetUserId)
            .maybeSingle();
          if (profile?.email) userEmail = profile.email;
          if (profile?.full_name || profile?.name) userName = profile.full_name || profile.name;
        } catch (e) {
          console.warn('Could not fetch profile for confirmation email:', e);
        }
      }

      const amount = (payment.amount / 100).toLocaleString('en-IN');
      const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

      if (userEmail) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'IMUpilot <noreply@imupilot.in>',
            to: userEmail,
            subject: 'Payment Confirmed — IMUpilot Pro Activated ✓',
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0F172A;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;">IMUpilot</h1>
        </div>
        <div style="background:#F0FDF4;padding:16px;text-align:center;border-bottom:1px solid #E2E8F0;">
          <p style="margin:0;color:#0F172A;font-weight:700;">✓ Payment Successful — Pro Plan Activated</p>
        </div>
        <div style="padding:40px;background:#fff;">
          <h2 style="color:#0F172A;">You're now Pro, ${userName}!</h2>
          <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="margin:0 0 8px;color:#64748B;font-size:13px;">Plan: <strong style="color:#0F172A;">IMUpilot Pro</strong></p>
            <p style="margin:0 0 8px;color:#64748B;font-size:13px;">Amount: <strong style="color:#0F172A;">₹${amount}</strong></p>
            <p style="margin:0 0 8px;color:#64748B;font-size:13px;">Date: <strong style="color:#0F172A;">${date}</strong></p>
            <p style="margin:0;color:#64748B;font-size:13px;">Payment ID: <strong style="color:#0F172A;font-family:monospace;">${paymentId}</strong></p>
          </div>
          <a href="https://www.imupilot.in/dashboard" style="display:inline-block;background:#0F172A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Dashboard →</a>
        </div>
        <div style="background:#F8FAFC;padding:24px;text-align:center;border-top:1px solid #E2E8F0;">
          <p style="color:#94A3B8;font-size:12px;margin:0;">Keep this email as your payment receipt.</p>
        </div>
      </div>`
          }),
        }).catch(err => console.error('Payment email failed:', err));
      }
    }
  }

  res.status(200).json({ received: true });
}
