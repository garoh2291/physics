"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, BookOpen, XCircle } from "lucide-react";
import {
  useExercises,
  useUserProfile,
  useSections,
  useThemes,
} from "@/hooks/use-api";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { MainView } from "@/components/dashboard/main-view";
import { ThemesView } from "@/components/dashboard/themes-view";
import { ExercisesView } from "@/components/dashboard/exercises-view";

// Types for our components
interface Exercise {
  id: string;
  exerciseNumber?: string;
  level: number;
  class?: string;
  correctAnswerValues: string[];
  createdAt: string;
  sections: Array<{ id: string; name: string; url?: string | null }>;
  themes: Array<{
    id: string;
    name: string;
    url?: string | null;
  }>;
  solutions: Array<{
    id: string;
    userId: string;
    submittedAnswers?: unknown[];
    isCorrect?: boolean;
    correctAnswersCount?: number;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

interface Stats {
  total: number;
  solved: number;
  partial: number;
}

interface ViewState {
  type: "main" | "themes" | "exercises";
  selectedId: string;
  selectedName: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: exercises = [], isLoading: exercisesLoading } = useExercises();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: sections = [], isLoading: sectionsLoading } = useSections();
  const { data: themes = [], isLoading: themesLoading } = useThemes();

  const [viewState, setViewState] = useState<ViewState>({
    type: "main",
    selectedId: "",
    selectedName: "",
  });

  useEffect(() => {
    const view = searchParams?.get("view");
    const sectionId = searchParams?.get("sectionId");
    const sectionName = searchParams?.get("sectionName");
    const themeId = searchParams?.get("themeId");
    const themeName = searchParams?.get("themeName");

    if (view === "themes" && sectionId && sectionName) {
      setViewState({
        type: "themes",
        selectedId: sectionId,
        selectedName: sectionName,
      });
    } else if (view === "exercises" && themeId && themeName) {
      setViewState({
        type: "exercises",
        selectedId: themeId,
        selectedName: themeName,
      });
    } else {
      setViewState({
        type: "main",
        selectedId: "",
        selectedName: "",
      });
    }
  }, [searchParams]);

  // Navigation functions
  const navigateToThemes = (sectionId: string, sectionName: string) => {
    const params = new URLSearchParams();
    params.set("view", "themes");
    params.set("sectionId", sectionId);
    params.set("sectionName", sectionName);
    router.push(`/dashboard?${params.toString()}`);
  };

  const navigateToExercises = (themeId: string, themeName: string) => {
    const params = new URLSearchParams();
    params.set("view", "exercises");
    params.set("themeId", themeId);
    params.set("themeName", themeName);
    router.push(`/dashboard?${params.toString()}`);
  };

