import express from 'express';
import { supabase, getAdminSupabase } from '../supabaseClient.js';
import { verifyAdminJwt } from './adminAuth.js';

const router = express.Router();

// GET /api/questions ?" list questions with optional filters (public/student)
router.get('/', async (req, res) => {
  try {
    const { subject, chapter, limit = 50 } = req.query;

    const adminSupabase = getAdminSupabase();
    let query = adminSupabase.from('questions').select('*');
    if (subject && typeof subject === 'string') query = query.ilike('subject', subject);
    if (chapter && typeof chapter === 'string') query = query.ilike('chapter', chapter);

    // Cap limit to avoid massive queries
    const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);
    query = query.limit(safeLimit).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Secure Attempt Plan: Strip answer fields from public reads
    const sanitizedData = data.map(q => {
      const { correct_option, solution_steps, exam_tip, ...safeQ } = q;
      return safeQ;
    });

    res.json({ success: true, questions: sanitizedData, count: sanitizedData.length });
  } catch (err) {
    console.error('GET /api/questions error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/questions/admin/all ?" list questions for admin (ADMIN ONLY)
router.get('/admin/all', verifyAdminJwt, async (req, res) => {
  try {
    const { limit = 500 } = req.query;
    const safeLimit = Math.min(parseInt(limit, 10) || 500, 1000);
    
    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('questions')
      .select('id,subject,chapter,topic_tag,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,concept,solution_steps,exam_tip,year')
      .order('created_at', { ascending: false })
      .limit(safeLimit);

    if (error) throw error;
    res.json({ success: true, questions: data, count: data.length });
  } catch (err) {
    console.error('GET /api/questions/admin/all error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET /api/questions/:id ?" single question by id (public/student)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }
      throw error;
    }

    // Secure Attempt Plan: Strip answer fields from public reads
    const { correct_option, solution_steps, exam_tip, ...safeQuestion } = data;

    res.json({ success: true, question: safeQuestion });
  } catch (err) {
    console.error('GET /api/questions/:id error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/questions/bulk ?" bulk import/upsert (ADMIN ONLY)
// Note: Placed BEFORE /:id to prevent routing conflicts
router.post('/bulk', verifyAdminJwt, async (req, res) => {
  try {
    const questions = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Request body must be an array of questions' });
    }

    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Array cannot be empty' });
    }

    // Basic validation on entries
    const invalidEntryIndex = questions.findIndex(q => !q.subject || !q.question_text);
    if (invalidEntryIndex !== -1) {
      return res.status(400).json({
        success: false,
        message: `Malformed entry at index ${invalidEntryIndex}. 'subject' and 'question_text' are required.`
      });
    }

    const adminSupabase = getAdminSupabase();

    const { data, error } = await adminSupabase
      .from('questions')
      .upsert(questions)
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, count: data ? data.length : 0, message: 'Bulk import successful' });
  } catch (err) {
    console.error('POST /api/questions/bulk error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// POST /api/questions ?" insert single question (ADMIN ONLY)
router.post('/', verifyAdminJwt, async (req, res) => {
  try {
    const { subject, question_text } = req.body;

    if (!subject || !question_text) {
      return res.status(400).json({ success: false, message: 'Fields subject and question_text are required' });
    }

    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from('questions')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, question: data });
  } catch (err) {
    console.error('POST /api/questions error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// PUT /api/questions/:id ?" update single question (ADMIN ONLY)
router.put('/:id', verifyAdminJwt, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Request body cannot be empty' });
    }

    const adminSupabase = getAdminSupabase();

    // Prevent updating ID
    const updatePayload = { ...req.body };
    delete updatePayload.id;
    delete updatePayload.created_at;

    const { data, error } = await adminSupabase
      .from('questions')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }
      throw error;
    }

    res.json({ success: true, question: data });
  } catch (err) {
    console.error('PUT /api/questions/:id error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// DELETE /api/questions/:id ?" delete single question (ADMIN ONLY)
router.delete('/:id', verifyAdminJwt, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    const adminSupabase = getAdminSupabase();

    // First check if it exists so we can return 404 properly
    const { data: existing, error: checkError } = await adminSupabase
      .from('questions')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }
      throw checkError;
    }

    const { error } = await adminSupabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/questions/:id error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

export default router;
