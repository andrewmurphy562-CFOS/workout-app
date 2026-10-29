export type Exercise = {
  id: number;
  name: string;
  equipment: string;
  primary_muscle: string;
  secondary_muscles: string[] | null;
  sets: number;
  reps: number;
  notes: string | null;
};