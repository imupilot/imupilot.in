import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'aspirant' },
  streak: { type: Number, default: 0 },
  isPro: { type: Boolean, default: false },
  paymentStatus: { type: String, default: 'free' },
  joinedDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
