'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const origError = console.error;
    const origWarn = console.warn;

    console.error = (...args: any[]) => {
      setLogs((prev) => [...prev, 'ERROR: ' + args.map(String).join(' ')]);
      origError(...args);
    };

    console.warn = (...args: any[]) => {
      setLogs((prev) => [...prev, 'WARN: ' + args.map(String).join(' ')]);
      origWarn(...args);
    };

    return () => {
      console.error = origError;
      console.warn = origWarn;
    };
  }, []);

  return (
    <div style={{ padding: 16, fontFamily: 'monospace' }}>
      <h1 style={{ fontWeight: 800 }}>Debug Logs</h1>
      <p>Open /workout, click Generate Workout, then come back here and copy logs.</p>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{logs.join('\n')}</pre>
    </div>
  );
}
