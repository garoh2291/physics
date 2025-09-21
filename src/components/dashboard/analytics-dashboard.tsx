"use client";

import { AnalyticsOverview } from "./analytics-overview";
import { DifficultyChart } from "./difficulty-chart";
import { SectionProgressChart } from "./section-progress-chart";

interface AnalyticsData {
  totalExercises: number;
  solvedExercises: number;
  partiallyCompleted: number;
  accuracy: number;
  completionRate: number;
  difficultyBreakdown: Array<{
    level: string;
    total: number;
    solved: number;
    accuracy: number;
  }>;
  sectionProgress: Array<{
    section: string;
    total: number;
    solved: number;
    partial: number;
    percentage: number;
  }>;
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <div className="mb-8 space-y-6">
      {/* Key Metrics Cards */}
      <AnalyticsOverview analytics={analytics} />

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <DifficultyChart data={analytics.difficultyBreakdown} />
        <SectionProgressChart data={analytics.sectionProgress} />
      </div>
    </div>
  );
}
