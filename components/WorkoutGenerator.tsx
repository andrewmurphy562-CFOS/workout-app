'use client';

import { useMemo, useState } from 'react';
import type { Exercise } from '@/lib/types';
import { inputCls } from '@/lib/constants';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WorkoutGenerator({ exercises }: { exercises: Exercise[] }) {
  const muscles = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.primary_muscle))).sort(),
    [exercises]
  );

  const [pcts, setPcts] = useState<Record<string, number>>({});
  const [count, setCount] = useState(8);
  const [workout, setWorkout] = useState<Exercise[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const total = muscles.reduce((sum, m) => sum + (pcts[m] ?? 0), 0);

  function setPct(muscle: string, value: number) {
    const clean = Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0;
    setPcts((p) => ({ ...p, [muscle]: clean }));
  }

  function generate() {
    // Work out how many exercises each muscle gets (largest remainder method)
    const entries = muscles
      .map((m) => ({ m, exact: ((pcts[m] ?? 0) / 100) * count }))
      .filter((e) => e.exact > 0)
      .map((e) => ({
        m: e.m,
        n: Math.floor(e.exact),
        rem: e.exact - Math.floor(e.exact),
      }));

    let left = count - entries.reduce((sum, e) => sum + e.n, 0);
    [...entries]
      .sort((a, b) => b.rem - a.rem)
      .forEach((e) => {
        if (left > 0) {
          e.n += 1;
          left -= 1;
        }
      });

    // Randomly pick that many exercises for each muscle
    const picked: Exercise[] = [];
    const warns: string[] = [];
    for (const e of entries) {
      if (e.n === 0) continue;
      const pool = shuffle(exercises.filter((x) => x.primary_muscle === e.m));
      if (pool.length < e.n) {
        warns.push(
          `${e.m}: wanted ${e.n} but only ${pool.length} in the database. Add more on the Manage page.`
        );
      }
      picked.push(...pool.slice(0, e.n));
    }

    setWorkout(shuffle(picked));
    setWarnings(warns);
    setGenerated(true);
  }

  return (
    <section className="border rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Random Workout Generator</h2>

      <label className="flex items-center gap-2 mb-4">
        Number of exercises:
        <input
          type="number" min={1} max={30} className={`${inputCls} w-20`}
          value={count}
          onChange={(e) => setCount(Math.min(30, Math.max(1, Math.floor(Number(e.target.value)) || 1)))}
          onFocus={(e) => e.target.select()}
        />
      </label>

      <p className="mb-2 font-semibold">Percentage per primary muscle:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {muscles.map((m) => (
          <label key={m} className="flex items-center justify-between gap-2">
            <span>{m}</span>
            <span className="flex items-center gap-1">
              <input
                type="number" min={0} max={100} className={`${inputCls} w-20`}
                value={pcts[m] ?? 0}
                onChange={(e) => setPct(m, Number(e.target.value))}
                onFocus={(e) => e.target.select()}
              />
              %
            </span>
          </label>
        ))}
      </div>

      <p className={`mb-3 font-semibold ${total === 100 ? 'text-green-600' : 'text-red-600'}`}>
        Total: {total}%{' '}
        {total === 100 ? '✓' : total < 100 ? `(${100 - total}% left to assign)` : `(${total - 100}% over)`}
      </p>

      <button
        onClick={generate}
        disabled={total !== 100 || exercises.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-40"
      >
        {generated ? 'Regenerate workout' : 'Generate workout'}
      </button>

      {warnings.length > 0 && (
        <ul className="mt-3 text-sm text-orange-600 list-disc pl-5">
          {warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}

      {workout.length > 0 && (
        <ol className="mt-4 grid gap-2">
          {workout.map((ex, i) => (
            <li key={ex.id} className="border rounded p-3">
              <strong>{i + 1}. {ex.name}</strong>
              <div className="text-sm">
                {ex.primary_muscle} · {ex.equipment} · {ex.sets} sets × {ex.reps} reps
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}