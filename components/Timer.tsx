'use client';

import { useEffect, useState } from 'react';
import { inputCls } from '@/lib/constants';

type Phase = 'idle' | 'work' | 'rest' | 'done';
type TimerState = { phase: Phase; round: number; remaining: number };

let audioCtx: AudioContext | null = null;

function ensureAudio() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch {}
}

function beep(freq: number, ms: number) {
  try {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + ms / 1000);
  } catch {}
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Timer() {
  const [rounds, setRounds] = useState(8);
  const [workSec, setWorkSec] = useState(40);
  const [restSec, setRestSec] = useState(20);
  const [state, setState] = useState<TimerState>({
    phase: 'idle',
    round: 1,
    remaining: 0,
  });
  const [running, setRunning] = useState(false);

  const active = running && state.phase !== 'done' && state.phase !== 'idle';

  // Countdown: ticks once per second while active
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setState((s) => {
        if (s.remaining > 1) return { ...s, remaining: s.remaining - 1 };
        if (s.phase === 'work') {
          if (s.round >= rounds) return { phase: 'done', round: s.round, remaining: 0 };
          if (restSec > 0) return { phase: 'rest', round: s.round, remaining: restSec };
          return { phase: 'work', round: s.round + 1, remaining: workSec };
        }
        return { phase: 'work', round: s.round + 1, remaining: workSec };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [active, rounds, workSec, restSec]);

  // Sounds when the phase or round changes
  useEffect(() => {
    if (state.phase === 'work') beep(880, 250);
    if (state.phase === 'rest') beep(440, 250);
    if (state.phase === 'done') beep(660, 700);
  }, [state.phase, state.round]);

  function start() {
    ensureAudio();
    if (state.phase === 'idle' || state.phase === 'done') {
      setState({ phase: 'work', round: 1, remaining: workSec });
    }
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset() {
    setRunning(false);
    setState({ phase: 'idle', round: 1, remaining: 0 });
  }

  const locked = state.phase === 'work' || state.phase === 'rest';
  const totalSeconds = rounds * workSec + Math.max(0, rounds - 1) * restSec;

  const label =
    state.phase === 'work' ? 'WORK'
    : state.phase === 'rest' ? 'REST'
    : state.phase === 'done' ? 'DONE!'
    : 'READY';

  const bg =
    state.phase === 'work' ? 'bg-green-600'
    : state.phase === 'rest' ? 'bg-blue-600'
    : state.phase === 'done' ? 'bg-purple-600'
    : 'bg-gray-600';

  const shown = state.phase === 'idle' ? workSec : state.remaining;

  const numChange =
    (set: (n: number) => void, min: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = Math.floor(Number(e.target.value));
      set(Number.isFinite(n) ? Math.max(min, n) : min);
    };

  return (
    <section className="border rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Interval Timer</h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <label className="flex flex-col text-sm">
          Rounds
          <input
            type="number" min={1} className={inputCls} disabled={locked}
            value={rounds} onChange={numChange(setRounds, 1)}
            onFocus={(e) => e.target.select()}
          />
        </label>
        <label className="flex flex-col text-sm">
          Work (seconds)
          <input
            type="number" min={1} className={inputCls} disabled={locked}
            value={workSec} onChange={numChange(setWorkSec, 1)}
            onFocus={(e) => e.target.select()}
          />
        </label>
        <label className="flex flex-col text-sm">
          Rest (seconds)
          <input
            type="number" min={0} className={inputCls} disabled={locked}
            value={restSec} onChange={numChange(setRestSec, 0)}
            onFocus={(e) => e.target.select()}
          />
        </label>
      </div>

      <div className={`${bg} text-white rounded-lg p-6 text-center mb-4`}>
        <div className="text-xl font-semibold">{label}</div>
        <div className="text-7xl font-bold tabular-nums">{fmt(shown)}</div>
        <div className="text-lg">
          Round {state.phase === 'idle' ? 0 : state.round} of {rounds}
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        {!active ? (
          <button onClick={start} className="bg-green-600 text-white px-4 py-2 rounded">
            {state.phase === 'work' || state.phase === 'rest' ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={pause} className="bg-yellow-600 text-white px-4 py-2 rounded">
            Pause
          </button>
        )}
        <button onClick={reset} className="bg-gray-500 text-white px-4 py-2 rounded">
          Reset
        </button>
        <span className="text-sm opacity-70">
          Total time: {fmt(totalSeconds)} (no rest after the last round)
        </span>
      </div>
    </section>
  );
}