'use client';

import { useEffect, useState } from 'react';
import { THEMES, btnSecondary } from '@/lib/constants';

type Mode = 'light' | 'dark';

export default function ThemePicker() {
  const [theme, setTheme] = useState<string>('mono');
  const [mode, setMode] = useState<Mode>('light');

  // Read what the page is currently using
  useEffect(() => {
    const el = document.documentElement;
    setTheme(el.getAttribute('data-theme') || 'mono');
    setMode(el.getAttribute('data-mode') === 'dark' ? 'dark' : 'light');
  }, []);

  function apply(nextTheme: string, nextMode: Mode) {
    const el = document.documentElement;
    el.setAttribute('data-theme', nextTheme);
    el.setAttribute('data-mode', nextMode);
    try {
      localStorage.setItem('wk-theme', nextTheme);
      localStorage.setItem('wk-mode', nextMode);
    } catch {}
    setTheme(nextTheme);
    setMode(nextMode);
  }

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Light or dark</h2>
        <div className="flex gap-3">
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => apply(theme, m)}
              className={`px-4 py-2 rounded border font-semibold ${
                mode === m
                  ? 'bg-accent text-accent-fg border-accent'
                  : 'bg-surface text-fg border-line'
              }`}
            >
              {m === 'light' ? '☀ Light' : '☾ Dark'}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Color theme</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {THEMES.map((t) => {
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                data-theme={t.id}
                data-mode={mode}
                aria-pressed={selected}
                onClick={() => apply(t.id, mode)}
                className={`text-left rounded-lg p-4 border-4 bg-bg text-fg ${
                  selected ? 'border-accent' : 'border-line'
                }`}
              >
                <div className="font-semibold">{t.label}</div>
                <div className="text-sm text-muted mb-3">
                  {selected ? '✓ Selected' : 'Tap to preview and select'}
                </div>
                <div className="flex gap-2">
                  <span className="h-6 w-10 rounded bg-accent" />
                  <span className="h-6 w-10 rounded bg-work" />
                  <span className="h-6 w-10 rounded bg-rest" />
                  <span className="h-6 w-10 rounded bg-done" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-sm text-muted">
        Your choices are saved in this browser on this device.
      </p>
    </div>
  );
}