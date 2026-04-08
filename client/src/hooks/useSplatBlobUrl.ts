import { useEffect, useState } from 'react';

/**
 * Fetches a splat file and returns a blob: URL.
 * CDN compression strips Content-Length which drei's SplatLoader requires.
 * Blob URLs always have a correct Content-Length.
 */
export function useSplatBlobUrl(remoteUrl: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(remoteUrl);
        if (!res.ok) throw new Error(`Failed to fetch splat: ${res.status}`);
        const blob = await res.blob();
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
  }, [remoteUrl]);

  return { blobUrl, error };
}
