"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

export type KpiDatum = { label: string; value: number };

type KpiBarCardProps = {
  title: string;
  description?: string;
  data: KpiDatum[];
  // A design-token CSS variable (e.g. "var(--chart-1)"); never a hardcoded hex.
  colorVar?: string;
  emptyLabel?: string;
};

// A single-metric horizontal bar card: one bar per category, the count rendered
// at the bar end so values stay legible without hovering. Colors come from the
// shadcn chart wrapper's token config (principle 8). Presentational only — the
// server reads the KPI views (principle 6) and passes the mapped data in.
export function KpiBarCard({
  title,
  description,
  data,
  colorVar = "var(--chart-1)",
  emptyLabel = "Noch keine Daten",
}: KpiBarCardProps) {
  const isEmpty = data.every((datum) => datum.value === 0);
  const config = {
    value: { label: "Anzahl", color: colorVar },
  } satisfies ChartConfig;
  const height = Math.max(160, data.length * 36 + 24);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-40 items-center justify-center text-sm text-text-secondary">
            {emptyLabel}
          </div>
        ) : (
          <ChartContainer
            config={config}
            className="aspect-auto w-full"
            style={{ height }}
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 32, top: 4, bottom: 4 }}
            >
              <XAxis type="number" dataKey="value" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={180}
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={4}>
                <LabelList
                  dataKey="value"
                  position="right"
                  offset={8}
                  className="fill-text"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
