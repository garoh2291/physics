"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Section {
  id: string;
  name: string;
  themes?: { id: string; name: string }[];
}

export interface Exercise {
  id: string;
  sections: { id: string; name: string }[];
}

interface Stats {
  total: number;
  solved: number;
  partial: number;
}

interface MainViewProps {
  sections: Section[];
  exercises: Exercise[];
  calculateStats: (exerciseIds: string[]) => Stats;
  getCardColor: (stats: Stats) => string;
  onNavigateToThemes: (sectionId: string, sectionName: string) => void;
}

export function MainView({
  sections,
  exercises,
  calculateStats,
  getCardColor,
  onNavigateToThemes,
}: MainViewProps) {
  // Filter sections that have exercises
  const sectionsWithExercises = sections.filter((section: Section) =>
    exercises.some((ex) => ex.sections.some((s) => s.id === section.id))
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sectionsWithExercises.map((section: Section) => {
        const sectionExercises = exercises.filter((ex) =>
          ex.sections.some((s) => s.id === section.id)
        );
        const stats = calculateStats(sectionExercises.map((ex) => ex.id));

        return (
          <Card
            key={section.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${getCardColor(
              stats
            )}`}
            onClick={() => onNavigateToThemes(section.id, section.name)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{section.name}</CardTitle>
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
                <div className="flex justify-between">
                  <span>Թեմաներ:</span>
                  <span className="font-bold">
                    {section.themes?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
