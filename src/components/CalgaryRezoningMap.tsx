import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { fromArrayBuffer } from 'geotiff';
import { Download, Layers, RotateCcw, Search, X } from 'lucide-react';
import { assetUrl } from '../utils/assetUrl';

interface CommunityProperties {
  NAME?: string;
  COMM_CODE?: string;
  CLASS?: string;
  SECTOR?: string;
  SRG?: string;
  COMM_STRUCTURE?: string;
  REZONED_R_CG?: number;
  REZONED_R_G?: number;
  REZONED_H_GO?: number;
  REZONED_TOTAL?: number;
}

interface CommunityFeature {
  type: 'Feature';
  properties: CommunityProperties;
  geometry: GeoJSON.Geometry;
}

interface CommunityGeoJSON {
  type: 'FeatureCollection';
  features: CommunityFeature[];
}

interface GeoTiffRasterState {
  width: number;
  height: number;
  bbox3857: [number, number, number, number];
  bounds4326: [[number, number], [number, number]];
  data: Uint8Array;
}

interface SelectedInspection {
  community: CommunityProperties | null;
  sampledCode: string | null;
  lat: number;
  lng: number;
}

interface CalgaryRezoningMapProps {
  focusedCommunityKey?: string | null;
  onClearFocus?: () => void;
}

const EARTH_RADIUS_ORIGIN = 20037508.34;

function mercatorToLatLng(x: number, y: number): [number, number] {
  const lng = (x / EARTH_RADIUS_ORIGIN) * 180;
  const lat = (Math.atan(Math.sinh((y / EARTH_RADIUS_ORIGIN) * Math.PI)) * 180) / Math.PI;
  return [lat, lng];
}

function latLngToMercator(lat: number, lng: number): [number, number] {
  const x = (lng * EARTH_RADIUS_ORIGIN) / 180;
  const y =
    (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) *
    (EARTH_RADIUS_ORIGIN / 180);
  return [x, y];
}

// Exact RGB symbology extracted from the original ArcGIS Web Map renderer
const LAND_USE_META = [
  {
    code: 1,
    id: 'R-CG',
    label: 'R-CG',
    description: 'Residential — Grade-Oriented Infill',
    count: 216833,
    hex: '#0A1B70',
    rgb: [10, 27, 112] as const,
  },
  {
    code: 2,
    id: 'R-G',
    label: 'R-G',
    description: 'Residential — Low Density Mixed Housing',
    count: 89952,
    hex: '#669AFA',
    rgb: [102, 154, 250] as const,
  },
  {
    code: 3,
    id: 'H-GO',
    label: 'H-GO',
    description: 'Housing — Grade Oriented',
    count: 2961,
    hex: '#47A4DE',
    rgb: [71, 164, 222] as const,
  },
];

const INITIAL_CENTER: [number, number] = [51.0447, -114.0719];
const INITIAL_ZOOM = 10;

