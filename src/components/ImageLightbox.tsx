import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  attribution?: string;
}

interface ImageLightboxProps {
  image: LightboxImage | null;
  onClose: () => void;
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!image) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.caption || image.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 p-4 sm:p-8 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] max-w-6xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close expanded image"
          className="mb-3 ml-auto flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={image.src}
          alt={image.alt}
          referrerPolicy="no-referrer"
          className="max-h-[78vh] w-auto rounded-sm bg-white object-contain shadow-2xl"
        />

        {(image.caption || image.attribution) && (
          <div className="mt-3 max-w-3xl text-center text-sm text-stone-200">
            {image.caption && <p className="leading-relaxed">{image.caption}</p>}
            {image.attribution && (
              <p className="mt-1 text-xs text-stone-400">{image.attribution}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
