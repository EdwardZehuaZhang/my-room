import { useEffect, useState } from 'react';

export function useSplatBlobUrl(
  remoteUrl: string,
  onProgress?: (pct: number) => void,
  onLoaded?: () => void,
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

        // Fake progress timer when content-length is unavailable (Vercel CDN strips it)
        let fakeTimer: ReturnType<typeof setInterval> | null = null;
        let fakePct = 5;
        if (!total) {
          onProgress?.(fakePct);
          fakeTimer = setInterval(() => {
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
            onProgress?.(Math.round((received / total) * 95));
          }
        }

        if (fakeTimer) clearInterval(fakeTimer);
        if (cancelled) return;

        // Download complete — show 100% and dismiss loading overlay immediately.
        // Blob creation may still take a moment on low-end mobile devices.
        onProgress?.(100);
        onLoaded?.();

        const blob = new Blob(chunks as BlobPart[]);
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
  }, [remoteUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  return { blobUrl, error };
}
