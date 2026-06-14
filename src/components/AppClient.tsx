'use client';

import dynamic from 'next/dynamic';

// Client-only: the whole app talks to IndexedDB (Dexie), which doesn't exist on
// the server. ssr:false keeps it out of the server render entirely.
const App = dynamic(() => import('@/components/App'), { ssr: false });

export default function AppClient() {
  return <App />;
}
