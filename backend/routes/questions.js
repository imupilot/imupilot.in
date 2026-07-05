import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// GET /api/questions — list questions with optional filters
router.get('/', async (req, res) => {
  try {
    const { subject, chapter, limit = 50 } = req.query;

    let query = supabase.from('questions').select('*');
    if (subject) query = query.ilike('subject', subject);
    if (chapter) query = query.ilike('chapter', chapter);
    query = query.limit(parseInt(limit, 10)).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, questions: data, count: data.length });
  } catch (err) {
    console.error('GET /api/questions error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/questions/:id — single question by id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Question not found' });

    res.json({ success: true, question: data });
  } catch (err) {
    console.error('GET /api/questions/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/questions — insert single question (no auth for now, add admin middleware later)
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, question: data });
  } catch (err) {
    console.error('POST /api/questions error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
