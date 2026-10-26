import express from 'express';
import { supabase, getAdminSupabase } from '../supabaseClient.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

const usedAttempts = new Set(); // Dev-only replay protection
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Middleware to verify student Supabase JWT
const verifyStudentSupabaseJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Invalid Supabase token' });
    }
    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// POST /api/tests/start - Start a secure attempt
router.post('/start', verifyStudentSupabaseJwt, async (req, res) => {
  try {
    const { testType, filters } = req.body;
    let finalQuestions = [];

    const adminSupabase = getAdminSupabase();

    if (testType === 'mock') {
      // Fetch specifically for mock
      const sections = [
        { subject: 'English', limit: 40 },
        { subject: 'General Aptitude', limit: 40 },
        { subject: 'Mathematics', limit: 50 },
        { subject: 'Physics', limit: 50 },
        { subject: 'Chemistry', limit: 20 },
      ];

      for (const sec of sections) {
        const { data, error } = await adminSupabase
          .from('questions')
          .select('*')
          .ilike('subject', sec.subject)
          .limit(sec.limit)
          .order('created_at', { ascending: false });
        if (error) throw error;
        finalQuestions.push(...data);
      }
    } else if (testType === 'sectional') {
      // Fetch specifically for sectional
      const { subject, chapter, topic } = filters || {};
      if (!subject) return res.status(400).json({ success: false, message: 'Subject is required for sectional' });

      let query = adminSupabase.from('questions').select('*').eq('subject', subject);
      if (chapter && chapter !== 'All Questions') query = query.eq('chapter', chapter);
      if (topic) query = query.eq('topic', topic);
      
      const { data, error } = await query.limit(50).order('created_at', { ascending: false });
      if (error) throw error;
      finalQuestions = data;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid testType' });
    }

    const questionIds = finalQuestions.map(q => q.id);
    const attemptId = crypto.randomUUID();

    const payload = { attemptId, testType, questionIds, userId: req.user.id };
    const attemptToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });

    // Strip answers before sending to client
    const sanitizedQuestions = finalQuestions.map(q => {
      const { correct_option, solution_steps, exam_tip, ...safeQ } = q;
      return safeQ;
    });

    res.json({ success: true, attemptToken, questions: sanitizedQuestions });
  } catch (err) {
    console.error('POST /api/tests/start error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/tests/evaluate - Evaluate a secure attempt
router.post('/evaluate', verifyStudentSupabaseJwt, async (req, res) => {
  try {
    const { attemptToken, answers } = req.body;
    if (!attemptToken || !answers) return res.status(400).json({ success: false, message: 'Missing token or answers' });

    let payload;
    try {
      payload = jwt.verify(attemptToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired attempt token' });
    }

    if (payload.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Token does not match user' });
    }

    if (usedAttempts.has(payload.attemptId)) {
      return res.status(400).json({ success: false, message: 'Attempt already evaluated' });
    }

    const adminSupabase = getAdminSupabase();
    
    // Fetch real answers for issued IDs only
    const { data: realQuestions, error } = await adminSupabase
      .from('questions')
      .select('*')
      .in('id', payload.questionIds);
      
    if (error) throw error;

    let correct = 0, incorrect = 0, skipped = 0;
    
    // Evaluate only issued IDs
    realQuestions.forEach(q => {
      // Support MockTestEngine key structure (`${sec.id}-${i}`) by checking value directly if the key is just the QID
      // But MockTestEngine passes answers differently? We will fix frontend to send `{ [q.id]: option }`
      const submittedOpt = answers[q.id];
      if (!submittedOpt) {
        skipped++;
      } else {
        const letter = submittedOpt.replace('option_', '');
        if (letter === q.correct_option) correct++;
        else incorrect++;
      }
    });

    usedAttempts.add(payload.attemptId);

    // Return exact correct/incorrect/skipped AND the full raw questions array so frontend can map the rest.
    res.json({
      success: true,
      correct,
      incorrect,
      skipped,
      questions: realQuestions
    });
  } catch (err) {
    console.error('POST /api/tests/evaluate error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
