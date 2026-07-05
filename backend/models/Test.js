import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['mock', 'chapter'], required: true, index: true },
  duration: { type: Number, required: true }, // in minutes
  total_questions: { type: Number, required: true },
  
  // This array natively acts as the "Test_Questions" junction table in MongoDB.
  // It handles Many-to-Many relationships gracefully and scales effortlessly.
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Test', testSchema);
