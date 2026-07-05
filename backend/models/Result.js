import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  score: { type: Number, required: true },
  accuracy: { type: Number, required: true },// percentage
  timeSpent: { type: Number, required: true }, // in seconds
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number }, // nullable if skipped
    isCorrect: { type: Boolean },
    timeSpent: { type: Number } // time spent on this specific question
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Result', resultSchema);
