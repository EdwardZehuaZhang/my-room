import { useEffect, useState } from 'react';

/**
 * Fetches a splat file and returns a blob: URL.
 * CDN compression strips Content-Length which drei's SplatLoader requires.
 * Blob URLs always have a correct Content-Length.
 *
 * Streams the response body so onProgress fires during download.
 * If Content-Length is unavailable (Vercel Blob CDN), shows fake incremental
 * progress so the loading bar still animates.
 */
export function useSplatBlobUrl(
  remoteUrl: string,
  onProgress?: (pct: number) => void,
) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;

    (async () => {
      try {
        onProgress?.(0);
        const res = await fetch(remoteUrl);
        if (!res.ok) throw new Error(`Failed to fetch splat: ${res.status}`);

        const contentLength = res.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;

        const reader = res.body!.getReader();
        const chunks: Uint8Array[] = [];
        let received = 0;

        // Fake progress timer for when content-length is unavailable
        let fakeTimer: ReturnType<typeof setInterval> | null = null;
        let fakePct = 5;
        if (!total) {
          onProgress?.(fakePct);
          fakeTimer = setInterval(() => {
            // Slow asymptotic approach to 90%
            fakePct = Math.min(90, fakePct + (90 - fakePct) * 0.08);
            if (!cancelled) onProgress?.(Math.round(fakePct));
          }, 300);
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) break;
          chunks.push(value);
          received += value.length;
          if (total) {
            onProgress?.(Math.round((received / total) * 95)); // cap at 95 until blob ready
          }
        }

        if (fakeTimer) clearInterval(fakeTimer);
        if (cancelled) return;

        onProgress?.(98);
        const blob = new Blob(chunks);
        const url = URL.createObjectURL(blob);

        if (!cancelled) {
          revoke = url;
          setBlobUrl(url);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    })();

    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
      setBlobUrl(null);
      setError(null);
    };
  }, [remoteUrl]);  // eslint-disable-line react-hooks/exhaustive-deps

  return { blobUrl, error };
}
