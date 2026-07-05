import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function parseCSVLine(line) {
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') { inQuotes = !inQuotes; }
    else if (line[i] === ',' && !inQuotes) { cols.push(current); current = ''; }
    else { current += line[i]; }
  }
  cols.push(current);
  return cols;
}

const csv = fs.readFileSync('./IMUpilot_QuestionBank.csv', 'utf8');
const lines = csv.split('\n').filter(l => l.trim());
const valid = ['Physics','Mathematics','Chemistry','English','GA','GK'];
const questions = [];

for(let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if(!cols[1] || !valid.includes(cols[1].trim())) continue;
  questions.push({
    subject: cols[1].trim(),
    chapter: cols[2].trim(),
    topic_tag: cols[3].trim(),
    difficulty: cols[4].trim().toLowerCase(),
    question_text: cols[5].trim(),
    option_a: cols[6].trim(),
    option_b: cols[7].trim(),
    option_c: cols[8].trim(),
    option_d: cols[9].trim(),
    correct_option: cols[10].trim().toLowerCase(),
    concept: cols[11].trim(),
    solution_steps: cols[12].trim(),
    exam_tip: cols[13] ? cols[13].trim() : '',
    source: cols[14] ? cols[14].trim() : '',
    year: cols[15] ? parseInt(cols[15].trim()) || null : null
  });
}

console.log('Valid questions found:', questions.length);

const { error } = await supabase.from('questions').insert(questions);
if(error) console.error('Error:', error.message);
else console.log('Inserted:', questions.length, 'questions');