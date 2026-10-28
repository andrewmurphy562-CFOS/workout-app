import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .order('primary_muscle');

  if (error) {
    return <p className="p-6">Error loading exercises: {error.message}</p>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Workout Exercises</h1>
      <div className="grid gap-4">
        {exercises?.map((ex) => (
          <div key={ex.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold">{ex.name}</h2>
            <p>Equipment: {ex.equipment}</p>
            <p>Primary muscle: {ex.primary_muscle}</p>
            {ex.secondary_muscles?.length > 0 && (
              <p>Also works: {ex.secondary_muscles.join(', ')}</p>
            )}
            <p>
              {ex.sets} sets × {ex.reps} reps
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}