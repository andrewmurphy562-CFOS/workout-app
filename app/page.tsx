import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/lib/types';
import Timer from '@/components/Timer';
import WorkoutGenerator from '@/components/WorkoutGenerator';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('primary_muscle')
    .order('name');

  if (error) {
    return <p className="p-6">Error loading exercises: {error.message}</p>;
  }

  const exercises = (data ?? []) as Exercise[];

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workout App</h1>
        <Link href="/manage" className="underline">Manage exercises</Link>
      </header>

      <Timer />
      <WorkoutGenerator exercises={exercises} />

      <section>
        <h2 className="text-2xl font-bold mb-4">
          Exercise Library ({exercises.length})
        </h2>
        <div className="grid gap-4">
          {exercises.map((ex) => (
            <div key={ex.id} className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold">{ex.name}</h3>
              <p>Equipment: {ex.equipment}</p>
              <p>Primary muscle: {ex.primary_muscle}</p>
              {ex.secondary_muscles && ex.secondary_muscles.length > 0 && (
                <p>Also works: {ex.secondary_muscles.join(', ')}</p>
              )}
              <p>{ex.sets} sets × {ex.reps} reps</p>
              {ex.notes && <p className="text-sm opacity-70">{ex.notes}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}