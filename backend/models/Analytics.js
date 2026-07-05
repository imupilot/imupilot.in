import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Overall Execution
  overallAccuracy: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  testsTaken: { type: Number, default: 0 },
  avgTimePerQuestion: { type: Number, default: 0 }, // in seconds
  skippedQuestions: { type: Number, default: 0 },

  // Subject Metrics
  subjectStats: [{
    subject: { type: String, enum: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Aptitude'] },
    accuracy: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }
  }],

  // Detailed Chapter Analytics
  chapterPerformance: [{
    chapterName: { type: String },
    subject: { type: String },
    accuracy: { type: Number, default: 0 },
    avgTime: { type: Number, default: 0 },
    recentMistakesCount: { type: Number, default: 0 },
    priorityScore: { type: Number, default: 0 },
    status: { type: String, enum: ['Weak', 'Moderate', 'Strong'], default: 'Moderate' },
    lastAttempted: { type: Date }
  }],

  // Difficulty Analysis
  difficultyAccuracy: {
    Easy: { type: Number, default: 0 },
    Medium: { type: Number, default: 0 },
    Hard: { type: Number, default: 0 }
  },

  // Historical Trend (Last 10 result IDs)
  recentTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Result' }],
  
  lastUpdated: { type: Date, default: Date.now }
});

// Middleware to automatically set status based on accuracy before saving
analyticsSchema.pre('save', function(next) {
  this.chapterPerformance.forEach(chap => {
    if (chap.accuracy < 50) chap.status = 'Weak';
    else if (chap.accuracy <= 70) chap.status = 'Moderate';
    else chap.status = 'Strong';
  });
  next();
});

export default mongoose.model('Analytics', analyticsSchema);
