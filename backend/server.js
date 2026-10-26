import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminAuthRoutes from './routes/adminAuth.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';
import questionRoutes from './routes/questions.js';
import testRoutes from './routes/tests.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);

// Server listen
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Welcome route
app.get('/', (req, res) => {
  res.send('IMUCET LMS API is running');
});
