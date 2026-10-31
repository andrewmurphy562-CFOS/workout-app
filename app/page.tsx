import { getExercises } from '@/lib/getExercises';
import Timer from '@/components/Timer';
import WorkoutGenerator from '@/components/WorkoutGenerator';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { exercises, error } = await getExercises();

  if (error) {
    return <p className="p-6">Error loading exercises: {error}</p>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-8">
      <h1 className="text-3xl font-bold">Workout Generator &amp; Timer</h1>
      <WorkoutGenerator exercises={exercises} />
      <Timer />
    </main>
  );
}