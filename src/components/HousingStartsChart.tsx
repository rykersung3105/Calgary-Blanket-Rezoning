import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { assetUrl } from '../utils/assetUrl';

interface StartsPoint {
  month: string;
  densityUnits: number | null;
  allUnits: number | null;
}

interface StartsDataset {
  avgPrePolicy: number;
  avgDuringPolicy: number;
  policyStartMonth: string;
  series: StartsPoint[];
}

export function HousingStartsChart() {
  const [dataset, setDataset] = useState<StartsDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(assetUrl('data/housing_starts_monthly.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: StartsDataset) => setDataset(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load housing starts'));
  }, []);

  if (error) {
    return (
      <div className="my-8 rounded-md border border-red-200 bg-red-50/40 p-5 text-sm text-red-800">
        Unable to load local housing starts dataset ({error}).
      </div>
    );
  }

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-7">
        <div className="border-b border-stone-100 pb-4">
          <h4 className="font-serif text-xl font-semibold text-stone-900">
            Housing Starts (Multi-Unit vs. Total)
          </h4>
          <p className="mt-1 text-sm text-stone-600">
            New housing starts in Calgary from August 2022 to August 2026 including the 24-month
            average before and after the zoning policy effective date (August 6, 2024).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-700">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-0.5 w-4 bg-[#0A1B70]" />
              All Units
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-0.5 w-4 bg-[#47A4DE]" />
              Density (Multi-Unit)
            </span>
          </div>
        </div>

        <div className="mt-6 h-[380px] w-full">
          {dataset ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dataset.series}
                margin={{ top: 28, right: 170, left: 4, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                <XAxis
                  dataKey="month"
                  interval={5}
                  tick={{ fill: '#57534E', fontSize: 11 }}
                  axisLine={{ stroke: '#D6D3D1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 2800]}
                  ticks={[0, 400, 800, 1200, 1600, 2000, 2400, 2800]}
                  tick={{ fill: '#57534E', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => v.toLocaleString()}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const pt = payload[0].payload as StartsPoint;
                    const gap =
                      pt.allUnits != null && pt.densityUnits != null
                        ? pt.allUnits - pt.densityUnits
                        : null;
                    const share =
                      pt.allUnits && pt.densityUnits != null
                        ? ((pt.densityUnits / pt.allUnits) * 100).toFixed(1)
                        : null;
                    return (
                      <div className="rounded-md border border-stone-200 bg-white px-3.5 py-2.5 text-xs shadow-md">
                        <p className="font-semibold text-stone-900">{label}</p>
                        <div className="mt-1.5 space-y-1 font-mono tabular-nums">
                          <p className="text-stone-600">
                            All Units:{' '}
                            <span className="font-semibold text-[#0A1B70]">
                              {pt.allUnits?.toLocaleString() ?? '—'}
                            </span>
                          </p>
                          <p className="text-stone-600">
                            Density Units:{' '}
                            <span className="font-semibold text-[#0284C7]">
                              {pt.densityUnits?.toLocaleString() ?? '—'}
                            </span>
                          </p>
                          {gap != null && share != null && (
                            <p className="border-t border-stone-100 pt-1 text-stone-600">
                              Multi-Unit Share: <span className="text-stone-900">{share}%</span>{' '}
                              (Gap: {gap.toLocaleString()})
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  x={dataset.policyStartMonth}
                  stroke="#DC2626"
                  strokeWidth={1.75}
                  strokeDasharray="4 3"
                  label={{
                    value: 'Aug 6, 2024 Policy Effective',
                    position: 'top',
                    offset: 10,
                    fill: '#DC2626',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <ReferenceLine
                  y={dataset.avgPrePolicy}
                  stroke="#78716C"
                  strokeDasharray="3 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Pre-Policy Avg: 1,035/mo',
                    position: 'right',
                    offset: 8,
                    fill: '#57534E',
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />
                <ReferenceLine
                  y={dataset.avgDuringPolicy}
                  stroke="#9A3412"
                  strokeDasharray="3 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Policy Avg: 1,429/mo',
                    position: 'right',
                    offset: 8,
                    fill: '#9A3412',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="allUnits"
                  name="All Units"
                  stroke="#0A1B70"
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0A1B70' }}
                />
                <Line
                  type="monotone"
                  dataKey="densityUnits"
                  name="Density Units"
                  stroke="#47A4DE"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#47A4DE' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-500">
              Loading monthly housing starts…
            </div>
          )}
        </div>
      </div>

      <figcaption className="mt-3 text-sm leading-relaxed text-stone-600">
        The above graphic indicates{' '}
        <strong className="font-semibold text-stone-900">1035</strong> monthly units starting
        construction in the 24 months preceding the policy, compared to{' '}
        <strong className="font-semibold text-stone-900">1429</strong> monthly units in the 24
        months that the policy was in effect.
      </figcaption>
    </figure>
  );
}
