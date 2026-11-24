import { useEffect, useRef, useState } from 'react';
import { Expand, ExternalLink } from 'lucide-react';
import { SIDECAR_SLIDES, type SidecarSlide } from '../data/storyContent';
import type { LightboxImage } from './ImageLightbox';

interface SidecarSectionProps {
  onExpandImage: (img: LightboxImage) => void;
  isEmbedMode?: boolean;
}

export function SidecarSection({ onExpandImage, isEmbedMode = false }: SidecarSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const elements = slideRefs.current.filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-slide-index'));
            if (!Number.isNaN(idx)) {
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        rootMargin: '-38% 0px -42% 0px',
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeSlide: SidecarSlide = SIDECAR_SLIDES[activeIndex] ?? SIDECAR_SLIDES[0];

  const scrollToSlide = (idx: number) => {
    setActiveIndex(idx);
    const el = slideRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="mt-10 border-y border-stone-200 bg-[#F8F8F7]">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] xl:grid-cols-[540px_1fr]">
          {/* Left docked narrative rail */}
          <div className="divide-y divide-stone-200/80 border-r border-stone-200 bg-white">
            {/* Quick slide selector for direct jump */}
            <div
              className={`sticky ${
                isEmbedMode ? 'top-0' : 'top-14'
              } z-10 flex items-center justify-between gap-2 border-b border-stone-200 bg-white/95 px-6 py-3 backdrop-blur-xs`}
            >
              <span className="font-mono text-xs text-stone-500 tabular-nums">
                {activeSlide.indexLabel}
              </span>
              <div className="flex items-center gap-1" role="tablist" aria-label="Thematic map chapters">
                {SIDECAR_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === activeIndex}
                    onClick={() => scrollToSlide(idx)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      idx === activeIndex
                        ? 'bg-[#0A1B70] text-white'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {SIDECAR_SLIDES.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <article
                  key={slide.id}
                  ref={(el) => {
                    slideRefs.current[idx] = el;
                  }}
                  data-slide-index={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`cursor-pointer px-6 py-10 transition-colors sm:px-8 lg:min-h-[62vh] lg:flex lg:flex-col lg:justify-center ${
                    isActive ? 'bg-white' : 'bg-stone-50/60 hover:bg-white'
                  }`}
                >
                  <p className="font-mono text-xs text-stone-500 tabular-nums">
                    {slide.indexLabel}
                  </p>
                  <h4 className="mt-2 font-serif text-2xl font-semibold text-stone-900">
                    {slide.title}
                  </h4>

                  <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-stone-700">
                    {slide.paragraphs.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>

                  <a
                    href={slide.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#0A1B70] hover:underline"
                  >
                    {slide.sourceLabel}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>

                  {/* Mobile inline map preview (visible below lg breakpoint) */}
                  <div className="mt-6 lg:hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandImage({
                          src: slide.imageSrc,
                          alt: slide.imageAlt,
                          caption: slide.title,
                          attribution: slide.attribution,
                        });
                      }}
                      className="group relative block w-full overflow-hidden rounded-md border border-stone-200 bg-white text-left"
                    >
                      <img
                        src={slide.imageSrc}
                        alt={slide.imageAlt}
                        referrerPolicy="no-referrer"
                        className="block w-full object-contain"
                      />
                      <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded bg-stone-900/80 px-2.5 py-1 text-xs font-medium text-white">
                        <Expand className="h-3.5 w-3.5" />
                        Expand
                      </span>
                    </button>
                    <p className="mt-2 text-right text-xs text-stone-500">{slide.attribution}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Right sticky thematic map stage (desktop) — tightly framed to exact 3300:2462 map ratio */}
          <div className="hidden lg:block">
            <div
              className={`sticky ${
                isEmbedMode ? 'top-0 h-screen' : 'top-14 h-[calc(100vh-3.5rem)]'
              } flex flex-col items-center justify-center p-3 xl:p-4`}
            >
              <div
                className={`flex flex-col ${
                  isEmbedMode
                    ? 'w-[min(100%,calc((100vh-3rem)*1.3404))]'
                    : 'w-[min(100%,calc((100vh-6.5rem)*1.3404))]'
                }`}
              >
                <div className="relative aspect-[3300/2462] w-full overflow-hidden rounded-md border border-stone-200 bg-white shadow-xs">
                  {SIDECAR_SLIDES.map((slide, idx) => (
                    <img
                      key={slide.id}
                      src={slide.imageSrc}
                      alt={slide.imageAlt}
                      referrerPolicy="no-referrer"
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        idx === activeIndex ? 'opacity-100' : 'pointer-events-none opacity-0'
                      }`}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      onExpandImage({
                        src: activeSlide.imageSrc,
                        alt: activeSlide.imageAlt,
                        caption: activeSlide.title,
                        attribution: activeSlide.attribution,
                      })
                    }
                    className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white/95 px-2.5 py-1.5 text-xs font-medium text-stone-800 shadow-sm transition-colors hover:bg-stone-100"
                  >
                    <Expand className="h-3.5 w-3.5" />
                    Expand Map
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between px-0.5 text-xs text-stone-500">
                  <span className="font-medium text-stone-700">{activeSlide.title}</span>
                  <span>{activeSlide.attribution}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
