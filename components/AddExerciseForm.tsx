'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MUSCLES, EQUIPMENT, inputCls, btnPrimary } from '@/lib/constants';
import IntInput from '@/components/IntInput';

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
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
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
        <h2 className="text-xl font-semibold">Administrator sign in</h2>
        <input
          type="email" placeholder="Email" className={inputCls} required
          value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
        />
        <input
          type="password" placeholder="Password" className={inputCls} required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button className={btnPrimary}>Sign in</button>
        {message && <p className="text-danger">{message}</p>}
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
        <label className="flex flex-col gap-1">
          Exercise name
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          Equipment
          <select className={inputCls} value={equipment} onChange={(e) => setEquipment(e.target.value)}>
            {EQUIPMENT.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>

        <label className="flex flex-col gap-1">
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
                  type="checkbox" className="accent-accent"
                  checked={secondary.includes(m)}
                  onChange={() => toggleSecondary(m)}
                />
                {m}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3">
          <label className="flex flex-col gap-1">
            Sets
            <IntInput value={sets} min={1} max={99} className="w-24"
              onChange={(v) => setSets(v === '' ? 1 : v)} />
          </label>
          <label className="flex flex-col gap-1">
            Reps
            <IntInput value={reps} min={1} max={999} className="w-24"
              onChange={(v) => setReps(v === '' ? 1 : v)} />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          Notes (optional)
          <input className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <button className={btnPrimary}>Add exercise</button>
        {message && (
          <p className={message.startsWith('Error') ? 'text-danger' : 'text-ok'}>{message}</p>
        )}
      </form>
    </div>
  );
}