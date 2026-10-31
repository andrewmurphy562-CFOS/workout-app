'use client';

import { useMemo, useState } from 'react';
import type { Exercise } from '@/lib/types';
import { inputCls } from '@/lib/constants';

export default function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState('All');
  const [equip, setEquip] = useState('All');

  const muscles = useMemo(
    () => ['All', ...Array.from(new Set(exercises.map((e) => e.primary_muscle))).sort()],
    [exercises]
  );
  const equipments = useMemo(
    () => ['All', ...Array.from(new Set(exercises.map((e) => e.equipment))).sort()],
    [exercises]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return exercises.filter(
      (e) =>
        (muscle === 'All' || e.primary_muscle === muscle) &&
        (equip === 'All' || e.equipment === equip) &&
        e.name.toLowerCase().includes(term)
    );
  }, [exercises, q, muscle, equip]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          className={`${inputCls} flex-1 min-w-40`}
          placeholder="Search by name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={inputCls} value={muscle} onChange={(e) => setMuscle(e.target.value)}>
          {muscles.map((m) => <option key={m} value={m}>{m === 'All' ? 'All muscles' : m}</option>)}
        </select>
        <select className={inputCls} value={equip} onChange={(e) => setEquip(e.target.value)}>
          {equipments.map((m) => <option key={m} value={m}>{m === 'All' ? 'All equipment' : m}</option>)}
        </select>
      </div>

      <p className="text-sm text-muted mb-3">
        Showing {filtered.length} of {exercises.length} exercises
      </p>

      <div className="grid gap-4">
        {filtered.map((ex) => (
          <div key={ex.id} className="border border-line bg-surface rounded-lg p-4">
            <h3 className="text-xl font-semibold">{ex.name}</h3>
            <p>Equipment: {ex.equipment}</p>
            <p>Primary muscle: {ex.primary_muscle}</p>
            {ex.secondary_muscles && ex.secondary_muscles.length > 0 && (
              <p>Also works: {ex.secondary_muscles.join(', ')}</p>
            )}
            <p>{ex.sets} sets × {ex.reps} reps</p>
            {ex.notes && <p className="text-sm text-muted">{ex.notes}</p>}
          </div>
        ))}
        {filtered.length === 0 && <p>No exercises match those filters.</p>}
      </div>
    </div>
  );
}