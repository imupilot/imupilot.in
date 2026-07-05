import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correct_option: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  explanation: { type: String },
  subject: { type: String, required: true, index: true },
  chapter: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true, index: true },
  type: { type: String, enum: ['mock', 'chapter', 'pyq'], required: true, index: true },
  year: { type: Number }, // Optional, mostly for pyq
  ncertReference: { type: String }
}, { timestamps: true });

// Compound index for generating tests quickly
questionSchema.index({ subject: 1, chapter: 1, difficulty: 1 });

export default mongoose.model('Question', questionSchema);
