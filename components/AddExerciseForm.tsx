'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MUSCLES, EQUIPMENT, inputCls } from '@/lib/constants';

export default function AddExerciseForm() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState<string>(EQUIPMENT[0]);
  const [primary, setPrimary] = useState<string>(MUSCLES[0]);
  const [secondary, setSecondary] = useState<string[]>([]);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    if (error) setMessage('Login error: ' + error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function toggleSecondary(m: string) {
    setSecondary((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  }

  async function addExercise(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!name.trim()) {
      setMessage('Error: please enter a name.');
      return;
    }
    const { error } = await supabase.from('exercises').insert({
      name: name.trim(),
      equipment,
      primary_muscle: primary,
      secondary_muscles: secondary.filter((m) => m !== primary),
      sets,
      reps,
      notes: notes.trim() || null,
    });
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage(`Added "${name.trim()}" ✓`);
      setName('');
      setSecondary([]);
      setNotes('');
    }
  }

  if (checking) return <p>Loading...</p>;

  if (!userEmail) {
    return (
      <form onSubmit={signIn} className="grid gap-3 max-w-sm">
        <h2 className="text-xl font-semibold">Sign in to add exercises</h2>
        <input
          type="email" placeholder="Email" className={inputCls} required
          value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
        />
        <input
          type="password" placeholder="Password" className={inputCls} required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Sign in</button>
        {message && <p className="text-red-600">{message}</p>}
      </form>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm">
        Signed in as {userEmail}{' '}
        <button onClick={signOut} className="underline">Sign out</button>
      </p>

      <form onSubmit={addExercise} className="grid gap-3 max-w-lg">
        <label className="flex flex-col">
          Exercise name
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="flex flex-col">
          Equipment
          <select className={inputCls} value={equipment} onChange={(e) => setEquipment(e.target.value)}>
            {EQUIPMENT.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>

        <label className="flex flex-col">
          Primary muscle
          <select className={inputCls} value={primary} onChange={(e) => setPrimary(e.target.value)}>
            {MUSCLES.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>

        <fieldset>
          <legend>Secondary muscles (optional)</legend>
          <div className="flex flex-wrap gap-3 mt-1">
            {MUSCLES.filter((m) => m !== primary).map((m) => (
              <label key={m} className="flex items-center gap-1">
                <input
                  type="checkbox" checked={secondary.includes(m)}
                  onChange={() => toggleSecondary(m)}
                />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3">
          <label className="flex flex-col">
            Sets
            <input
              type="number" min={1} className={`${inputCls} w-24`} value={sets}
              onChange={(e) => setSets(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <label className="flex flex-col">
            Reps
            <input
              type="number" min={1} className={`${inputCls} w-24`} value={reps}
              onChange={(e) => setReps(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
              onFocus={(e) => e.target.select()}
            />
          </label>
        </div>

        <label className="flex flex-col">
          Notes (optional)
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <button className="bg-green-600 text-white px-4 py-2 rounded">Add exercise</button>
        {message && (
          <p className={message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}