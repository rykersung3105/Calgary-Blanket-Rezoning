import { assetUrl } from '../utils/assetUrl';

export interface SidecarSlide {
  id: string;
  indexLabel: string;
  title: string;
  paragraphs: string[];
  sourceLabel: string;
  sourceUrl: string;
  imageSrc: string;
  imageAlt: string;
  attribution: string;
}

export interface SpotlightNeighbourhood {
  name: string;
  communityKey: string;
  value2024: number;
  value2026: number;
  pctChange: number;
}

export interface SourceCredit {
  title: string;
  text: string;
  url?: string;
  prefixText?: string;
}

export interface LocalDatasetInfo {
  name: string;
  format: 'GeoJSON' | 'GeoTIFF' | 'JSON';
  path: string;
  records: string;
  description: string;
}

export const SIDECAR_SLIDES: SidecarSlide[] = [
  {
    id: 'development-applications',
    indexLabel: '01 / 04',
    title: 'Development Applications',
    paragraphs: [
      'This map shows the distribution and density of new development applications submitted under the blanket rezoned land use codes across community districts. High density development is shown to be occurring around the city centre, with the exception of the downtown core. The density sharply declines outside of the city inlands, indicating that the majority of new development targeted communities with existing infrastructure and high downtown access. This aligns with the objectives of the policy aiming to utilize existing utility and transit infrastructure to accommodate a rising population.',
    ],
    sourceLabel: 'Source: City of Calgary Open Data (Development Applications)',
    sourceUrl:
      'https://data.calgary.ca/Business-and-Economic-Activity/Development-Permits/6933-unw5',
    imageSrc: assetUrl('images/map-development-applications.jpg'),
    imageAlt:
      'Choropleth map of Calgary showing new development applications submitted under blanket rezoned land use codes across community districts.',
    attribution: 'Map by Ryker Sung',
  },
  {
    id: 'schools',
    indexLabel: '02 / 04',
    title: 'Schools',
    paragraphs: [
      'Another major consideration of the policy was housing affordability for young families and professionals amidst rising shelter costs. Education is a primary interest to these target populations, mapped by overlaying school locations over the development choropleth. Many of the high-development communities, including districts with over 82 new development applications, are densely populated with schools. Notably, the Northeast region shows impressive educational capacity despite its distance from the city core.',
      'When housing stock densification results in increases in population density, communities without sufficient school infrastructure will require careful planning to ensure adequate capacity for new students.',
    ],
    sourceLabel: 'Source: City of Calgary Open Data (Schools)',
    sourceUrl:
      'https://data.calgary.ca/Services-and-Amenities/Schools/fd9t-tdn2/about_data',
    imageSrc: assetUrl('images/map-schools.jpg'),
    imageAlt:
      'Map of Calgary overlaying school locations onto the development applications choropleth by community district.',
    attribution: 'Map by Ryker Sung',
  },
  {
    id: 'development-classification',
    indexLabel: '03 / 04',
    title: 'Development Classification',
    paragraphs: [
      'Next, observe the mapped residential growth classes. It is evident that almost all of the communities experiencing significant increases in development fall within the complete or established classes. This confirms that multi-unit developments are occurring in areas with established infrastructure, downtown accessibility, and potential to house large populations.',
      'Once again, the Northwest region stands out as a relatively high development area classified as developing. The high demand for new constructions in a developing area indicates potential for population growth to outpace municipal services.',
    ],
    sourceLabel: 'Source: City of Calgary Open Data (Community Districts)',
    sourceUrl:
      'https://data.calgary.ca/Base-Maps/Community-District-Boundaries/surr-xmvs/about_data',
    imageSrc: assetUrl('images/map-development-classification.jpg'),
    imageAlt:
      'Map of Calgary residential growth classifications compared with policy-period development application density.',
    attribution: 'Map by Ryker Sung',
  },
  {
    id: 'public-infrastructure-strain',
    indexLabel: '04 / 04',
    title: 'Public Infrastructure Strain',
    paragraphs: [
      'Opponents of the policy warned that sudden densification in urban communities could tax the available public infrastructure. Examining the map to the right, many of the high development communities overlap with some of the highest 311 service request counts in the city. This overlap legitimizes the concerns for potential infrastructure limitations, and may require additional planning to accommodate population spikes.',
      'While population density can strongly correlate with infrastructure demand, a count of 311 service requests is still meaningful in identifying communities that may already be experiencing capacity issues.',
    ],
    sourceLabel: 'Source: City of Calgary Open Data (311 Service Requests)',
    sourceUrl:
      'https://data.calgary.ca/Services-and-Amenities/311-Service-Requests/iahh-g8bj/about_data',
    imageSrc: assetUrl('images/map-infrastructure-strain.jpg'),
    imageAlt:
      'Map comparing Calgary 311 service request counts with high-development community districts.',
    attribution: 'Map by Ryker Sung',
  },
];

