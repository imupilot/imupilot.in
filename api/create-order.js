export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const userId = body.userId || body.user_id;
    let email = body.email || body.user_email;
    let name = body.name || body.userName || body.full_name;

    if (userId && (!email || !name)) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
        );
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, name')
          .eq('id', userId)
          .maybeSingle();
        if (profile?.email && !email) email = profile.email;
        if ((profile?.full_name || profile?.name) && !name) name = profile.full_name || profile.name;
      } catch (err) {
        console.warn('Could not fetch user profile for order notes:', err);
      }
    }

    const orderOptions = {
      amount: 99900, // ₹999 in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        ...(userId ? { user_id: userId } : {}),
        ...(email ? { email } : {}),
        ...(name ? { name } : {}),
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
  }
}
