import { useEffect, useState } from 'react';

/**
 * Global blob cache — keyed by URL, stores the fetched Blob.
 * Call prefetchSplat() at module level to start the download
 * before React even bootstraps.
 */
const blobCache = new Map<string, Promise<Blob>>();

/** Kick off a splat download immediately. Safe to call multiple times. */
export function prefetchSplat(url: string) {
  if (!blobCache.has(url)) {
    blobCache.set(
      url,
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch splat: ${res.status}`);
        return res.blob();
      }),
    );
  }
}

/**
 * Returns a blob: URL for a splat file.
 * Uses the global cache so a prefetchSplat() call resolves instantly here.
 * CDN compression strips Content-Length which drei's SplatLoader requires;
 * blob URLs always have a correct Content-Length.
 */
export function useSplatBlobUrl(remoteUrl: string) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let cancelled = false;

    // Ensure the fetch is in the cache (no-op if prefetchSplat already called)
    prefetchSplat(remoteUrl);

    blobCache.get(remoteUrl)!.then((blob) => {
      const url = URL.createObjectURL(blob);
      if (!cancelled) {
        revoke = url;
        setBlobUrl(url);
      } else {
        URL.revokeObjectURL(url);
      }
    }).catch((e) => {
      if (!cancelled) setError(e as Error);
    });

    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
      setBlobUrl(null);
      setError(null);
    };
  }, [remoteUrl]);

  return { blobUrl, error };
}
