'use client';
import { useEffect } from 'react';
export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="p-10 text-red-500">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <pre className="mt-4 p-4 bg-slate-900 overflow-auto">{error.stack || error.message}</pre>
    </div>
  );
}