export const SPOTLIGHT_NEIGHBOURHOODS: SpotlightNeighbourhood[] = [
  {
    name: 'Bowness',
    communityKey: 'BOWNESS',
    value2024: 492750,
    value2026: 610000,
    pctChange: 23.8,
  },
  {
    name: 'Montgomery',
    communityKey: 'MONTGOMERY',
    value2024: 568500,
    value2026: 683000,
    pctChange: 20.0,
  },
  {
    name: 'Killarney',
    communityKey: 'KILLARNEY/GLENGARRY',
    value2024: 669750,
    value2026: 824000,
    pctChange: 23.0,
  },
  {
    name: 'Altadore',
    communityKey: 'ALTADORE',
    value2024: 1060000,
    value2026: 1280000,
    pctChange: 20.8,
  },
  {
    name: 'Ogden',
    communityKey: 'OGDEN',
    value2024: 456500,
    value2026: 528000,
    pctChange: 15.7,
  },
];

export const SOURCE_CREDITS: SourceCredit[] = [
  {
    title: 'Saddledome Cover Image',
    text: 'https://www.goodfreephotos.com/canada/alberta/calgary/the-saddledome-and-the-skyline-with-towers-in-calgary-alberta-canada.jpg.php',
    url: 'https://www.goodfreephotos.com/canada/alberta/calgary/the-saddledome-and-the-skyline-with-towers-in-calgary-alberta-canada.jpg.php',
  },
  {
    title: 'City of Calgary Open Data',
    text: 'https://data.calgary.ca/browse?sortBy=newest&page=1&pageSize=20',
    url: 'https://data.calgary.ca/browse?sortBy=newest&page=1&pageSize=20',
  },
  {
    title: 'CMHC Housing Market Info Portal',
    text: 'www03.cmhc-schl.gc.ca/hmip-pimh/en',
    url: 'https://www03.cmhc-schl.gc.ca/hmip-pimh/en#Profile/1/1/Canada',
  },
  {
    title: 'City of Calgary Rezoning Parcels & Community District Boundaries',
    text: 'Downloaded locally as GeoTIFF and GeoJSON from public municipal records (originally referenced via arcg.is/1vbfzj4)',
    url: 'https://arcg.is/1vbfzj4',
  },
  {
    title: 'Making housing affordable? The local effects of relaxing land-use regulation',
    prefixText:
      'Büchler, S., & Lutz, E. (2024). Making housing affordable? The local effects of relaxing land-use regulation. Journal of Urban Economics, 143, 103689. ',
    text: 'https://doi.org/10.1016/j.jue.2024.103689',
    url: 'https://doi.org/10.1016/j.jue.2024.103689',
  },
];

export const LOCAL_DATASETS: LocalDatasetInfo[] = [
  {
    name: 'community_districts.geojson',
    format: 'GeoJSON',
    path: assetUrl('data/community_districts.geojson'),
    records: '313 community polygons',
    description:
      'Calgary community district boundaries in WGS 84 (EPSG:4326) enriched with exact R-CG, R-G, and H-GO parcel tallies.',
  },
  {
    name: 'rezoned_parcels.tif',
    format: 'GeoTIFF',
    path: assetUrl('data/rezoned_parcels.tif'),
    records: '309,746 rasterized parcels',
    description:
      'Single-band DEFLATE-compressed GeoTIFF (2560 × 3637, EPSG:3857) encoding all rezoned R-CG (1), R-G (2), and H-GO (3) land parcels.',
  },
  {
    name: 'building_permits_monthly.json',
    format: 'JSON',
    path: assetUrl('data/building_permits_monthly.json'),
    records: '5 dwelling categories',
    description:
      'Monthly average building permit applications comparing 24-month pre-policy and policy periods across multi-unit dwelling types.',
  },
  {
    name: 'housing_starts_monthly.json',
    format: 'JSON',
    path: assetUrl('data/housing_starts_monthly.json'),
    records: '49 monthly observations',
    description:
      'Monthly CMHC housing starts (Density Units vs. All Units) from August 2022 through August 2026 with pre- and during-policy averages.',
  },
];
