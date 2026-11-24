import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Download, Expand, MapPin } from 'lucide-react';
import { CalgaryRezoningMap } from './components/CalgaryRezoningMap';
import { SidecarSection } from './components/SidecarSection';
import { BuildingPermitsChart } from './components/BuildingPermitsChart';
import { HousingStartsChart } from './components/HousingStartsChart';
import { ImageLightbox, type LightboxImage } from './components/ImageLightbox';
import { EmbedSnippetPanel } from './components/EmbedSnippetPanel';
import {
  LOCAL_DATASETS,
  SOURCE_CREDITS,
  SPOTLIGHT_NEIGHBOURHOODS,
} from './data/storyContent';
import { assetUrl } from './utils/assetUrl';

function detectEmbedMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const val = params.get('embed');
  return val === 'true' || val === '1';
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<LightboxImage | null>(null);
  const [focusedCommunity, setFocusedCommunity] = useState<string | null>(null);
  const [isEmbedMode] = useState<boolean>(() => detectEmbedMode());

  const fullStoryUrl = useMemo(() => {
    if (typeof window === 'undefined') return '#top';
    const url = new URL(window.location.href);
    url.searchParams.delete('embed');
    return url.toString();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) return;
      setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleInspectNeighbourhood = (communityKey: string) => {
    setFocusedCommunity(communityKey);
    const mapEl = document.getElementById('interactive-map');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900">
      {/* Sticky Top Bar — omitted in compact ?embed=true mode to prevent double headers */}
      {isEmbedMode ? (
        <div className="sticky top-0 z-40 h-[2px] w-full bg-stone-100">
          <div
            className="h-full bg-[#0A1B70] transition-[width] duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      ) : (
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-xs">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-8 px-5 sm:px-8">
            <a
              href="#top"
              className="font-serif text-base font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0"
            >
              Calgary Blanket Rezoning
            </a>

            <nav
              aria-label="Story chapters"
              className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600"
            >
              <a
                href="#introduction"
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Introduction
              </a>
              <a
                href="#spatial-analysis"
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Spatial Analysis
              </a>
              <a
                href="#permits"
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Permits &amp; Starts
              </a>
              <a
                href="#market-impact"
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Market Impact
              </a>
              <a
                href="#conclusion"
                className="transition-colors hover:text-stone-950 whitespace-nowrap shrink-0"
              >
                Conclusion
              </a>
            </nav>

            <div className="shrink-0">
              <a
                href="#sources"
                className="inline-flex items-center rounded-md bg-[#0A1B70] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#081557] whitespace-nowrap shrink-0"
              >
                Data &amp; Sources
              </a>
            </div>
          </div>

          {/* Thin horizontal editorial reading progress bar */}
          <div className="h-[2px] w-full bg-stone-100">
            <div
              className="h-full bg-[#0A1B70] transition-[width] duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </header>
      )}

      <main id="top">
        {/* Full-bleed Story Cover */}
        <section className="relative flex min-h-[78vh] w-full items-end overflow-hidden bg-stone-900">
          <img
            src={assetUrl('images/cover-saddledome.jpg')}
            alt="The Saddledome and Calgary skyline with downtown towers"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover object-[30%_50%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-stone-950/15"
          />

          {isEmbedMode && (
            <a
              href={fullStoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-md bg-stone-950/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xs transition-colors hover:bg-stone-950/90"
            >
              Open Full Story
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-14 pt-28 sm:px-10 lg:pb-20">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Calgary Blanket Rezoning
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-100 sm:text-xl">
                An examination of the effects of the 2024 Land-Use Blanket Rezoning Policy on
                housing objectives in Calgary.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-stone-300">
                <span>Ryker Sung</span>
                <span aria-hidden="true">·</span>
                <span>City of Calgary Urban Policy Analysis</span>
              </div>
            </div>

            <p className="mt-8 text-xs text-stone-300/90">
              Cover photo: Gorgo, via Good Free Photos (
              <a
                href="http://creativecommons.org/licenses/publicdomain/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                CC0 / Public Domain
              </a>
              )
            </p>
          </div>
        </section>

        {/* Section 1: Introduction */}
        <section id="introduction" className="mx-auto max-w-3xl px-6 pt-16 sm:px-8 lg:pt-24">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Introduction
          </h2>

          <h3 className="mt-8 font-serif text-xl font-semibold text-stone-900">The Policy</h3>
          <p className="mt-3 text-[16px] leading-[1.75] text-stone-700">
            The City of Calgary has been one of the fastest growing metro areas in Canada for the
            past decade, boasting a 351,381 increase in population between 2015 and 2025. To address
            rising population demands, Calgary&apos;s municipal government implemented blanket
            rezoning of over 300,000 land parcels from a variety of restricted, single-family lots
            to more flexible land use codes like R-CG (Grade-Oriented Infill), R-G (Low Density
            Mixed Housing), and H-GO (Housing Grade Oriented) on August 6th, 2024. By eliminating
            lengthy bureaucratic permit approval processes for multi-unit and high density
            residential developments, Calgary City Council hoped to meet rising housing demands,
            curb the rising affordability crisis, and leverage existing municipal infrastructure
            through densification rather than expansion.
          </p>
        </section>

        {/* Interactive Local GeoJSON + GeoTIFF Web Map */}
        <section id="interactive-map" className="mx-auto max-w-3xl px-6 sm:px-8">
          <CalgaryRezoningMap
            focusedCommunityKey={focusedCommunity}
            onClearFocus={() => setFocusedCommunity(null)}
          />
        </section>

        <section className="mx-auto max-w-3xl px-6 sm:px-8">
          <h3 className="mt-10 font-serif text-xl font-semibold text-stone-900">The Repeal</h3>
          <p className="mt-3 text-[16px] leading-[1.75] text-stone-700">
            Grassroots homeowner groups strongly opposed the policy, pointing to concerns of public
            infrastructure strain, disruption of neighbourhood aesthetics and exclusivity, impacts
            on home value, and loss of public input on neighbourhood developments. Following the
            2025 mayoral election and several public hearings including the largest in
            Calgary&apos;s history, the Blanket Rezoning Policy was eventually repealed on August
            4th, 2026. 99% of the lots converted to flexible, multi-unit land use codes were turned
            back into restrictive, single-family lots.
          </p>

          <h3 className="mt-10 font-serif text-xl font-semibold text-stone-900">Investigation</h3>
          <p className="mt-3 text-[16px] leading-[1.75] text-stone-700">
            Both proponents and opponents of the policy present reasonable concerns about housing
            prices, public infrastructure capacity, and future city development procedures, albeit
            on opposing ends. While the policy&apos;s short tenure limits any definitive empirical
            conclusions that can be drawn about its direct effects on housing prices, land-use
            studies such as{' '}
            <a
              href="https://www.sciencedirect.com/science/article/pii/S0094119024000597#cited-by"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#0A1B70] underline decoration-[#0A1B70]/35 underline-offset-2 hover:decoration-[#0A1B70]"
            >
              (Büchler &amp; Lutz, 2024)
            </a>{' '}
            suggest that increases in residential unit supply can have a city-wide impact on rent
            and homeownership costs. Meanwhile, Maggie Choi (City Manager of Growth Infrastructure
            Planning) presented findings that less than 1% of homes approved under the rezoning
            policy would cause new public infrastructure needs in a 2025 report, questioning the
            validity of infrastructure capacity concerns.
          </p>

          <p className="mt-5 text-[16px] leading-[1.75] text-stone-700">
            This examination hopes to provide data-driven clarity regarding such issues in the
            following ways:
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-[16px] leading-[1.7] text-stone-700">
            <li>
              Exploring the immediate policy impact areas and its overlap with key indicators like
              schools, public service requests, and development stage,
            </li>
            <li>Investigating tangible changes in permit approval efficiency,</li>
            <li>
              Determining whether permit efficiency has translated into housing development
              increases,
            </li>
            <li>Examining initial market changes in homeownership and rent.</li>
          </ol>

          <p className="mt-6 text-sm text-stone-500">
            Sources:{' '}
            <a
              href="https://regionaldashboard.alberta.ca/region/calgary/population/#/?from=2015&to=2025"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A1B70] hover:underline"
            >
              Office of Statistics and Information, Alberta Treasury Board and Finance
            </a>
            ,{' '}
            <a
              href="https://www.calgary.ca/planning/projects/rezoning/background-info.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A1B70] hover:underline"
            >
              City of Calgary Housing Strategy
            </a>
          </p>
        </section>

        {/* Section 2: Immediate Policy Effect (Docked Sidecar) */}
        <section id="spatial-analysis" className="pt-20">
          <div className="mx-auto max-w-3xl px-6 sm:px-8">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Immediate Policy Effect
            </h2>
            <p className="mt-4 text-[16px] leading-[1.75] text-stone-700">
              Due to the short policy period, development applications provide the most immediate
              insight into how blanket rezoning impacted housing supply and demand. The following
              maps compare new developments by community district to variables of interest, and
              reveal spatial patterns of development distribution.
            </p>
          </div>

          <SidecarSection onExpandImage={setLightboxImage} isEmbedMode={isEmbedMode} />
        </section>

        {/* Section 3: Permit Application Efficiency Changes */}
        <section id="permits" className="mx-auto max-w-5xl px-6 pt-20 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Permit Application Efficiency Changes
            </h2>
            <p className="mt-4 text-[16px] leading-[1.75] text-stone-700">
              The City of Calgary exhibited one of the highest proportions of single-family homes in
              Canadian metro areas at <strong className="font-semibold text-stone-900">55%</strong>{' '}
              in 2021, compared to 45% in Ottawa, 39% in Toronto, and 29% in Vancouver (Statistics
              Canada 2021). A primary objective of blanket rezoning was to enable efficient
              permitting processes for multi-unit developments by bypassing community approval
              hearings and bureaucratic application backlogs. To examine the tangible effects on
              real developments, we move from development permits to building permit applications:
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <BuildingPermitsChart />
          </div>

          <hr className="mx-auto my-16 max-w-4xl border-stone-200" />

          {/* Section 4: Realization of Permit Efficiency */}
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Realization of Permit Efficiency
            </h2>
            <p className="mt-4 text-[16px] leading-[1.75] text-stone-700">
              Permit efficiency works in theory to enable faster construction and increased
              development volume, but impact on housing stock is largely dependent on supply
              elasticity. We can see the changes in actual development project starts in the
              following graphic:
            </p>
          </div>

          <HousingStartsChart />

          <div className="mx-auto max-w-3xl space-y-5 text-[16px] leading-[1.75] text-stone-700">
            <p>
              Firstly, examine the two dotted lines indicating average housing starts before and
              during the policy period. The two year period after blanket rezoning indicates roughly
              a <strong className="font-semibold text-stone-900">40%</strong> increase in new
              construction projects compared to the period preceding. Most notably, May and October
              of 2025 saw over <strong className="font-semibold text-stone-900">2700</strong> new
              construction starts, contributing to the highest construction start rate in 2025
              amongst Canadian municipalities.
            </p>
            <p>
              Next, compare the gap between overall and multi-unit housing starts. It is possible to
              visually observe a much closer spread between the two metrics after the policy
              effective date. You may notice that the spread in the earlier months of the policy
              period remained relatively large. Despite permit efficiency, housing starts still
              require planning and approval processes, meaning increases in actual construction lag
              behind.
            </p>
          </div>

          <hr className="my-16 border-stone-200" />
        </section>

        {/* Section 5: Preliminary Market Response */}
        <section id="market-impact" className="mx-auto max-w-5xl px-6 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              Preliminary Market Response
            </h2>
            <p className="mt-4 text-[16px] leading-[1.75] text-stone-700">
              Permit efficiency and new constructions are excellent metrics to track housing stock
              changes, but the outcomes are only realized by Calgary residents through meaningful
              changes in housing costs. We will examine two metrics, average multi-unit asking rent
              and median single-family home value, which reflect the concerns of both policy
              proponents (housing affordability) and opposing homeowners (home value depreciation).
              It is important to note that conclusive causal relationships cannot be drawn between
              market factors and any aforementioned variables due to the short policy period and
              unaddressed confounding variables.
            </p>
          </div>

          {/* Asking Rent Prices */}
          <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <button
                type="button"
                onClick={() =>
                  setLightboxImage({
                    src: assetUrl('images/chart-asking-rent.png'),
                    alt: 'Average monthly asking rent prices in Calgary across bedroom counts',
                    caption: 'Calgary Average Asking Rent Prices (2023–2026)',
                  })
                }
                className="group relative block w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-left transition-shadow hover:shadow-md"
              >
                <img
                  src={assetUrl('images/chart-asking-rent.png')}
                  alt="Average monthly asking rent prices in Calgary across bedroom counts"
                  referrerPolicy="no-referrer"
                  className="w-full object-contain"
                />
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded bg-stone-900/80 px-2.5 py-1 text-xs font-medium text-white opacity-90 transition-opacity group-hover:opacity-100">
                  <Expand className="h-3.5 w-3.5" />
                  Expand
                </span>
              </button>
            </div>

            <div className="lg:col-span-5 lg:pt-2">
              <h3 className="font-serif text-2xl font-semibold text-stone-900">
                Asking Rent Prices
              </h3>
              <p className="mt-3 text-[15px] leading-[1.75] text-stone-700">
                Before the blanket rezoning took place, rental prices hit an all-time high in
                Calgary, reaching a monthly rent of{' '}
                <strong className="font-semibold text-stone-900">$1770</strong> for 1-bedroom units
                and <strong className="font-semibold text-stone-900">$2410</strong> for 3+ bedroom
                units in Q4 2023 and Q1 2024, respectively. The highlighted period shows this spike
                remediate as multi-unit housing supply catches up with population demand, with an{' '}
                <strong className="font-semibold text-stone-900">11%</strong> decline in average
                asking rents for 1-bedroom and 3+ bedroom units from the beginning of 2024 to 2026.
                All unit types continued this trend into the second half of 2026, with the exception
                of large units for which demand remains high.
              </p>
            </div>
          </div>

          {/* Single-Family Home Value */}
          <div className="mt-16 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h3 className="font-serif text-2xl font-semibold text-stone-900">
                Single-Family Home Value
              </h3>
              <p className="mt-3 text-[15px] leading-[1.75] text-stone-700">
                Grassroots homeowners expressed concern that their home value was at risk, due to
                degraded neighbourhood aesthetics and a sudden supply spike. Examining the map to
                the right, it is evident that single family homes throughout the City of Calgary are
                experiencing a rise, not decline, in value. Let&apos;s take a closer look at 5
                neighbourhoods highly impacted by new policy-enabled developments:
              </p>

              {/* Tabular breakdown of the 5 spotlight neighbourhoods */}
              <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <tr>
                      <th className="px-3.5 py-2.5 font-medium">Neighbourhood</th>
                      <th className="px-3 py-2.5 text-right font-medium">2024 Median</th>
                      <th className="px-3 py-2.5 text-right font-medium">2026 Median</th>
                      <th className="px-3.5 py-2.5 text-right font-medium">% Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {SPOTLIGHT_NEIGHBOURHOODS.map((n) => (
                      <tr key={n.name} className="transition-colors hover:bg-stone-50">
                        <td className="px-3.5 py-2.5 font-medium text-stone-900">
                          <button
                            type="button"
                            onClick={() => handleInspectNeighbourhood(n.communityKey)}
                            className="inline-flex items-center gap-1.5 text-left text-[#0A1B70] hover:underline"
                            title={`Inspect ${n.name} on the interactive GeoJSON/GeoTIFF map`}
                          >
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {n.name}
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-stone-700 tabular-nums">
                          ${n.value2024.toLocaleString()}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-stone-900 tabular-nums">
                          ${n.value2026.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                          +{n.pctChange.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-stone-500">
                Select any neighbourhood above to focus on its rezoned parcels on the interactive
                map.
              </p>
            </div>

            <div className="lg:col-span-6">
              <figure>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxImage({
                      src: assetUrl('images/map-home-value.png'),
                      alt: 'Map of single-family home value change across Calgary neighbourhoods highlighting Bowness, Montgomery, Killarney, Altadore, and Ogden',
                      caption:
                        '5 Labeled neighbourhoods represent some of the most impacted neighbourhoods by new development/building permits.',
                    })
                  }
                  className="group relative block w-full overflow-hidden rounded-lg border border-stone-200 bg-white text-left transition-shadow hover:shadow-md"
                >
                  <img
                    src={assetUrl('images/map-home-value.png')}
                    alt="Map of single-family home value change across Calgary neighbourhoods"
                    referrerPolicy="no-referrer"
                    className="w-full object-contain"
                  />
                  <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded bg-stone-900/80 px-2.5 py-1 text-xs font-medium text-white opacity-90 transition-opacity group-hover:opacity-100">
                    <Expand className="h-3.5 w-3.5" />
                    Expand
                  </span>
                </button>
                <figcaption className="mt-2.5 text-xs leading-relaxed text-stone-600">
                  5 Labeled neighbourhoods represent some of the most impacted neighbourhoods by new
                  development/building permits.
                </figcaption>
              </figure>
            </div>
          </div>

          <hr className="my-16 border-stone-200" />
        </section>

        {/* Section 6: Conclusion, Takeaways, Future Research & Ethics */}
        <section id="conclusion" className="mx-auto max-w-3xl px-6 pb-16 sm:px-8">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Conclusion
          </h2>
          <p className="mt-4 text-[16px] leading-[1.75] text-stone-700">
            Through the investigation of development applications, building permits, housing data,
            and various relevant social variables, it becomes evident that spatial patterns exist in
            the outcomes of the 2024 Blanket Rezoning Policy. While tangible changes in housing
            construction and permit efficiency have been realized, the long term effects are yet to
            be seen. In the 24 months for which the policy was active, Calgary saw historic housing
            growth rates, curbed rent costs, and sustained homeownership value. Simultaneously, the
            spatial distribution of 311 requests raises questions about whether Calgary municipal
            infrastructure is ready to accommodate such a sudden boom in population density.
          </p>

          <figure className="my-10">
            <button
              type="button"
              onClick={() =>
                setLightboxImage({
                  src: assetUrl('images/sage-hill-townhouses.jpg'),
                  alt: 'Townhouse construction in Sage Hill, Calgary (2024)',
                  caption: 'Townhouse construction in Sage Hill, Calgary (2024)',
                  attribution: 'Gravity Architecture',
                })
              }
              className="group relative block w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100 text-left"
            >
              <img
                src={assetUrl('images/sage-hill-townhouses.jpg')}
                alt="Townhouse construction in Sage Hill, Calgary (2024)"
                referrerPolicy="no-referrer"
                className="w-full object-cover"
              />
              <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded bg-stone-900/80 px-2.5 py-1 text-xs font-medium text-white opacity-90 transition-opacity group-hover:opacity-100">
                <Expand className="h-3.5 w-3.5" />
                Expand
              </span>
            </button>
            <figcaption className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
              <span>Townhouse construction in Sage Hill, Calgary (2024)</span>
              <span>Photo: Gravity Architecture</span>
            </figcaption>
          </figure>

          <h3 className="mt-10 font-serif text-xl font-semibold text-stone-900">Takeaways</h3>
          <div className="mt-3 space-y-4 text-[16px] leading-[1.75] text-stone-700">
            <p>
              From a policy standpoint, blanket rezoning did not fail to demonstrate financial
              feasibility or real impact; instead NIMBYism and alienation of grassroots stakeholders
              lead to its repeal. Additionally, an overnight rezoning of thousands of lots made
              quantifying positive policy effects difficult, while causing general homeowner
              sentiment to shift toward concern. Coupled with public infrastructure and funding
              concerns already prevalent in established, older communities where development
              concentrated, the policy was vulnerable to political change and public protest.
            </p>
            <p>
              Planners should reflect these considerations in future attempts at mass land-use
              rezoning. While proving a policy&apos;s mathematical soundness is the first step,
              policymakers must maintain channels for participatory input by Calgary residents and
              homeowners on policies impacting their communities. These resident groups need to see
              their concerns addressed with real policy solutions such as linking new public
              infrastructure investments to anticipated population growth, or measures to protect
              community aesthetics and integrity. Finally, planners should consider targeted
              rezoning measures in specific communities with population decline, aging housing
              stock, and underutilized public utilities. By replacing blanket measures with
              empirically-backed, selective upzoning, the City of Calgary can cool collective
              homeowner resistance, prevent infrastructure strain, and strategically target the
              highest impact areas for Calgarians.
            </p>
          </div>

          <h3 className="mt-10 font-serif text-xl font-semibold text-stone-900">Future Research</h3>
          <div className="mt-3 space-y-4 text-[16px] leading-[1.75] text-stone-700">
            <p>
              To implement changes mentioned above, further spatial analysis is required beyond the
              scope of this narrative. Some examples include:
            </p>
            <p>
              <strong className="font-semibold text-stone-900">
                Geographic Weighted Regression Analysis:
              </strong>{' '}
              Utilize transit-accessibility, public infrastructure capacities, and population change
              as variables to predict ideal locations for development density.
            </p>
            <p>
              <strong className="font-semibold text-stone-900">Linear Regression Analysis:</strong>{' '}
              Measure the relationship between housing stock change and shelter cost changes.
            </p>
            <p>
              <strong className="font-semibold text-stone-900">
                Social Impact Distribution Analysis:
              </strong>{' '}
              Determine what social groups are impacted most by housing demolitions and rebuilds, or
              disproportionately relocated by sudden changes in housing cost.
            </p>
          </div>

          <h3 className="mt-10 font-serif text-xl font-semibold text-stone-900">Ethics</h3>
          <div className="mt-3 space-y-4 text-[16px] leading-[1.75] text-stone-700">
            <p>
              The data visualized is not intended to discredit or condone any policy stance, but
              rather present an objective narrative informing Calgary voters, policy stakeholders,
              and urban planners of relevant policy impacts. To ensure unbiased interpretation of
              the data, keep the following disclaimers in mind:
            </p>
            <p>
              <strong className="font-semibold text-stone-900">
                Development may be gentrification in disguise,
              </strong>{' '}
              when naturally occurring affordable housing (such as older bungalows in Killarney) is
              demolished and rebuilt into luxury townhomes and condos. Neither the change in
              property value nor the development density maps should be utilized as speculative real
              estate investment tools.
            </p>
            <p>
              <strong className="font-semibold text-stone-900">
                Correlation does not equal causation
              </strong>
              , especially when comparing short-term market changes.{' '}
              <a
                href="https://doi.org/10.1016/j.jue.2024.103689"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#0A1B70] underline decoration-[#0A1B70]/35 underline-offset-2 hover:decoration-[#0A1B70]"
              >
                (Büchler &amp; Lutz, 2024)
              </a>{' '}
              suggest real policy-driven market changes can take up to 10 years. The data shown only
              identifies the initial development responses and early trends.
            </p>
            <p>
              <strong className="font-semibold text-stone-900">
                Socioeconomic factors can be lost in numerical data
              </strong>
              ; this narrative does not address qualitative observations or characterization as
              evidence. Specific ethnic, social, religious, or other identity groups may be
              disproportionately impacted by the policy, or excluded from realization of benefits.
            </p>
          </div>
        </section>

        {/* Section 7: Sources & Offline Local Datasets */}
        <footer id="sources" className="border-t border-stone-200 bg-[#F8F8F7] py-16">
          <div className="mx-auto max-w-4xl px-6 sm:px-8">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">
              Sources
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              The following data sources, articles, and multi-media were utilized in the creation of
              this story map:
            </p>

            <dl className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
              {SOURCE_CREDITS.map((credit) => (
                <div
                  key={credit.title}
                  className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-12 sm:gap-6"
                >
                  <dt className="text-sm font-semibold text-stone-900 sm:col-span-5">
                    {credit.title}
                  </dt>
                  <dd className="break-words text-sm text-stone-600 sm:col-span-7">
                    {credit.prefixText && <span>{credit.prefixText}</span>}
                    {credit.url ? (
                      <a
                        href={credit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#0A1B70] hover:underline"
                      >
                        <span className="break-all">{credit.text}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span>{credit.text}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Local Offline GeoJSON & GeoTIFF Files */}
            <div className="mt-14">
              <h3 className="font-serif text-xl font-semibold text-stone-900">
                Bundled Local Datasets (No Cloud Feature Layers)
              </h3>
              <p className="mt-1.5 text-sm text-stone-600">
                All geospatial and statistical layers powering this standalone application are
                served directly from local GeoJSON, GeoTIFF, and JSON files without relying on
                ArcGIS Online hosted feature services.
              </p>

              <div className="mt-5 overflow-x-auto rounded-lg border border-stone-200 bg-white">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">File</th>
                      <th className="px-4 py-3 font-medium">Format</th>
                      <th className="px-4 py-3 font-medium">Coverage</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 text-right font-medium">Download</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {LOCAL_DATASETS.map((ds) => (
                      <tr key={ds.name} className="hover:bg-stone-50/70">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-stone-900 whitespace-nowrap">
                          {ds.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-stone-600 whitespace-nowrap">
                          {ds.format}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-stone-600 tabular-nums whitespace-nowrap">
                          {ds.records}
                        </td>
                        <td className="px-4 py-3 text-xs leading-relaxed text-stone-600">
                          {ds.description}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <a
                            href={ds.path}
                            download={ds.name}
                            className="inline-flex items-center gap-1 font-medium text-[#0A1B70] hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Save
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!isEmbedMode && <EmbedSnippetPanel />}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6 text-xs text-stone-500">
              <span>Calgary Blanket Rezoning · Standalone Editorial Web Application</span>
              <div className="flex items-center gap-4">
                {isEmbedMode && (
                  <a
                    href={fullStoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[#0A1B70] hover:underline"
                  >
                    Open Full Story
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
                <span>Narrative &amp; Cartography by Ryker Sung</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
}
