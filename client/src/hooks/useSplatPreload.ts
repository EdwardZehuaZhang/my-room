import { useEffect, useState } from 'react';

/**
 * Stream-downloads a splat file to warm the browser HTTP cache,
 * without buffering the entire file in JS memory (avoids crashes on large files).
 * Once the stream is fully consumed, <Splat> will load instantly from cache.
 */
export function useSplatPreload(url: string) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setProgress(0);

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok || !res.body) {
          if (!cancelled) setReady(true); // fallback: let <Splat> handle it
          return;
        }

        const total = Number(res.headers.get('content-length')) || 0;
        const reader = res.body.getReader();
        let loaded = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          loaded += value.byteLength;
          if (total > 0) {
            setProgress(Math.round((loaded / total) * 100));
          }
        }

        if (!cancelled) {
          setProgress(100);
          setReady(true);
        }
      } catch {
        // On error, let <Splat> try loading directly
        if (!cancelled) setReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  return { ready, progress };
}
