'use client';

import { useEffect, useState } from 'react';
import IntInput from '@/components/IntInput';
import { btnPrimary, btnSecondary } from '@/lib/constants';

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
  const [rounds, setRounds] = useState<number>(8);
  const [workSec, setWorkSec] = useState<number>(40);
  const [restSec, setRestSec] = useState<number>(20);
  const [state, setState] = useState<TimerState>({ phase: 'idle', round: 1, remaining: 0 });
  const [running, setRunning] = useState(false);

  const active = running && state.phase !== 'done' && state.phase !== 'idle';

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
  function pause() { setRunning(false); }
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

  const panel =
    state.phase === 'work' ? 'bg-work text-on-phase'
    : state.phase === 'rest' ? 'bg-rest text-on-phase'
    : state.phase === 'done' ? 'bg-done text-on-phase'
    : 'bg-muted text-bg';

  const shown = state.phase === 'idle' ? workSec : state.remaining;

  return (
    <section className="border border-line bg-surface rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">Interval Timer</h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <label className="flex flex-col text-sm gap-1">
          Rounds
          <IntInput value={rounds} min={1} max={99} disabled={locked}
            onChange={(v) => setRounds(v === '' ? 1 : v)} />
        </label>
        <label className="flex flex-col text-sm gap-1">
          Work (seconds)
          <IntInput value={workSec} min={1} max={3600} disabled={locked}
            onChange={(v) => setWorkSec(v === '' ? 1 : v)} />
        </label>
        <label className="flex flex-col text-sm gap-1">
          Rest (seconds)
          <IntInput value={restSec} min={0} max={3600} disabled={locked}
            onChange={(v) => setRestSec(v === '' ? 0 : v)} />
        </label>
      </div>

      <div className={`${panel} rounded-lg p-6 text-center mb-4`}>
        <div className="text-xl font-semibold">{label}</div>
        <div className="text-7xl font-bold tabular-nums">{fmt(shown)}</div>
        <div className="text-lg">
          Round {state.phase === 'idle' ? 0 : state.round} of {rounds}
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        {!active ? (
          <button onClick={start} className={btnPrimary}>
            {state.phase === 'work' || state.phase === 'rest' ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button onClick={pause} className={btnPrimary}>Pause</button>
        )}
        <button onClick={reset} className={btnSecondary}>Reset</button>
        <span className="text-sm text-muted">
          Total time: {fmt(totalSeconds)} (no rest after the last round)
        </span>
      </div>
    </section>
  );
}