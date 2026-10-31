'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { href: '/', label: 'Workout Generator & Timer' },
  { href: '/exercises', label: 'Exercise Database' },
  { href: '/preferences', label: 'Preferences' },
  { href: '/manage', label: 'Manage Exercises (Admin)' },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const current = ITEMS.find((i) => i.href === pathname) ?? ITEMS[0];

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="border border-line bg-bg text-fg rounded px-3 py-2 text-sm flex items-center gap-2"
      >
        <span>☰ {current.label}</span>
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <nav
          role="menu"
          className="absolute right-0 mt-2 w-72 max-w-[90vw] border border-line bg-surface rounded-lg shadow-lg overflow-hidden z-50"
        >
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 text-sm ${
                item.href === current.href
                  ? 'bg-accent text-accent-fg font-semibold'
                  : 'text-fg hover:bg-bg'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}