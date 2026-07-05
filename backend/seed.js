import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!serviceKey && !anonKey) {
  console.error('No Supabase key found. Set SUPABASE_SERVICE_ROLE_KEY in .env for seeding.');
  process.exit(1);
}

if (!serviceKey) {
  console.warn('WARNING: No SUPABASE_SERVICE_ROLE_KEY found. Using anon key — this will fail if RLS is enabled.');
  console.warn('Add SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> to your root .env file.\n');
}

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

const seedQuestions = [
  {
    subject: 'Physics',
    chapter: 'Laws of Motion',
    topic_tag: 'units-and-measurement',
    difficulty: 'easy',
    question_text: 'What is the SI unit of force?',
    option_a: 'Joule',
    option_b: 'Newton',
    option_c: 'Watt',
    option_d: 'Pascal',
    correct_option: 'b',
    concept: 'Force is a vector quantity measured in Newtons.',
    solution_steps: '1 Newton = 1 kg·m/s². It is the force needed to accelerate 1 kg by 1 m/s².',
    exam_tip: 'Don\'t confuse Newton (force) with Joule (energy) or Watt (power).',
    source: 'NCERT Class 11, Chapter 5',
  },
  {
    subject: 'Mathematics',
    chapter: 'Limits and Derivatives',
    topic_tag: 'differentiation',
    difficulty: 'easy',
    question_text: 'The derivative of sin(x) with respect to x is:',
    option_a: '-cos(x)',
    option_b: 'cos(x)',
    option_c: 'tan(x)',
    option_d: 'sec(x)',
    correct_option: 'b',
    concept: 'Standard trigonometric differentiation.',
    solution_steps: 'd/dx [sin(x)] = cos(x). This is derived from the first principle of limits.',
    exam_tip: 'Memorise derivatives of all 6 trig functions — they appear every year.',
    source: 'NCERT Class 11, Chapter 13',
  },
  {
    subject: 'Chemistry',
    chapter: 'States of Matter',
    topic_tag: 'atmosphere',
    difficulty: 'easy',
    question_text: 'Which gas is most abundant in Earth\'s atmosphere?',
    option_a: 'Oxygen',
    option_b: 'Carbon Dioxide',
    option_c: 'Nitrogen',
    option_d: 'Argon',
    correct_option: 'c',
    concept: 'Atmospheric composition by volume.',
    solution_steps: 'Nitrogen ≈ 78%, Oxygen ≈ 21%, Argon ≈ 0.93%, CO₂ ≈ 0.04%.',
    exam_tip: 'This is a common GK question in IMUCET — know the top 4 gases and their %.',
    source: 'NCERT Class 11, Chapter 5',
  },
  {
    subject: 'English',
    chapter: 'Voice',
    topic_tag: 'passive-voice',
    difficulty: 'easy',
    question_text: 'Choose the correct passive voice: "The crew launched the lifeboat."',
    option_a: 'The lifeboat was launched by the crew.',
    option_b: 'The lifeboat is launched by the crew.',
    option_c: 'The lifeboat has been launched by the crew.',
    option_d: 'The lifeboat were launched by the crew.',
    correct_option: 'a',
    concept: 'Active to passive voice conversion in simple past tense.',
    solution_steps: 'Simple past active → was/were + past participle + by agent. "launched" is already past participle.',
    exam_tip: 'Match the tense: simple past active → simple past passive (was/were + V3).',
    source: 'Wren & Martin',
  },
  {
    subject: 'General Aptitude',
    chapter: 'Speed, Distance & Time',
    topic_tag: 'speed-distance-time',
    difficulty: 'easy',
    question_text: 'If a ship travels 120 nautical miles in 6 hours, what is its average speed in knots?',
    option_a: '15 knots',
    option_b: '20 knots',
    option_c: '25 knots',
    option_d: '30 knots',
    correct_option: 'b',
    concept: 'Speed = Distance / Time. 1 knot = 1 nautical mile per hour.',
    solution_steps: 'Speed = 120 NM / 6 h = 20 knots.',
    exam_tip: 'IMUCET loves nautical-themed aptitude — always convert to knots, not km/h.',
    source: 'IMU-CET Previous Year',
  },
];

async function seed() {
  console.log('Seeding Supabase...\n');

  // Insert questions
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .insert(seedQuestions)
    .select();

  if (qErr) {
    console.error('Failed to insert questions:', qErr.message);
    process.exit(1);
  }

  console.log(`Inserted ${questions.length} questions:`);
  questions.forEach((q, i) => console.log(`  ${i + 1}. [${q.subject}] ${q.question_text}`));

  // Insert test
  const { data: test, error: tErr } = await supabase
    .from('tests')
    .insert({
      name: 'Quick Diagnostic Mock',
      type: 'full_mock',
      duration_minutes: 30,
      total_marks: 5,
      negative_marking: 0.25,
    })
    .select()
    .single();

  if (tErr) {
    console.error('Failed to insert test:', tErr.message);
    process.exit(1);
  }

  console.log(`\nInserted test: "${test.name}" (id: ${test.id})`);

  // Link questions to test via test_questions join table (if it exists)
  const links = questions.map((q) => ({ test_id: test.id, question_id: q.id }));
  const { error: linkErr } = await supabase.from('test_questions').insert(links);

  if (linkErr) {
    console.warn('Could not link test_questions (table may not exist yet):', linkErr.message);
  } else {
    console.log(`Linked ${links.length} questions to test "${test.name}"`);
  }

  console.log('\nSeed complete!');
  process.exit(0);
}

seed();
