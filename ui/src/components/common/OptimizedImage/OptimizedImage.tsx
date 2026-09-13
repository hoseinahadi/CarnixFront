import Image, { type ImageProps } from 'next/image';
import { getMediaUrl } from '@/utils/media/getMediaUrl';

type OptimizedImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
};

/**
 * One image boundary for UI media. Backend-relative paths are normalized and
 * remote images use Next's optimizer; local preview/data/blob URLs stay
 * unoptimized because Next cannot fetch them from the image optimizer.
 */
export default function OptimizedImage({ src, alt, ...props }: OptimizedImageProps) {
  const normalized = getMediaUrl(src);
  if (!normalized) return null;

  const isLocalPreview = normalized.startsWith('blob:') || normalized.startsWith('data:');
  return <Image src={normalized} alt={alt} unoptimized={isLocalPreview} {...props} />;
}
