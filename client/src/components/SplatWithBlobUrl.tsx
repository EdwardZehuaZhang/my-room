/**
 * Wrapper around drei's <Splat> that uses a blob URL on production
 * to work around Vercel CDN stripping Content-Length from .splat files.
 */
import { Splat } from '@react-three/drei';
import { useSplatBlobUrl } from '../hooks/useSplatBlobUrl';

interface Props {
  src: string;
  onProgress?: (pct: number) => void;
  onLoaded?: () => void;
}

export default function SplatWithBlobUrl({ src, onProgress, onLoaded }: Props) {
  const { blobUrl } = useSplatBlobUrl(src, onProgress, onLoaded);
  if (!blobUrl) return null;
  return <Splat src={blobUrl} />;
}
