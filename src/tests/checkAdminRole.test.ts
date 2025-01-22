import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-supabase-url';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Check Admin Role', () => {
  it('should verify that the user is an admin', async () => {
    const userId = 'bc99e78b-fe3f-4ed8-94c7-770fffaeb661';
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Error fetching user role: ${error.message}`);
    }

    expect(data.role).toBe('admin');
  });
});