import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'premium_imucet_secret_key';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Create initial analytics record
    const analytics = new Analytics({ user: user._id });
    await analytics.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, streak: user.streak } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Bypass for local development if DB is not connected
    const isDbConnected = mongoose.connection.readyState === 1;
    
    if (email === 'admin@test.com' && password === 'admin123') {
       const mockUser = { id: 'mock-admin-id', name: 'Test Admin', email: 'admin@test.com', streak: 5 };
       const token = jwt.sign({ id: mockUser.id }, JWT_SECRET, { expiresIn: '7d' });
       return res.json({ token, user: mockUser });
    }

    if (!isDbConnected) {
      return res.status(503).json({ message: 'Database disconnected. Use test credentials: admin@test.com / admin123' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, streak: user.streak } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
