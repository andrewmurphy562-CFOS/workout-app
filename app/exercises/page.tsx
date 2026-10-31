import { getExercises } from '@/lib/getExercises';
import ExerciseLibrary from '@/components/ExerciseLibrary';

export const dynamic = 'force-dynamic';

export default async function ExercisesPage() {
  const { exercises, error } = await getExercises();

  if (error) {
    return <p className="p-6">Error loading exercises: {error}</p>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Exercise Database</h1>
      <ExerciseLibrary exercises={exercises} />
    </main>
  );
}