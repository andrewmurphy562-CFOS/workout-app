import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import NavMenu from '@/components/NavMenu';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Workout App',
  description: 'Workout generator, interval timer and exercise database',
};

const themeScript = `(function(){try{
var themes=['mono','blue','earth','neon','calm'];
var t=localStorage.getItem('wk-theme');
if(themes.indexOf(t)<0){t='mono';}
var m=localStorage.getItem('wk-mode');
if(m!=='light'&&m!=='dark'){m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
var d=document.documentElement;
d.setAttribute('data-theme',t);
d.setAttribute('data-mode',m);
}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="mono" data-mode="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <header className="border-b border-line bg-surface">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <Link href="/" className="text-xl font-bold">Workout App</Link>
            <NavMenu />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}