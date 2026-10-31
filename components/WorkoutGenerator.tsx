'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Exercise } from '@/lib/types';
import { EQUIPMENT, btnPrimary, btnSecondary } from '@/lib/constants';
import IntInput from '@/components/IntInput';

type Item = { ex: Exercise; sets: number; reps: number };

const STORAGE_KEY = 'wk-equipment';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WorkoutGenerator({ exercises }: { exercises: Exercise[] }) {
  const equipmentOptions = useMemo(
    () =>
      Array.from(
        new Set<string>([...EQUIPMENT, ...exercises.map((e) => e.equipment)])
      ).sort(),
    [exercises]
  );

  const muscles = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.primary_muscle))).sort(),
    [exercises]
  );

  // Equipment selection (remembered in this browser)
  const [equip, setEquip] = useState<string[]>(equipmentOptions);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) {
          setEquip(saved.filter((x): x is string => typeof x === 'string'));
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equip));
    } catch {}
  }, [equip, loaded]);

  function toggleEquip(name: string) {
    setEquip((cur) =>
      cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]
    );
  }

  // Only exercises that use the selected equipment can be picked
  const pool = useMemo(
    () => exercises.filter((e) => equip.includes(e.equipment)),
    [exercises, equip]
  );

  const availableByMuscle = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of pool) map[e.primary_muscle] = (map[e.primary_muscle] ?? 0) + 1;
    return map;
  }, [pool]);

  const [pcts, setPcts] = useState<Record<string, number>>({});
  const [count, setCount] = useState<number>(8);
  const [overrideSets, setOverrideSets] = useState<number | ''>('');
  const [overrideReps, setOverrideReps] = useState<number | ''>('');
  const [items, setItems] = useState<Item[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);

  const total = muscles.reduce((sum, m) => sum + (pcts[m] ?? 0), 0);

  function generate() {
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

    const picked: Exercise[] = [];
    const warns: string[] = [];
    for (const e of entries) {
      if (e.n === 0) continue;
      const candidates = shuffle(pool.filter((x) => x.primary_muscle === e.m));
      if (candidates.length === 0) {
        warns.push(`${e.m}: no exercises match your selected equipment.`);
      } else if (candidates.length < e.n) {
        warns.push(
          `${e.m}: wanted ${e.n} but only ${candidates.length} match your equipment.`
        );
      }
      picked.push(...candidates.slice(0, e.n));
    }

    setItems(
      shuffle(picked).map((ex) => ({
        ex,
        sets: overrideSets === '' ? ex.sets : overrideSets,
        reps: overrideReps === '' ? ex.reps : overrideReps,
      }))
    );
    setWarnings(warns);
    setGenerated(true);
  }

  function applyOverridesToAll() {
    setItems((cur) =>
      cur.map((it) => ({
        ...it,
        sets: overrideSets === '' ? it.sets : overrideSets,
        reps: overrideReps === '' ? it.reps : overrideReps,
      }))
    );
  }

  function resetToDefaults() {
    setItems((cur) => cur.map((it) => ({ ...it, sets: it.ex.sets, reps: it.ex.reps })));
  }

  function updateItem(id: number, field: 'sets' | 'reps', value: number) {
    setItems((cur) => cur.map((it) => (it.ex.id === id ? { ...it, [field]: value } : it)));
  }

  return (
    <section className="border border-line bg-surface rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Random Workout Generator</h2>

      {/* Equipment */}
      <div className="mb-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="font-semibold">Equipment I have available:</p>
          <div className="flex gap-2 text-sm">
            <button type="button" className="underline" onClick={() => setEquip(equipmentOptions)}>
              Select all
            </button>
            <button type="button" className="underline" onClick={() => setEquip([])}>
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {equipmentOptions.map((name) => (
            <label key={name} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-accent h-4 w-4"
                checked={equip.includes(name)}
                onChange={() => toggleEquip(name)}
              />
              {name}
            </label>
          ))}
        </div>
        <p className="text-sm text-muted mt-2">
          {pool.length} of {exercises.length} exercises match your equipment.
        </p>
      </div>

      {/* Number of exercises */}
      <label className="flex items-center gap-2 mb-4">
        Number of exercises:
        <IntInput value={count} min={1} max={30} className="w-20"
          onChange={(v) => setCount(v === '' ? 1 : v)} />
      </label>

      {/* Sets / reps override */}
      <div className="mb-5">
        <p className="font-semibold mb-2">Override sets and reps (optional, whole numbers):</p>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex flex-col text-sm gap-1">
            Sets for all
            <IntInput value={overrideSets} allowEmpty min={1} max={99} placeholder="default"
              className="w-24" onChange={setOverrideSets} />
          </label>
          <label className="flex flex-col text-sm gap-1">
            Reps for all
            <IntInput value={overrideReps} allowEmpty min={1} max={999} placeholder="default"
              className="w-24" onChange={setOverrideReps} />
          </label>
        </div>
        <p className="text-sm text-muted mt-1">
          Leave blank to use each exercise&rsquo;s own sets and reps. You can also edit them
          for individual exercises after generating.
        </p>
      </div>

      {/* Percentages */}
      <p className="mb-2 font-semibold">Percentage per primary muscle:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {muscles.map((m) => (
          <label key={m} className="flex items-center justify-between gap-2">
            <span>
              {m}{' '}
              <span className="text-xs text-muted">({availableByMuscle[m] ?? 0} available)</span>
            </span>
            <span className="flex items-center gap-1">
              <IntInput
                value={pcts[m] ?? 0} min={0} max={100} className="w-20"
                onChange={(v) => setPcts((p) => ({ ...p, [m]: v === '' ? 0 : v }))}
              />
              %
            </span>
          </label>
        ))}
      </div>

      <p className={`mb-3 font-semibold ${total === 100 ? 'text-ok' : 'text-danger'}`}>
        Total: {total}%{' '}
        {total === 100
          ? '✓'
          : total < 100
          ? `(${100 - total}% left to assign)`
          : `(${total - 100}% over)`}
      </p>

      <button
        onClick={generate}
        disabled={total !== 100 || pool.length === 0}
        className={btnPrimary}
      >
        {generated ? 'Regenerate workout' : 'Generate workout'}
      </button>
      {pool.length === 0 && (
        <p className="text-sm text-warn mt-2">
          No exercises match your equipment selection. Tick at least one item above.
        </p>
      )}

      {warnings.length > 0 && (
        <ul className="mt-3 text-sm text-warn list-disc pl-5">
          {warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-5">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={applyOverridesToAll}
              disabled={overrideSets === '' && overrideReps === ''}
              className={btnSecondary}
            >
              Apply overrides to all
            </button>
            <button onClick={resetToDefaults} className={btnSecondary}>
              Reset to default sets/reps
            </button>
          </div>

          <ol className="grid gap-2">
            {items.map((it, i) => (
              <li key={it.ex.id} className="border border-line rounded p-3 bg-bg">
                <strong>{i + 1}. {it.ex.name}</strong>
                <div className="text-sm text-muted">
                  {it.ex.primary_muscle} · {it.ex.equipment}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <IntInput
                    value={it.sets} min={1} max={99} className="w-16"
                    ariaLabel={`Sets for ${it.ex.name}`}
                    onChange={(v) => updateItem(it.ex.id, 'sets', v === '' ? 1 : v)}
                  />
                  sets ×
                  <IntInput
                    value={it.reps} min={1} max={999} className="w-16"
                    ariaLabel={`Reps for ${it.ex.name}`}
                    onChange={(v) => updateItem(it.ex.id, 'reps', v === '' ? 1 : v)}
                  />
                  reps
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}