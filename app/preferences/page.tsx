import ThemePicker from '@/components/ThemePicker';

export default function PreferencesPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Preferences</h1>
      <ThemePicker />
    </main>
  );
}