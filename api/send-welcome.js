export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { email, name } = body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'IMUpilot <noreply@imupilot.in>',
        to: email,
        subject: 'Welcome to IMUpilot — Start Preparing for IMUCET',
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0F172A;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;">IMUpilot</h1>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">IMUCET + DNS Sponsorship Preparation</p>
        </div>
        <div style="padding:40px;background:#fff;">
          <h2 style="color:#0F172A;">Welcome aboard, ${name || 'Aspirant'}!</h2>
          <p style="color:#64748B;">You've joined India's most focused IMUCET prep platform.</p>
          <p style="color:#0F172A;">✓ Mock Tests &nbsp;✓ Topic Notes &nbsp;✓ Smart Analytics &nbsp;✓ DNS Prep</p>
          <a href="https://www.imupilot.in/dashboard" style="display:inline-block;background:#0F172A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:24px;">Start Preparing →</a>
          <p style="color:#94A3B8;font-size:13px;margin-top:32px;">Free plan includes 3 mock tests. <a href="https://www.imupilot.in/pricing" style="color:#0F172A;">Upgrade to Pro (₹999)</a> for unlimited access.</p>
        </div>
        <div style="background:#F8FAFC;padding:24px;text-align:center;border-top:1px solid #E2E8F0;">
          <p style="color:#94A3B8;font-size:12px;margin:0;">© 2025 IMUpilot · imupilot.in</p>
        </div>
      </div>`,
      }),
    });

    if (!response.ok) return res.status(500).json({ error: 'Failed to send email' });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Send welcome email error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
