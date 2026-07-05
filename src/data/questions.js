// This file acts as your main Question Database.
// Simply paste your real questions into the respective arrays below.
// Each question must follow this exact object structure.

const sampleQuestion = {
  question_text: "Sample Question Text",
  option_a: "Option A",
  option_b: "Option B",
  option_c: "Option C",
  option_d: "Option D",
  correct_option: "a", // 'a', 'b', 'c', or 'd'
  solution: "Explanation for the answer (optional)"
};

// 1. ENGLISH (40 Questions)
export const englishQuestions = [
  { ...sampleQuestion, question_text: "English Q1" },
  // ... Paste the remaining 39 English questions here
];

// 2. GENERAL APTITUDE (40 Questions)
export const aptitudeQuestions = [
  { ...sampleQuestion, question_text: "Aptitude Q1" },
  // ... Paste the remaining 39 Aptitude questions here
];

// 3. MATHEMATICS (50 Questions)
export const mathQuestions = [
  { ...sampleQuestion, question_text: "Math Q1" },
  // ... Paste the remaining 49 Math questions here
];

// 4. PHYSICS (50 Questions)
export const physicsQuestions = [
  { ...sampleQuestion, question_text: "Physics Q1" },
  // ... Paste the remaining 49 Physics questions here
];

// 5. CHEMISTRY (20 Questions)
export const chemistryQuestions = [
  { ...sampleQuestion, question_text: "Chemistry Q1" },
  // ... Paste the remaining 19 Chemistry questions here
];

// Combine them into a single database object for the Mock Engine to consume
export const fullMockDatabase = {
  'English': englishQuestions,
  'General Aptitude': aptitudeQuestions,
  'Mathematics': mathQuestions,
  'Physics': physicsQuestions,
  'Chemistry': chemistryQuestions
};

// For the Sectional Test, we can just export a flat array of 50 physics/math questions as a default
export const sectionalDatabase = [
  ...physicsQuestions
];
