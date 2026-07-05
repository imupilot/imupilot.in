// ---- Mock Data for IMUCET Dashboard ----
// Simulates AI-driven analytics and student progress data

export const studentProfile = {
  name: 'Arjun Menon',
  initials: 'AM',
  role: 'IMUCET Aspirant',
  streak: 12,
  joinedDays: 45,
};

export const dailyStats = {
  questionsAttempted: 47,
  questionsChange: '+12',
  accuracy: 78,
  accuracyChange: '+3.2%',
  studyHours: 4.5,
  studyHoursChange: '+0.5',
  testsCompleted: 3,
  testsChange: '+1',
};

export const overallProgress = {
  completed: 68,
  totalChapters: 96,
  physics: { done: 22, total: 30, percent: 73 },
  chemistry: { done: 20, total: 32, percent: 63 },
  mathematics: { done: 18, total: 22, percent: 82 },
  english: { done: 8, total: 12, percent: 67 },
};

export const weakChapters = [
  { rank: 1, name: 'Electromagnetic Induction', subject: 'Physics', score: 34, level: 'low' },
  { rank: 2, name: 'Chemical Bonding', subject: 'Chemistry', score: 38, level: 'low' },
  { rank: 3, name: 'Differential Equations', subject: 'Mathematics', score: 42, level: 'low' },
  { rank: 4, name: 'Coordination Compounds', subject: 'Chemistry', score: 48, level: 'medium' },
  { rank: 5, name: 'Wave Optics', subject: 'Physics', score: 51, level: 'medium' },
];

export const recentTests = [
  {
    id: 1,
    name: 'Full Mock Test #7',
    date: 'Today',
    duration: '2h 30m',
    score: 156,
    total: 200,
    percent: 78,
    subject: 'mixed',
  },
  {
    id: 2,
    name: 'Physics — Mechanics',
    date: 'Yesterday',
    duration: '45m',
    score: 32,
    total: 40,
    percent: 80,
    subject: 'physics',
  },
  {
    id: 3,
    name: 'Chemistry — Organic',
    date: '2 days ago',
    duration: '35m',
    score: 24,
    total: 40,
    percent: 60,
    subject: 'chemistry',
  },
  {
    id: 4,
    name: 'Mathematics — Calculus',
    date: '3 days ago',
    duration: '50m',
    score: 35,
    total: 40,
    percent: 88,
    subject: 'mathematics',
  },
];

export const aiSuggestions = [
  {
    id: 1,
    title: 'Revise Electromagnetic Induction',
    description: 'Your accuracy dropped 15% in this topic. Review NCERT Ch. 6 and attempt 10 targeted problems.',
    type: 'revision',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Take a Chemistry Mock Test',
    description: "You haven't tested Organic Chemistry in 5 days. A quick 20-question test will boost retention.",
    type: 'test',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Complete Differential Equations',
    description: "You're 3 problems away from finishing this chapter. Push through to strengthen your Math section.",
    type: 'practice',
    priority: 'medium',
  },
  {
    id: 4,
    title: 'Review Mistakes from Mock #7',
    description: 'You got 8 questions wrong in Physics. Analyzing errors now will prevent repeat mistakes.',
    type: 'review',
    priority: 'high',
  },
];

export const weeklyActivity = [
  65, 42, 78, 55, 88, 35, 72, 80, 45, 92, 60, 70, 48, 85,
  55, 75, 40, 90, 68, 52, 82, 45, 73, 58, 88, 42, 95, 70,
];

export const subjectColors = {
  physics: 'cyan',
  chemistry: 'green',
  mathematics: 'navy',
  english: 'amber',
  mixed: 'navy',
};
