"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, TrendingUp, Target } from "lucide-react";

interface AnalyticsData {
  totalExercises: number;
  solvedExercises: number;
  partiallyCompleted: number;
  accuracy: number;
  completionRate: number;
}

interface AnalyticsOverviewProps {
  analytics: AnalyticsData;
}

export function AnalyticsOverview({ analytics }: AnalyticsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ընդամենը վարժություններ
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalExercises}</div>
          <p className="text-xs text-muted-foreground">
            Բոլոր վարժությունները համակարգում
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ավարտված</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {analytics.solvedExercises}
          </div>
          <p className="text-xs text-muted-foreground">
            +{analytics.partiallyCompleted} մասնակի ավարտված
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ավարտման տոկոս</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {analytics.completionRate}%
          </div>
          <p className="text-xs text-muted-foreground">Ընդհանուր առաջընթաց</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ճշգրտություն</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {analytics.accuracy}%
          </div>
          <p className="text-xs text-muted-foreground">
            Ճիշտ լուծումների տոկոս
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
