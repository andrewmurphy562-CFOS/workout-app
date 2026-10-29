import Link from 'next/link';
import AddExerciseForm from '@/components/AddExerciseForm';

export default function ManagePage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href="/" className="underline">← Back to workouts</Link>
      <h1 className="text-3xl font-bold my-6">Manage Exercises</h1>
      <AddExerciseForm />
    </main>
  );
}