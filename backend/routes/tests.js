import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// GET /api/tests — all tests
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, tests: data });
  } catch (err) {
    console.error('GET /api/tests error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/tests/:id/questions — all questions for a test via test_questions join
router.get('/:id/questions', async (req, res) => {
  try {
    const { data: test, error: testErr } = await supabase
      .from('tests')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (testErr) throw testErr;
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    const { data: links, error: linkErr } = await supabase
      .from('test_questions')
      .select('question_id')
      .eq('test_id', req.params.id);

    if (linkErr) throw linkErr;

    const questionIds = links.map((l) => l.question_id);

    let questions = [];
    if (questionIds.length > 0) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .in('id', questionIds);
      if (error) throw error;
      questions = data;
    }

    res.json({ success: true, test, questions });
  } catch (err) {
    console.error('GET /api/tests/:id/questions error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