  const navigateBack = () => {
    if (viewState.type === "exercises") {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  // Utility functions
  const calculateStats = (exerciseIds: string[]): Stats => {
    if (!userProfile) return { total: 0, solved: 0, partial: 0 };

    const total = exerciseIds.length;
    let solved = 0;
    let partial = 0;

    exerciseIds.forEach((exerciseId) => {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const userSolution = exercise.solutions.find(
        (s) => s.userId === userProfile.id
      );

      if (userSolution && userSolution.submittedAnswers) {
        const correctCount = userSolution.correctAnswersCount || 0;
        const totalAnswers = exercise.correctAnswerValues.length;

        if (correctCount === totalAnswers) {
          solved++;
        } else if (correctCount > 0) {
          partial++;
        }
      }
    });

    return { total, solved, partial };
  };

  const getCardColor = (stats: Stats) => {
    if (stats.solved === stats.total && stats.total > 0) {
      return "border-green-200 bg-green-50";
    } else if (stats.solved > 0 || stats.partial > 0) {
      return "border-yellow-200 bg-yellow-50";
    }
    return "border-gray-200 bg-white";
  };

  const getExerciseStatus = (exercise: Exercise) => {
    if (!userProfile) {
      return { status: "new", text: "Նոր", color: "default", progress: null };
    }

    const userSolution = exercise.solutions.find(
      (s) => s.userId === userProfile.id
    );

    if (userSolution && userSolution.submittedAnswers) {
      const correctCount = userSolution.correctAnswersCount || 0;
      const totalAnswers = exercise.correctAnswerValues.length;

      if (correctCount < totalAnswers && correctCount > 0) {
        return {
          status: "partial",
          text: "Մասնակի",
          color: "warning",
          progress: `${correctCount}/${totalAnswers}`,
        };
      } else {
        if (userSolution.isCorrect) {
          return {
            status: "completed",
            text: "Ավարտված",
            color: "success",
            progress: null,
          };
        } else {
          return {
            status: "wrong",
            text: "Սխալ պատասխան",
            color: "destructive",
            progress: null,
          };
        }
      }
    }

    return { status: "new", text: "Նոր", color: "default", progress: null };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "partial":
        return (
          <div className="h-4 w-4 rounded-full border-2 border-yellow-500 bg-yellow-100" />
        );
      case "wrong":
        return <XCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyText = (level: number) => {
    switch (level) {
      case 1:
        return "Հեշտ";
      case 2:
        return "Միջին";
      case 3:
        return "Բարդ";
      case 4:
        return "Շատ բարդ";
      case 5:
        return "Փորձագետ";
      default:
        return "Անհայտ";
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-blue-100 text-blue-800";
      case 3:
        return "bg-yellow-100 text-yellow-800";
      case 4:
        return "bg-orange-100 text-orange-800";
      case 5:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Analytics calculation function
  const calculateUserAnalytics = () => {
    if (!userProfile)
      return {
        totalExercises: 0,
        solvedExercises: 0,
        partiallyCompleted: 0,
        accuracy: 0,
        completionRate: 0,
        difficultyBreakdown: [],
        sectionProgress: [],
      };

    let totalExercises = 0;
    let solvedExercises = 0;
    let partiallyCompleted = 0;
    let totalAttempts = 0;
    let correctAttempts = 0;

    // Difficulty breakdown
    const difficultyStats = {
      1: { total: 0, solved: 0, name: "Հեշտ" },
      2: { total: 0, solved: 0, name: "Միջին" },
      3: { total: 0, solved: 0, name: "Բարդ" },
      4: { total: 0, solved: 0, name: "Շատ բարդ" },
      5: { total: 0, solved: 0, name: "Փորձագետ" },
    };

    // Section progress
    const sectionStats: Record<
      string,
      { total: number; solved: number; partial: number }
    > = {};

    exercises.forEach((exercise) => {
      const userSolution = exercise.solutions.find(
        (s) => s.userId === userProfile.id
      );
      totalExercises++;

      // Count for difficulty breakdown
      if (difficultyStats[exercise.level as keyof typeof difficultyStats]) {
        difficultyStats[exercise.level as keyof typeof difficultyStats].total++;
      }

      // Count for section breakdown
      exercise.sections.forEach((section) => {
        if (!sectionStats[section.name]) {
          sectionStats[section.name] = { total: 0, solved: 0, partial: 0 };
        }
        sectionStats[section.name].total++;
      });

      if (userSolution) {
        totalAttempts++;

        if (
          userSolution.submittedAnswers &&
          Array.isArray(userSolution.submittedAnswers)
        ) {
          const correctCount = userSolution.correctAnswersCount || 0;
          const totalAnswers = exercise.correctAnswerValues.length;

          if (correctCount === totalAnswers) {
            solvedExercises++;
            correctAttempts++;
            if (
              difficultyStats[exercise.level as keyof typeof difficultyStats]
            ) {
              difficultyStats[exercise.level as keyof typeof difficultyStats]
                .solved++;
            }
            exercise.sections.forEach((section) => {
              if (sectionStats[section.name]) {
                sectionStats[section.name].solved++;
              }
            });
          } else if (correctCount > 0) {
            partiallyCompleted++;
            exercise.sections.forEach((section) => {
              if (sectionStats[section.name]) {
                sectionStats[section.name].partial++;
              }
            });
          }
        } else if (userSolution.isCorrect) {
          solvedExercises++;
          correctAttempts++;
          if (difficultyStats[exercise.level as keyof typeof difficultyStats]) {
            difficultyStats[exercise.level as keyof typeof difficultyStats]
              .solved++;
          }
          exercise.sections.forEach((section) => {
            if (sectionStats[section.name]) {
              sectionStats[section.name].solved++;
            }
          });
        }
      }
    });

    // Calculate accuracy
    const accuracy =
      totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    // Format difficulty breakdown for chart
    const difficultyBreakdown = Object.entries(difficultyStats).map(
      ([, stats]) => ({
        level: stats.name,
        total: stats.total,
        solved: stats.solved,
        accuracy:
          stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0,
      })
    );

    // Format section progress for chart
    const sectionProgress = Object.entries(sectionStats)
      .map(([section, stats]) => ({
        section:
          section.length > 15 ? section.substring(0, 15) + "..." : section,
        percentage: stats.total > 0 ? (stats.solved / stats.total) * 100 : 0,
        solved: stats.solved,
        total: stats.total,
        partial: stats.partial,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    return {
      totalExercises,
      solvedExercises,
      partiallyCompleted,
      completionRate:
        totalExercises > 0
          ? Math.round((solvedExercises / totalExercises) * 100)
          : 0,
      accuracy: Math.round(accuracy),
      difficultyBreakdown,
      sectionProgress,
    };
  };

  const analytics = calculateUserAnalytics();

  if (exercisesLoading || profileLoading || sectionsLoading || themesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        viewState={viewState}
        session={session}
        userProfile={userProfile || null}
        onSignOut={() => signOut({ callbackUrl: "/" })}
      />

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Analytics Section - Only show on main page */}
        {viewState.type === "main" && (
          <AnalyticsDashboard analytics={analytics} />
        )}

        {viewState.type === "main" && (
          <MainView
            sections={sections}
            exercises={exercises}
            calculateStats={calculateStats}
            getCardColor={getCardColor}
            onNavigateToThemes={navigateToThemes}
          />
        )}

        {viewState.type === "themes" && (
          <ThemesView
            themes={themes}
            exercises={exercises}
            viewState={viewState}
            calculateStats={calculateStats}
            getCardColor={getCardColor}
            onNavigateBack={navigateBack}
            onNavigateToExercises={navigateToExercises}
          />
        )}

        {viewState.type === "exercises" && (
          <ExercisesView
            exercises={exercises.map((ex) => ({
              ...ex,
              class: ex.class?.toString(),
            }))}
            viewState={viewState}
            getExerciseStatus={(ex) => getExerciseStatus(ex as Exercise)}
            getStatusIcon={getStatusIcon}
            getDifficultyText={getDifficultyText}
            getDifficultyColor={getDifficultyColor}
            onNavigateBack={navigateBack}
          />
        )}
      </main>
    </div>
  );
}