export function CalgaryRezoningMap({
  focusedCommunityKey,
  onClearFocus,
}: CalgaryRezoningMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tifOverlayRef = useRef<L.ImageOverlay | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const featureLayerMapRef = useRef<Map<string, L.Layer>>(new Map());
  const rasterRef = useRef<GeoTiffRasterState | null>(null);

  const [geoData, setGeoData] = useState<CommunityGeoJSON | null>(null);
  const [rasterLoaded, setRasterLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Layer and legend filter state
  const [showDistricts, setShowDistricts] = useState(true);
  const [showParcels, setShowParcels] = useState(true);
  const [parcelOpacity, setParcelOpacity] = useState(0.88);
  const [activeCodes, setActiveCodes] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });
  const [legendOpen, setLegendOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<SelectedInspection | null>(null);

  const communityNames = useMemo(() => {
    if (!geoData) return [];
    return geoData.features
      .map((f) => ({
        name: f.properties.NAME || '',
        total: f.properties.REZONED_TOTAL || 0,
      }))
      .filter((c) => c.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [geoData]);

  const filteredCommunities = useMemo(() => {
    const q = searchQuery.trim().toUpperCase();
    if (!q) return [];
    return communityNames.filter((c) => c.name.toUpperCase().includes(q)).slice(0, 6);
  }, [communityNames, searchQuery]);

  // Sample land use code directly from local GeoTIFF raster buffer
  const sampleRasterAtLatLng = (lat: number, lng: number): string | null => {
    const raster = rasterRef.current;
    if (!raster) return null;
    const [mx, my] = latLngToMercator(lat, lng);
    const [xmin, ymin, xmax, ymax] = raster.bbox3857;
    if (mx < xmin || mx > xmax || my < ymin || my > ymax) return null;
    const px = Math.floor(((mx - xmin) / (xmax - xmin)) * raster.width);
    const py = Math.floor(((ymax - my) / (ymax - ymin)) * raster.height);
    if (px < 0 || px >= raster.width || py < 0 || py >= raster.height) return null;
    const val = raster.data[py * raster.width + px];
    if (val === 1) return 'R-CG';
    if (val === 2) return 'R-G';
    if (val === 3) return 'H-GO';
    return null;
  };

  // Initialize Leaflet map and fetch local GeoJSON + GeoTIFF files
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      minZoom: 9,
      maxZoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);

    // Clean keyless OpenStreetMap basemap styled as Light Gray Canvas
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'calgary-basemap-tiles',
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Custom pane ordering: raster parcels below community district crisp outlines
    map.createPane('parcelsPane');
    const parcelsPane = map.getPane('parcelsPane');
    if (parcelsPane) {
      parcelsPane.style.zIndex = '380';
      parcelsPane.style.pointerEvents = 'none';
    }
    map.createPane('districtsPane');
    const districtsPane = map.getPane('districtsPane');
    if (districtsPane) {
      districtsPane.style.zIndex = '420';
    }

    mapRef.current = map;

    let cancelled = false;

    async function loadLocalGeospatialData() {
      try {
        const [geojsonRes, tiffRes] = await Promise.all([
          fetch(assetUrl('data/community_districts.geojson')),
          fetch(assetUrl('data/rezoned_parcels.tif')),
        ]);

        if (!geojsonRes.ok) {
          throw new Error(`Unable to load community_districts.geojson (${geojsonRes.status})`);
        }
        if (!tiffRes.ok) {
          throw new Error(`Unable to load rezoned_parcels.tif (${tiffRes.status})`);
        }

        const [parsedGeo, tiffBuffer] = await Promise.all([
          geojsonRes.json() as Promise<CommunityGeoJSON>,
          tiffRes.arrayBuffer(),
        ]);

        const tiff = await fromArrayBuffer(tiffBuffer);
        const image = await tiff.getImage();
        const bbox = image.getBoundingBox() as [number, number, number, number];
        const width = image.getWidth();
        const height = image.getHeight();
        const rasters = await image.readRasters();
        const band = rasters[0] as Uint8Array;

        const sw = mercatorToLatLng(bbox[0], bbox[1]);
        const ne = mercatorToLatLng(bbox[2], bbox[3]);

        if (cancelled) return;

        rasterRef.current = {
          width,
          height,
          bbox3857: bbox,
          bounds4326: [sw, ne],
          data: band,
        };

        setGeoData(parsedGeo);
        setRasterLoaded(true);
      } catch (err) {
        if (!cancelled) {
          setLoadingError(
            err instanceof Error ? err.message : 'Failed to load local GeoJSON and GeoTIFF data.'
          );
        }
      }
    }

    loadLocalGeospatialData();

    return () => {
      cancelled = true;
      map.remove();
      mapRef.current = null;
      tifOverlayRef.current = null;
      geoJsonLayerRef.current = null;
      featureLayerMapRef.current.clear();
    };
  }, []);

  // Render GeoTIFF pixel buffer onto offscreen canvas whenever land-use filter changes
  useEffect(() => {
    const map = mapRef.current;
    const raster = rasterRef.current;
    if (!map || !raster || !rasterLoaded) return;

    if (tifOverlayRef.current) {
      tifOverlayRef.current.remove();
      tifOverlayRef.current = null;
    }

    if (!showParcels) return;

    const canvas = document.createElement('canvas');
    canvas.width = raster.width;
    canvas.height = raster.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(raster.width, raster.height);
    const rgba = imgData.data;
    const src = raster.data;

    const allow1 = activeCodes[1];
    const allow2 = activeCodes[2];
    const allow3 = activeCodes[3];

    for (let i = 0, p = 0; i < src.length; i++, p += 4) {
      const v = src[i];
      if (v === 1 && allow1) {
        rgba[p] = 10;
        rgba[p + 1] = 27;
        rgba[p + 2] = 112;
        rgba[p + 3] = 255;
      } else if (v === 2 && allow2) {
        rgba[p] = 102;
        rgba[p + 1] = 154;
        rgba[p + 2] = 250;
        rgba[p + 3] = 255;
      } else if (v === 3 && allow3) {
        rgba[p] = 71;
        rgba[p + 1] = 164;
        rgba[p + 2] = 222;
        rgba[p + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    const overlay = L.imageOverlay(dataUrl, raster.bounds4326, {
      opacity: parcelOpacity,
      pane: 'parcelsPane',
      interactive: false,
    }).addTo(map);

    tifOverlayRef.current = overlay;
  }, [rasterLoaded, showParcels, activeCodes, parcelOpacity]);

  // Render Community Districts GeoJSON vector boundaries
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoData) return;

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
      geoJsonLayerRef.current = null;
      featureLayerMapRef.current.clear();
    }

    if (!showDistricts) return;

    const layer = L.geoJSON(geoData as GeoJSON.GeoJsonObject, {
      pane: 'districtsPane',
      style: () => ({
        color: '#1A1A1A',
        weight: 0.85,
        opacity: 0.78,
        fillColor: '#FFFFFF',
        fillOpacity: 0.03,
      }),
      onEachFeature: (feature, featureLayer) => {
        const props = (feature.properties || {}) as CommunityProperties;
        const nameKey = (props.NAME || '').toUpperCase().trim();
        if (nameKey) {
          featureLayerMapRef.current.set(nameKey, featureLayer);
        }

        featureLayer.on({
          mouseover: (e) => {
            const target = e.target as L.Path;
            target.setStyle({
              weight: 2,
              color: '#0A1B70',
              fillColor: '#0A1B70',
              fillOpacity: 0.08,
            });
          },
          mouseout: (e) => {
            layer.resetStyle(e.target as L.Path);
          },
          click: (e: L.LeafletMouseEvent) => {
            const sampledCode = sampleRasterAtLatLng(e.latlng.lat, e.latlng.lng);
            setSelected({
              community: props,
              sampledCode,
              lat: e.latlng.lat,
              lng: e.latlng.lng,
            });
          },
        });
      },
    }).addTo(map);

    geoJsonLayerRef.current = layer;
  }, [geoData, showDistricts]);

  // Focus on a requested community from elsewhere in the StoryMap (e.g., 5 spotlight neighbourhoods)
  const focusCommunityByName = (communityName: string) => {
    const map = mapRef.current;
    if (!map) return;
    const key = communityName.toUpperCase().trim();
    const targetLayer = featureLayerMapRef.current.get(key) as L.Polygon | undefined;
    if (targetLayer && typeof targetLayer.getBounds === 'function') {
      const bounds = targetLayer.getBounds();
      map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 13, duration: 0.8 });
      const center = bounds.getCenter();
      const feat = geoData?.features.find(
        (f) => (f.properties.NAME || '').toUpperCase().trim() === key
      );
      if (feat) {
        setSelected({
          community: feat.properties,
          sampledCode: sampleRasterAtLatLng(center.lat, center.lng),
          lat: center.lat,
          lng: center.lng,
        });
      }
    }
  };

  useEffect(() => {
    if (focusedCommunityKey && geoData) {
      focusCommunityByName(focusedCommunityKey);
      onClearFocus?.();
    }
  }, [focusedCommunityKey, geoData]);

  const handleResetView = () => {
    mapRef.current?.flyTo(INITIAL_CENTER, INITIAL_ZOOM, { duration: 0.6 });
    setSelected(null);
    setSearchQuery('');
  };

  const toggleCode = (code: number) => {
    setActiveCodes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const formatNumber = (n?: number) => (n ?? 0).toLocaleString('en-CA');

  return (
    <figure className="my-10">
      <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-xs">
        {/* Top map toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLegendOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 whitespace-nowrap shrink-0"
            >
              <Layers className="h-3.5 w-3.5 text-[#0A1B70]" />
              {legendOpen ? 'Hide Legend' : 'Show Legend'}
            </button>

            <button
              type="button"
              onClick={handleResetView}
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Extent
            </button>
          </div>

          {/* Community District search */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find community (e.g. Bowness)..."
              aria-label="Search Calgary community districts"
              className="w-full rounded-md border border-stone-200 bg-stone-50 py-1.5 pl-8 pr-7 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#0A1B70] focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {filteredCommunities.length > 0 && (
              <ul className="absolute right-0 top-full z-[1000] mt-1 w-full rounded-md border border-stone-200 bg-white py-1 shadow-lg">
                {filteredCommunities.map((item) => (
                  <li key={item.name}>
                    <button
                      type="button"
                      onClick={() => {
                        focusCommunityByName(item.name);
                        setSearchQuery('');
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-stone-50"
                    >
                      <span className="font-medium text-stone-900">{item.name}</span>
                      <span className="font-mono tabular-nums text-stone-500">
                        {item.total.toLocaleString()} lots
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Map stage */}
        <div className="relative h-[460px] w-full sm:h-[520px]">
          <div ref={mapContainerRef} className="h-full w-full" />

          {/* Loading state */}
          {(!geoData || !rasterLoaded) && !loadingError && (
            <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center bg-stone-100/80 backdrop-blur-xs">
              <div className="rounded-md border border-stone-200 bg-white px-5 py-3 text-sm text-stone-700 shadow-sm">
                Loading local GeoJSON &amp; GeoTIFF layers…
              </div>
            </div>
          )}

          {/* Error state */}
          {loadingError && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-stone-50 p-6">
              <div className="max-w-md rounded-md border border-red-200 bg-white p-5 text-sm text-red-800">
                <p className="font-semibold">Unable to render local map layers</p>
                <p className="mt-1 text-stone-600">{loadingError}</p>
              </div>
            </div>
          )}

          {/* Pinned Legend Panel (matching StoryMap legendPinned: true) */}
          {legendOpen && (
            <aside className="absolute bottom-8 left-2.5 z-[450] w-60 max-w-[calc(100%-1.25rem)] rounded-md border border-stone-200 bg-white/95 p-3 text-xs shadow-md backdrop-blur-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <span className="font-semibold text-stone-900">Map Legend &amp; Layers</span>
                <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                  309,746 parcels
                </span>
              </div>

              {/* Community Districts GeoJSON toggle */}
              <div className="mt-3">
                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={showDistricts}
                      onChange={(e) => setShowDistricts(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#0A1B70]"
                    />
                    <span className="inline-block h-3.5 w-3.5 border border-stone-900 bg-white" />
                    Community Districts
                  </span>
                  <span className="font-mono text-[11px] text-stone-400">GeoJSON</span>
                </label>
              </div>

              {/* Rezoned Land Parcels GeoTIFF toggle + filter checkboxes */}
              <div className="mt-3 border-t border-stone-100 pt-3">
                <label className="flex cursor-pointer items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium text-stone-800">
                    <input
                      type="checkbox"
                      checked={showParcels}
                      onChange={(e) => setShowParcels(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#0A1B70]"
                    />
                    Rezoned Land Parcels
                  </span>
                  <span className="font-mono text-[11px] text-stone-400">GeoTIFF</span>
                </label>

                <div className="mt-2.5 space-y-2 pl-1">
                  {LAND_USE_META.map((item) => {
                    const checked = activeCodes[item.code];
                    return (
                      <label
                        key={item.id}
                        className={`flex cursor-pointer items-start justify-between gap-2 transition-opacity ${
                          showParcels ? 'opacity-100' : 'opacity-45'
                        }`}
                      >
                        <span className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            disabled={!showParcels}
                            checked={checked}
                            onChange={() => toggleCode(item.code)}
                            className="mt-0.5 h-3.5 w-3.5 accent-[#0A1B70]"
                          />
                          <span
                            className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: item.hex }}
                          />
                          <span>
                            <span className="block font-medium text-stone-900">{item.label}</span>
                            <span className="block text-[11px] text-stone-500">
                              {item.description}
                            </span>
                          </span>
                        </span>
                        <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                          {item.count.toLocaleString()}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Parcel layer opacity slider */}
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-2.5">
                  <label htmlFor="parcel-opacity" className="text-[11px] text-stone-600">
                    Raster Opacity
                  </label>
                  <input
                    id="parcel-opacity"
                    type="range"
                    min={0.2}
                    max={1}
                    step={0.05}
                    value={parcelOpacity}
                    onChange={(e) => setParcelOpacity(parseFloat(e.target.value))}
                    className="h-1.5 w-28 accent-[#0A1B70]"
                  />
                  <span className="w-8 text-right font-mono text-[11px] text-stone-600 tabular-nums">
                    {Math.round(parcelOpacity * 100)}%
                  </span>
                </div>
              </div>
            </aside>
          )}

          {/* Selected Community District Inspector */}
          {selected?.community && (
            <div className="absolute right-3 bottom-8 z-[450] w-72 max-w-[calc(100%-1.5rem)] rounded-md border border-stone-200 bg-white/95 p-4 text-xs shadow-md backdrop-blur-xs">
              <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2">
                <div>
                  <p className="text-[11px] text-stone-500">
                    {selected.community.SECTOR || 'Calgary'} ·{' '}
                    {selected.community.SRG || selected.community.CLASS || 'District'}
                  </p>
                  <h4 className="mt-0.5 font-serif text-base font-semibold text-stone-900">
                    {selected.community.NAME}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close district details"
                  className="rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <dl className="mt-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <dt className="text-stone-600">Total Rezoned Parcels</dt>
                  <dd className="font-mono font-medium text-stone-900 tabular-nums">
                    {formatNumber(selected.community.REZONED_TOTAL)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-stone-600">
                    <span className="inline-block h-2.5 w-2.5 rounded-[1px] bg-[#0A1B70]" />
                    R-CG Parcels
                  </dt>
                  <dd className="font-mono text-stone-800 tabular-nums">
                    {formatNumber(selected.community.REZONED_R_CG)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-stone-600">
                    <span className="inline-block h-2.5 w-2.5 rounded-[1px] bg-[#669AFA]" />
                    R-G Parcels
                  </dt>
                  <dd className="font-mono text-stone-800 tabular-nums">
                    {formatNumber(selected.community.REZONED_R_G)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-1.5 text-stone-600">
                    <span className="inline-block h-2.5 w-2.5 rounded-[1px] bg-[#47A4DE]" />
                    H-GO Parcels
                  </dt>
                  <dd className="font-mono text-stone-800 tabular-nums">
                    {formatNumber(selected.community.REZONED_H_GO)}
                  </dd>
                </div>
              </dl>

              <div className="mt-3 border-t border-stone-100 pt-2 text-[11px] text-stone-500">
                <div className="flex items-center justify-between">
                  <span>Sampled GeoTIFF Pixel</span>
                  <span className="font-mono font-medium text-stone-800">
                    {selected.sampledCode ?? 'Non-rezoned'}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between">
                  <span>Coordinates</span>
                  <span className="font-mono tabular-nums">
                    {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer strip with local file downloads */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-600">
          <span>
            Click any community district to inspect parcel counts and sample the local GeoTIFF layer.
          </span>
          <div className="flex items-center gap-4">
            <a
              href={assetUrl('data/community_districts.geojson')}
              download="calgary_community_districts.geojson"
              className="inline-flex items-center gap-1.5 font-medium text-[#0A1B70] hover:underline whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              GeoJSON (313 districts)
            </a>
            <a
              href={assetUrl('data/rezoned_parcels.tif')}
              download="calgary_rezoned_parcels.tif"
              className="inline-flex items-center gap-1.5 font-medium text-[#0A1B70] hover:underline whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              GeoTIFF (309,746 parcels)
            </a>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-center text-sm text-stone-600">
        City of Calgary Web Map Showing Rezoned Land Parcels by Land Use District Across Communities
      </figcaption>
    </figure>
  );
}
