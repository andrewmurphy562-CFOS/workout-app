export const MUSCLES = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core',
] as const;

export const EQUIPMENT = [
  'Barbell', 'Dumbbell', 'Kettlebell', 'Cable',
  'Machine', 'Bodyweight', 'Resistance Band',
] as const;

export const THEMES = [
  { id: 'mono', label: 'Black & Grey' },
  { id: 'blue', label: 'Blue & Grey' },
  { id: 'earth', label: 'Beige & Green' },
  { id: 'neon', label: 'Neon' },
  { id: 'calm', label: 'Calming' },
] as const;

export const inputCls =
  'border border-line rounded px-2 py-1 bg-surface text-fg';
export const btnPrimary =
  'bg-accent text-accent-fg px-4 py-2 rounded font-semibold hover:opacity-90 disabled:opacity-40';
export const btnSecondary =
  'border border-line bg-surface text-fg px-4 py-2 rounded hover:opacity-80 disabled:opacity-40';