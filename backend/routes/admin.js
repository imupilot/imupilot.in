import express from 'express';
import jwt from 'jsonwebtoken';
import Question from '../models/Question.js';
import Test from '../models/Test.js';
import Flashcard from '../models/Flashcard.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'premium_imucet_secret_key';

// Admin Middleware Protection
const adminAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Requires Admin Role' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Apply protection to all routes
router.use(adminAuth);

// 1. Add Single Question
router.post('/question', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Bulk Upload Questions (Expecting Array of Objects from Frontend CSV parser)
router.post('/questions/bulk', async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ message: 'Must provide array of questions' });
    
    const result = await Question.insertMany(questions, { ordered: false });
    res.status(201).json({ message: `${result.length} questions inserted successfully.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Auto-Generate Test
router.post('/test/generate', async (req, res) => {
  try {
    const { name, subject, chapter, difficulty, total_questions, duration } = req.body;
    
    const filter = {};
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;

    // Fetch random slice of matching questions
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: total_questions } }
    ]);

    if (questions.length < total_questions) {
       return res.status(400).json({ message: 'Not enough questions in DB matching criteria' });
    }

    const test = new Test({
      name,
      type: 'chapter',
      duration,
      total_questions,
      questions: questions.map(q => q._id)
    });

    await test.save();
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Add Flashcard
router.post('/flashcard', async (req, res) => {
  try {
    const card = new Flashcard(req.body);
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
