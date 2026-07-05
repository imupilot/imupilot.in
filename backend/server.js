import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';
import questionRoutes from './routes/questions.js';
import testRoutes from './routes/tests.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/imucet-lms';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Continue running explicitly for local testing even if DB fails initially
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB not connected)`));
  });

// Welcome route
app.get('/', (req, res) => {
  res.send('IMUCET LMS API is running');
});
