import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { assetUrl } from '../utils/assetUrl';

interface PermitRow {
  type: string;
  prePolicy: number;
  policyPeriod: number;
  pctChange: number;
}

export function BuildingPermitsChart() {
  const [rows, setRows] = useState<PermitRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(assetUrl('data/building_permits_monthly.json'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PermitRow[]) => setRows(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load permit data'));
  }, []);

  if (error) {
    return (
      <div className="my-8 rounded-md border border-red-200 bg-red-50/40 p-5 text-sm text-red-800">
        Unable to load local building permit dataset ({error}).
      </div>
    );
  }

  return (
    <figure className="my-10">
      <div className="rounded-lg border border-stone-200 bg-white p-5 sm:p-7">
        <div className="border-b border-stone-100 pb-4">
          <h4 className="font-serif text-xl font-semibold text-stone-900">
            Monthly Density Building Permit Applications
          </h4>
          <p className="mt-1 text-sm text-stone-600">
            Comparison of monthly building permit applications for new multi-unit constructions
            between 24-month periods before and during the Blanket Rezoning Policy in the City of
            Calgary.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-stone-700">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-[2px] bg-[#94A3B8]" />
              Pre-Policy (Aug 2022 – Jul 2024 Avg)
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-[2px] bg-[#0A1B70]" />
              Policy Period (Aug 2024 – Jul 2026 Avg)
            </span>
          </div>
        </div>

        <div className="mt-6 h-[320px] w-full">
          {rows.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E7E5E4" />
                <XAxis
                  type="number"
                  tick={{ fill: '#57534E', fontSize: 12 }}
                  axisLine={{ stroke: '#D6D3D1' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  width={138}
                  tick={{ fill: '#1C1917', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F5F5F4' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const item = payload[0].payload as PermitRow;
                    const sign = item.pctChange >= 0 ? '+' : '';
                    return (
                      <div className="rounded-md border border-stone-200 bg-white px-3.5 py-2.5 text-xs shadow-md">
                        <p className="font-semibold text-stone-900">{item.type}</p>
                        <div className="mt-1.5 space-y-1 font-mono tabular-nums">
                          <p className="text-stone-600">
                            Pre-Policy: <span className="text-stone-900">{item.prePolicy.toFixed(1)} / mo</span>
                          </p>
                          <p className="text-stone-600">
                            Policy Period:{' '}
                            <span className="font-semibold text-[#0A1B70]">
                              {item.policyPeriod.toFixed(1)} / mo
                            </span>
                          </p>
                          <p className="border-t border-stone-100 pt-1 text-stone-700">
                            Change:{' '}
                            <span
                              className={
                                item.pctChange >= 0 ? 'font-semibold text-emerald-700' : 'text-stone-600'
                              }
                            >
                              {sign}
                              {item.pctChange.toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="prePolicy"
                  name="Pre-Policy"
                  fill="#94A3B8"
                  radius={[0, 3, 3, 0]}
                  barSize={14}
                />
                <Bar
                  dataKey="policyPeriod"
                  name="Policy Period"
                  fill="#0A1B70"
                  radius={[0, 3, 3, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-500">
              Loading permit comparison data…
            </div>
          )}
        </div>

        {/* Clean tabular summary strip */}
        {rows.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 sm:grid-cols-5">
            {rows.map((r) => (
              <div key={r.type} className="text-left">
                <p className="truncate text-xs text-stone-500">{r.type}</p>
                <p
                  className={`mt-0.5 font-mono text-sm font-semibold tabular-nums ${
                    r.pctChange >= 0 ? 'text-[#0A1B70]' : 'text-stone-600'
                  }`}
                >
                  {r.pctChange >= 0 ? '+' : ''}
                  {r.pctChange.toFixed(1)}%
                </p>
                <p className="font-mono text-[11px] text-stone-500 tabular-nums">
                  {r.prePolicy.toFixed(1)} → {r.policyPeriod.toFixed(1)}/mo
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <figcaption className="mt-3 text-sm leading-relaxed text-stone-600">
        The above graphic shows sizeable increases in monthly building permit applications across
        multi-unit dwelling types, with a <strong className="font-semibold text-stone-900">60%</strong>{' '}
        increase in secondary suites, <strong className="font-semibold text-stone-900">8%</strong>{' '}
        increase in duplexes, and <strong className="font-semibold text-stone-900">52%</strong>{' '}
        increase in townhomes. This rise in permit volume indicates strong permit efficiency enabled
        by rezoning.
      </figcaption>
    </figure>
  );
}
