import AddExerciseForm from '@/components/AddExerciseForm';

export default function ManagePage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Exercises (Admin)</h1>
      <AddExerciseForm />
    </main>
  );
}