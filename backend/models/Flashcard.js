import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  subject: { type: String, required: true, index: true },
  chapter: { type: String, required: true, index: true },
  front_text: { type: String, required: true },
  back_text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound index for fast retrieval of chapter-wise revision decks
flashcardSchema.index({ subject: 1, chapter: 1 });

export default mongoose.model('Flashcard', flashcardSchema);
