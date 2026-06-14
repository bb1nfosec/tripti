import type { Metadata, Viewport } from 'next';

// Self-hosted fonts (no Google Fonts CDN — CSP forbids third-party origins).
import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import '@fontsource/hanken-grotesk/700.css';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/600.css';
import '@fontsource/newsreader/400-italic.css';
import '@fontsource/newsreader/500-italic.css';
import '@fontsource/noto-serif-devanagari/500.css';
import '@fontsource/noto-serif-devanagari/600.css';

import './globals.css';
import ServiceWorkerRegister from './ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Tripti — what shall we cook?',
  description:
    'A calm, local-first food companion for Indian households. Bring your own LLM. No servers, ever.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Tripti',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Tripti' },
  icons: { icon: '/icons/icon-192.png', apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#5F7D5A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div id="tripti-root">{children}</div>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
