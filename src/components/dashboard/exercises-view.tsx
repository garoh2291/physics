"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Exercise {
  id: string;
  exerciseNumber?: string;
  level: number;
  class?: string | number;
  createdAt: string;
  themes: { id: string; name: string }[];
  solutions: {
    id: string;
    userId: string;
    isCorrect?: boolean;
    submittedAnswers?: unknown[];
    correctAnswersCount?: number;
  }[];
}

interface ExerciseStatus {
  status: string;
  text: string;
  color: string;
  progress: string | null;
}

interface ExercisesViewProps {
  exercises: Exercise[];
  viewState: {
    selectedId: string;
    selectedName: string;
  };
  getExerciseStatus: (exercise: Exercise) => ExerciseStatus;
  getStatusIcon: (status: string) => React.ReactNode;
  getDifficultyText: (level: number) => string;
  getDifficultyColor: (level: number) => string;
  onNavigateBack: () => void;
}

export function ExercisesView({
  exercises,
  viewState,
  getExerciseStatus,
  getStatusIcon,
  getDifficultyText,
  getDifficultyColor,
  onNavigateBack,
}: ExercisesViewProps) {
  // Only show exercises from themes now
  const filteredExercises = exercises.filter((ex) =>
    ex.themes.some((t) => t.id === viewState.selectedId)
  );

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" onClick={onNavigateBack}>
          ← Վերադառնալ
        </Button>
        <h2 className="text-xl font-bold mt-4">
          {viewState.selectedName} - Վարժություններ
        </h2>
      </div>
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => {
          const status = getExerciseStatus(exercise);
          return (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start space-y-2 sm:space-y-0">
                    <CardTitle className="text-base md:text-lg line-clamp-2 flex-1">
                      {exercise.exerciseNumber ||
                        `Վարժություն ${exercise.id.slice(-6)}`}
                    </CardTitle>
                    <Badge
                      variant={
                        status.color === "warning"
                          ? "secondary"
                          : (status.color as
                              | "default"
                              | "destructive"
                              | "secondary")
                      }
                      className={`flex items-center gap-1 text-xs ${
                        status.color === "warning"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : ""
                      }`}
                    >
                      {getStatusIcon(status.status)}
                      <span className="hidden sm:inline">{status.text}</span>
                      <span className="sm:hidden">{status.text}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs md:text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Բարդություն:</span>
                      <Badge
                        className={`text-xs ${getDifficultyColor(
                          exercise.level
                        )}`}
                      >
                        {getDifficultyText(exercise.level)}
                      </Badge>
                    </div>
                    {exercise.class && (
                      <div className="flex justify-between">
                        <span>Դաս:</span>
                        <span className="font-medium">{exercise.class}</span>
                      </div>
                    )}
                    <p>
                      Ստեղծված՝{" "}
                      {new Date(exercise.createdAt).toLocaleDateString("hy-AM")}
                    </p>
                    <p>Փորձեր՝ {exercise.solutions.length}</p>
                    {status.progress && (
                      <p className="text-yellow-700 font-medium">
                        Պատասխանված՝ {status.progress}
                      </p>
                    )}
                  </div>
                  <Button className="w-full mt-4 text-sm" variant="outline">
                    {status.status === "completed"
                      ? "Դիտել"
                      : exercise.solutions.length === 0
                      ? "Սկսել"
                      : "Շարունակել"}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Վարժություններ չկան
          </h3>
          <p className="text-gray-500">
            Այս բաժնում դեռ վարժություններ չեն ավելացվել:
          </p>
        </div>
      )}
    </>
  );
}
