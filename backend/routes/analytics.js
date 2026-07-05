import express from 'express';
import AdaptiveEngine from '../services/AdaptiveEngine.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();

// In-memory store — replace with Supabase/MongoDB insert when ready
const testResults = [];

/**
 * Route: POST /api/analytics/submit
 * Accepts a completed test submission and returns scored analytics.
 */
router.post('/submit', async (req, res) => {
  try {
    const { userId, testId, answers, timeTaken, questions } = req.body;

    if (!userId || !testId || !Array.isArray(answers) || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: 'Missing required fields: userId, testId, answers[], questions[]' });
    }

    // Build a lookup map from question id → question object
    const questionMap = {};
    for (const q of questions) {
      questionMap[q.id] = q;
    }

    let totalScore = 0;
    const subjectTotals = {};   // subject → { correct, total }
    const timings = Array.isArray(timeTaken) ? timeTaken : [];

    for (const answer of answers) {
      const { questionId, selectedOption } = answer;
      const q = questionMap[questionId];
      if (!q) continue;

      const subject = q.subject || 'Unknown';
      if (!subjectTotals[subject]) subjectTotals[subject] = { correct: 0, total: 0 };
      subjectTotals[subject].total += 1;

      if (selectedOption !== undefined && selectedOption !== null && selectedOption === q.correctAnswer) {
        totalScore += 1;
        subjectTotals[subject].correct += 1;
      }
    }

    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    const subjectBreakdown = {};
    for (const [subject, counts] of Object.entries(subjectTotals)) {
      subjectBreakdown[subject] = {
        correct: counts.correct,
        total: counts.total,
        accuracy: counts.total > 0 ? Math.round((counts.correct / counts.total) * 100) : 0
      };
    }

    const avgTimePerQuestion =
      timings.length > 0
        ? Math.round(timings.reduce((sum, t) => sum + t, 0) / timings.length)
        : null;

    const result = {
      userId,
      testId,
      submittedAt: new Date().toISOString(),
      score: totalScore,
      totalQuestions,
      accuracy,
      subjectBreakdown,
      avgTimePerQuestion
    };

    testResults.push(result);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('Submit error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * Route: GET /api/analytics/:userId
 * Fetches the personalized adaptive learning profile for a user.
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure analytics exist, if not try to build them
    let analytics = await Analytics.findOne({ user: userId });
    if (!analytics) {
      analytics = await AdaptiveEngine.updatePerformanceProfile(userId);
    }

    if (!analytics) {
      return res.status(200).json({ 
        message: 'No performance data found. Take a test to start adaptive tracking.',
        hasData: false 
      });
    }

    const recommendations = await AdaptiveEngine.getRecommendations(userId);

    res.status(200).json({
      hasData: true,
      overview: {
        accuracy: analytics.overallAccuracy,
        totalQuestions: analytics.totalQuestions,
        avgTimePerQuestion: analytics.avgTimePerQuestion,
        testsTaken: analytics.testsTaken
      },
      weakChapters: analytics.chapterPerformance.filter(c => c.accuracy < 50).slice(0, 5),
      moderateChapters: analytics.chapterPerformance.filter(c => c.accuracy >= 50 && c.accuracy <= 70).slice(0, 5),
      strongChapters: analytics.chapterPerformance.filter(c => c.accuracy > 70).slice(0, 5),
      allChapters: analytics.chapterPerformance,
      recommendations: recommendations.recommendedPractice,
      insights: recommendations.insights
    });
  } catch (err) {
    console.error("Analytics fetch error, providing mock fallback:", err.message);
    res.status(200).json({
      hasData: true,
      simulation: true,
      overview: { accuracy: 65, totalQuestions: 450, avgTimePerQuestion: 72, testsTaken: 12 },
      weakChapters: [
        { chapterName: 'Wave Optics', accuracy: 25, priorityScore: 0.85 },
        { chapterName: 'Integral Calculus', accuracy: 38, priorityScore: 0.72 }
      ],
      strongChapters: [
        { chapterName: 'Kinematics', accuracy: 92 },
        { chapterName: 'English Grammar', accuracy: 88 }
      ],
      recentTests: [
        { name: 'Full Mock Test 4', score: 142, total: 200, date: '2 days ago' },
        { name: 'Physics Chapter Test', score: 35, total: 50, date: '4 days ago' }
      ],
      recommendations: [
        { chapter: 'Wave Optics', type: 'Mini Practice Set', size: 15 },
        { chapter: 'Integral Calculus', type: 'Formula Drill', size: 10 }
      ],
      insights: [
        "DB Connection unavailable - showing simulated performance profile.",
        "High error rate in Wave Optics numericals detected.",
        "Time overuse in Mathematics (Avg 1m 45s) is hurting your score potential."
      ]
    });
  }
});

/**
 * Route: GET /api/analytics/package/:userId
 * Returns a complete revision package (Questions + Flashcards) for the user's top weak point.
 */
router.get('/package/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const packageData = await AdaptiveEngine.generateLearningPackage(userId);
    if (!packageData) {
      return res.status(200).json({ message: 'No adaptive package needed yet.', hasPackage: false });
    }
    res.status(200).json({ ...packageData, hasPackage: true });
  } catch (err) {
    console.error("Adaptive package fetch error, providing mock fallback:", err.message);
    res.status(200).json({
      hasPackage: true,
      simulation: true,
      subject: 'Physics',
      chapter: 'Wave Optics',
      accuracy: 25,
      content: {
        practiceQuestions: [
          { questionText: 'Simulated: What is the fringe width in YDSE?', options: ['λD/d', 'λd/D', 'Dd/λ', 'None'], correctOption: 0, difficulty: 'Medium' }
        ],
        flashcards: [],
        priorityReason: 'DB Connectivity Check: Using simulated high-priority set.'
      }
    });
  }
});

/**
 * Route: POST /api/analytics/recalculate/:userId
 * Forces a refresh of the user's adaptive profile based on all historical results.
 */
router.post('/recalculate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const analytics = await AdaptiveEngine.updatePerformanceProfile(userId);
    if (!analytics) {
      return res.status(404).json({ message: 'No results found for user.' });
    }
    res.status(200).json({ message: 'Adaptive profile updated', analytics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
