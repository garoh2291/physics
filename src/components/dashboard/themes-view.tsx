"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Theme {
  id: string;
  name: string;
  section: { id: string; name: string };
}

export interface Exercise {
  id: string;
  themes: { id: string; name: string }[];
}

interface Stats {
  total: number;
  solved: number;
  partial: number;
}

interface ThemesViewProps {
  themes: Theme[];
  exercises: Exercise[];
  viewState: {
    selectedId: string;
    selectedName: string;
  };
  calculateStats: (exerciseIds: string[]) => Stats;
  getCardColor: (stats: Stats) => string;
  onNavigateBack: () => void;
  onNavigateToExercises: (themeId: string, themeName: string) => void;
}

export function ThemesView({
  themes,
  exercises,
  viewState,
  calculateStats,
  getCardColor,
  onNavigateBack,
  onNavigateToExercises,
}: ThemesViewProps) {
  // Filter themes that have exercises and belong to the selected section
  const sectionThemes = themes.filter(
    (theme: Theme) =>
      theme.section.id === viewState.selectedId &&
      exercises.some((ex) => ex.themes.some((t) => t.id === theme.id))
  );

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" onClick={onNavigateBack}>
          ← Վերադառնալ բաժիններ
        </Button>
        <h2 className="text-xl font-bold mt-4">
          {viewState.selectedName} - Թեմաներ
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sectionThemes.map((theme: Theme) => {
          const themeExercises = exercises.filter((ex) =>
            ex.themes.some((t) => t.id === theme.id)
          );
          const stats = calculateStats(themeExercises.map((ex) => ex.id));

          return (
            <Card
              key={theme.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${getCardColor(
                stats
              )}`}
              onClick={() => onNavigateToExercises(theme.id, theme.name)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{theme.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ընդամենը վարժություններ:</span>
                    <span className="font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ավարտված:</span>
                    <span className="font-bold text-green-600">
                      {stats.solved}
                    </span>
                  </div>
                  {stats.partial > 0 && (
                    <div className="flex justify-between">
                      <span>Մասնակի:</span>
                      <span className="font-bold text-yellow-600">
                        {stats.partial}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
