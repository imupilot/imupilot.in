import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'premium_imucet_secret_key';

// Dummy Razorpay keys for local testing if env is missing
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_imupilot';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_123';

const instance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Middleware to extract Auth user
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired or invalid token' });
  }
};

// 1. Create Order
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, planType } = req.body; // e.g. amount=79900 (for ₹799)

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${Math.random() * 10000 | 0}`,
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order', error: err.message });
  }
});

// 2. Verify Payment
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

    // To verify, we craft the HMAC SHA256 of "order_id|payment_id"
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment Successful -> Update User DB
      await User.findByIdAndUpdate(req.userId, {
        isPro: true,
        paymentStatus: planType === 'yearly' ? 'pro_yearly' : 'pro_monthly'
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully. Pro Account activated!',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature. Payment verification failed!',
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error verifying payment', error: err.message });
  }
});

export default router;
