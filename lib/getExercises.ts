import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/lib/types';

export async function getExercises(): Promise<{
  exercises: Exercise[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('primary_muscle')
    .order('name');

  return { exercises: (data ?? []) as Exercise[], error: error?.message ?? null };
}