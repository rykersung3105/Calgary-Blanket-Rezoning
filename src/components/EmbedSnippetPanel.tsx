import { useMemo, useState } from 'react';
import { Check, Code2, Copy } from 'lucide-react';

type EmbedStyle = 'compact' | 'full';
type FrameHeight = '700px' | '850px' | '100vh';

const HEIGHT_OPTIONS: FrameHeight[] = ['700px', '850px', '100vh'];

export function EmbedSnippetPanel() {
  const [embedStyle, setEmbedStyle] = useState<EmbedStyle>('compact');
  const [frameHeight, setFrameHeight] = useState<FrameHeight>('850px');
  const [copied, setCopied] = useState(false);

  const basePageUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'https://<username>.github.io/<repo-name>/';
    }
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    return url.toString();
  }, []);

  const embedUrl = embedStyle === 'compact' ? `${basePageUrl}?embed=true` : basePageUrl;

  const snippet = `<iframe
  src="${embedUrl}"
  title="Calgary Blanket Rezoning — Interactive Geospatial Story"
  width="100%"
  height="${frameHeight}"
  style="border: 1px solid #e7e5e4; border-radius: 6px; display: block;"
  loading="lazy"
  allowfullscreen
></iframe>`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = snippet;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-xl font-semibold text-stone-900">
          Embed on Another Static Site
        </h3>
        <span className="font-mono text-xs text-stone-500">
          Supports ?embed=true compact mode
        </span>
      </div>
      <p className="mt-1.5 text-sm text-stone-600">
        Paste this snippet into any GitHub Pages site, portfolio, or static HTML page. Compact mode
        hides the top navigation bar so your host page&apos;s header stays uncluttered.
      </p>

      <div className="mt-5 rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Compact vs Full embed toggle */}
            <div className="flex items-center gap-1 rounded-md bg-stone-100 p-1" role="group" aria-label="Embed presentation style">
              <button
                type="button"
                onClick={() => setEmbedStyle('compact')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  embedStyle === 'compact'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Compact (No Top Bar)
              </button>
              <button
                type="button"
                onClick={() => setEmbedStyle('full')}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  embedStyle === 'full'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Full Header
              </button>
            </div>

            {/* Height preset selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Height</span>
              <div className="flex items-center gap-1 rounded-md bg-stone-100 p-1" role="group" aria-label="Iframe height">
                {HEIGHT_OPTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setFrameHeight(h)}
                    className={`rounded px-2.5 py-1 font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
                      frameHeight === h
                        ? 'bg-white font-medium text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0A1B70] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#081557] whitespace-nowrap shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy HTML
              </>
            )}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-stone-200 bg-stone-50 p-3.5">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
            <Code2 className="h-3.5 w-3.5" />
            <span>HTML Embed Snippet</span>
          </div>
          <pre className="font-mono text-xs leading-relaxed text-stone-800 select-all">
            <code>{snippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
