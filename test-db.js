import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gmruibfrciiattanjjok.supabase.co',
  'sb_publishable_SehzNVZNgOZ_0aU2XLASFA_1jt55W1t'
);

async function check() {
  const { data, error, count } = await supabase
    .from('questions')
    .select('*', { count: 'exact' });
    
  if (error) console.error('Error:', error);
  else {
    console.log(`Successfully found ${count} questions in Supabase!`);
    console.log('Sample question:', JSON.stringify(data[0], null, 2));
  }
}

check();
