import Analytics from '../models/Analytics.js';
import Result from '../models/Result.js';
import Question from '../models/Question.js';
import Flashcard from '../models/Flashcard.js';

/**
 * AdaptiveEngine
 * Handles the logic for classifying performance and ranking chapters.
 */
class AdaptiveEngine {
  
  /**
   * Recalculates all analytics for a specific user after a new test result.
   */
  static async updatePerformanceProfile(userId) {
    const results = await Result.find({ user: userId }).populate('answers.question');
    if (!results.length) return null;

    let analytics = await Analytics.findOne({ user: userId });
    if (!analytics) {
      analytics = new Analytics({ user: userId });
    }

    const chapters = {}; 

    results.forEach(res => {
      res.answers.forEach(ans => {
        const q = ans.question;
        if (!q) return;

        if (!chapters[q.chapter]) {
          chapters[q.chapter] = { 
            name: q.chapter, 
            subject: q.subject, 
            correct: 0, 
            total: 0, 
            time: 0, 
            mistakes: 0 
          };
        }

        const stats = chapters[q.chapter];
        stats.total++;
        stats.time += ans.timeSpent || 0;

        if (ans.isCorrect) {
          stats.correct++;
        } else if (ans.selectedOption !== null) {
          stats.mistakes++;
        }
      });
    });

    const performanceArray = Object.values(chapters).map(stats => {
      const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
      const avgTime = stats.total > 0 ? stats.time / stats.total : 0;
      const targetTime = 60;
      const timeOveruseFactor = Math.max(0, (avgTime - targetTime) / targetTime);
      const mistakeWeight = Math.min(1, stats.mistakes / 10);

      const priorityScore = (1 - accuracy) * 0.5 + (timeOveruseFactor) * 0.2 + (mistakeWeight) * 0.3;

      return {
        chapterName: stats.name,
        subject: stats.subject,
        accuracy: Math.round(accuracy * 100),
        avgTime: Math.round(avgTime),
        recentMistakesCount: stats.mistakes,
        priorityScore: parseFloat(priorityScore.toFixed(3)),
        lastAttempted: new Date()
      };
    });

    analytics.chapterPerformance = performanceArray.sort((a, b) => b.priorityScore - a.priorityScore);
    analytics.overallAccuracy = Math.round((results.reduce((acc, r) => acc + r.accuracy, 0)) / results.length);
    analytics.totalQuestions = results.reduce((acc, r) => acc + r.answers.length, 0);
    analytics.testsTaken = results.length;
    analytics.lastUpdated = new Date();

    await analytics.save();
    return analytics;
  }

  /**
   * Generates a complete learning package for top weak chapters
   */
  static async generateLearningPackage(userId) {
    const analytics = await Analytics.findOne({ user: userId });
    if (!analytics) return null;

    // Filter to find the absolute top priority weak chapter
    const topWeak = analytics.chapterPerformance.find(c => c.accuracy < 50) || analytics.chapterPerformance[0];
    if (!topWeak) return null;

    // 4. Generate Content (Practice, Revision, Flashcards)
    const [practiceSet, flashcards] = await Promise.all([
      Question.find({ chapter: topWeak.chapterName }).limit(15),
      Flashcard.find({ chapter: topWeak.chapterName }).limit(10)
    ]);

    return {
      chapter: topWeak.chapterName,
      subject: topWeak.subject,
      accuracy: topWeak.accuracy,
      content: {
        practiceQuestions: practiceSet,
        flashcards: flashcards,
        priorityReason: topWeak.priorityScore > 0.6 ? 'High priority due to accuracy/time deficit' : 'Standard review suggested'
      }
    };
  }

  static async getRecommendations(userId) {
    const analytics = await Analytics.findOne({ user: userId });
    if (!analytics) return { weakTopics: [], recommendations: [] };

    const priorityTopics = analytics.chapterPerformance.slice(0, 3);
    const topWeak = priorityTopics[0];

    // Build Rule-Based Insights
    const insights = [];
    
    // 1. Weakness Rule
    if (topWeak && topWeak.accuracy < 50) {
      insights.push(`Your performance in ${topWeak.chapterName} is weak (<50%) and needs surgical revision.`);
    }

    // 2. Time Efficiency Rule (High time + low accuracy)
    const timeInefficient = analytics.chapterPerformance.find(c => c.avgTime > 90 && c.accuracy < 60);
    if (timeInefficient) {
      insights.push(`You are spending too much time (~${timeInefficient.avgTime}s/Q) inefficiently on ${timeInefficient.chapterName}.`);
    }

    // 3. Easy Scoring Rule (Difficulty Accuracy)
    if (analytics.difficultyAccuracy && analytics.difficultyAccuracy.Easy < 75) {
      insights.push("You are missing easy scoring opportunities. Focus on high-yield basics to secure your floor.");
    }

    // 4. Trend Rule (Simplified check against overall)
    if (analytics.overallAccuracy < 60) {
      insights.push("Recent performance trend is dipping. Immediate intervention in core subjects required.");
    }

    // 5. Strategic Recommendation
    if (topWeak) {
      insights.push(`Action Plan: Complete the 15-question mini-set for ${topWeak.chapterName} to boost your percentile.`);
    }

    return {
      weakTopics: priorityTopics.map(t => ({
        name: t.chapterName,
        accuracy: t.accuracy,
        priority: t.priorityScore > 0.7 ? 'Critical' : 'High'
      })),
      recommendedPractice: priorityTopics.map(t => ({
        chapter: t.chapterName,
        type: 'Mini Practice Set',
        size: 15,
        targetImprovement: '+15%'
      })),
      insights: insights.slice(0, 5) // Return 3-5 clear insights
    };
  }
}

export default AdaptiveEngine;
