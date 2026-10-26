import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// In-memory rate limiting map
// Note: This is per-backend-instance and resets on server restart.
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  const record = rateLimitMap.get(ip) || { count: 0, firstAttempt: now };
  
  if (now - record.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    record.count = 1;
    record.firstAttempt = now;
  } else {
    record.count++;
  }
  
  rateLimitMap.set(ip, record);
  
  if (record.count > MAX_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }
  
  next();
};

router.post('/login', loginRateLimiter, (req, res) => {
  const { password } = req.body;
  
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  
  // Fail closed if required configuration is missing
  if (!adminPassword || !jwtSecret) {
    console.error('Server configuration error: ADMIN_PASSWORD or JWT_SECRET is missing');
    return res.status(500).json({ error: 'Internal server error: Auth misconfigured' });
  }
  
  if (password === adminPassword) {
    // Issue a short-lived JWT with explicit admin role
    const token = jwt.sign(
      { role: 'admin' }, 
      jwtSecret, 
      { expiresIn: '1h' }
    );
    
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Middleware to verify the short-lived admin JWT
export const verifyAdminJwt = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return res.status(500).json({ error: 'Internal server error' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Requires Admin Role' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is not valid or expired' });
  }
};

export default router;
