/**
 * Wrapper around drei's <Splat> that uses a blob URL on production
 * to work around Vercel CDN stripping Content-Length from .splat files.
 */
import { Splat } from '@react-three/drei';
import { useSplatBlobUrl } from '../hooks/useSplatBlobUrl';

export default function SplatWithBlobUrl({ src }: { src: string }) {
  const { blobUrl } = useSplatBlobUrl(src);
  if (!blobUrl) return null;
  return <Splat src={blobUrl} />;
}
