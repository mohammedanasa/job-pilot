"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayCount, ScoreRangeCount } from "@/lib/analytics-charts";

const AXIS_TICK = { fontSize: 12, fill: "#9CA3AF" };

function ChartCard({
  title,
  hasData,
  emptyMessage,
  children,
}: {
  title: string;
  hasData: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold leading-6 text-text-primary">{title}</h2>
      {hasData ? (
        <div className="mt-6 h-64">{children}</div>
      ) : (
        <p className="mt-6 flex h-64 items-center justify-center text-sm font-medium leading-5 text-text-muted">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

export function CompanyResearchActivityChart({
  data,
  hasData,
}: {
  data: DayCount[];
  hasData: boolean;
}) {
  return (
    <ChartCard
      title="Company Research Activity"
      hasData={hasData}
      emptyMessage="No companies researched yet. Research a company to see activity here."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#E7EAF3" vertical={false} />
          <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: "var(--color-surface-secondary)" }} />
          <Bar dataKey="count" fill="#61A8FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function JobsFoundOverTimeChart({ data, hasData }: { data: DayCount[]; hasData: boolean }) {
  return (
    <ChartCard
      title="Jobs Found Over Time"
      hasData={hasData}
      emptyMessage="No jobs found yet. Run a search to see activity here."
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="jobsFoundGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C5CFC" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#7C5CFC" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#E7EAF3" vertical={false} />
          <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip cursor={{ stroke: "var(--color-border)" }} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#7C5CFC"
            strokeWidth={3}
            fill="url(#jobsFoundGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MatchScoreDistributionChart({
  data,
  hasData,
}: {
  data: ScoreRangeCount[];
  hasData: boolean;
}) {
  return (
    <ChartCard
      title="Match Score Distribution"
      hasData={hasData}
      emptyMessage="No scored jobs yet. Run a search to see your match distribution here."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#E7EAF3" vertical={false} />
          <XAxis dataKey="range" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip cursor={{ fill: "var(--color-surface-secondary)" }} />
          <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
