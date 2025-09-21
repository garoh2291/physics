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
  class?: number;
  correctAnswerValues: string[];
  createdAt: string;
  sections: Array<{ id: string; name: string; url?: string | null }>;
  themes: Array<{
    id: string;
    name: string;
    url?: string | null;
    section: { id: string; name: string };
  }>;
  solutions: Array<{
    isCorrect: boolean;
    userId: string;
    submittedAnswers?: Array<{
      index: number;
      answer: string;
      isCorrect: boolean;
      submittedAt: string;
    }>;
    correctAnswersCount?: number;
  }>;
}

interface Section {
  id: string;
  name: string;
  url?: string | null;
  themes?: Array<{ id: string; name: string; url?: string | null }>;
}

interface Theme {
  id: string;
  name: string;
  url?: string | null;
  section: {
    id: string;
    name: string;
  };
}

type ViewType = "main" | "themes" | "exercises";

interface ViewState {
  type: ViewType;
  selectedId?: string;
  selectedName?: string;
  parentId?: string;
  parentName?: string;
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const {
    data: exercises = [],
    isLoading: exercisesLoading,
    error: exercisesError,
  } = useExercises();
  const { data: userProfile } = useUserProfile();
  const { data: sections = [] } = useSections();
  const { data: themes = [] } = useThemes();

  const [viewState, setViewState] = useState<ViewState>({ type: "main" });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle onboarding completion
  useEffect(() => {
    if (searchParams.get("onboarded") === "true") {
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // Calculate statistics for a group of exercises
  const calculateStats = (exerciseIds: string[]) => {
    if (!userProfile) return { total: 0, solved: 0, partial: 0 };

    let solved = 0;
    let partial = 0;

    exerciseIds.forEach((exerciseId) => {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const userSolution = exercise.solutions.find(
        (s) => s.userId === userProfile.id
      );
      if (userSolution) {
        if (
          userSolution.submittedAnswers &&
          Array.isArray(userSolution.submittedAnswers)
        ) {
          const correctCount = userSolution.correctAnswersCount || 0;
          const totalAnswers = exercise.correctAnswerValues.length;

          if (correctCount === totalAnswers) {
            solved++;
          } else if (correctCount > 0) {
            partial++;
          }
        } else if (userSolution.isCorrect) {
          solved++;
        }
      }
    });

    return { total: exerciseIds.length, solved, partial };
  };

  // Get color based on stats
  const getCardColor = (stats: {
    total: number;
    solved: number;
    partial: number;
  }) => {
    if (stats.total === 0) return "bg-gray-100 border-gray-200";
    if (stats.solved === stats.total) return "bg-green-100 border-green-300";
    if (stats.solved > 0 || stats.partial > 0)
      return "bg-yellow-100 border-yellow-300";
    return "bg-gray-100 border-gray-200";
  };

  // Get exercise status for individual exercise cards
  const getExerciseStatus = (exercise: Exercise) => {
    if (!userProfile)
      return { status: "new", text: "Նոր", color: "default", progress: null };

    const userSolution = exercise.solutions.find(
      (s) => s.userId === userProfile.id
    );

    if (userSolution) {
      if (
        userSolution.submittedAnswers &&
        Array.isArray(userSolution.submittedAnswers)
      ) {
        const totalAnswers = exercise.correctAnswerValues.length;
        const correctCount = userSolution.correctAnswersCount || 0;

        if (correctCount === 0) {
          return {
            status: "wrong",
            text: "Սխալ պատասխան",
            color: "destructive",
            progress: `0/${totalAnswers}`,
          };
        } else if (correctCount < totalAnswers) {
          return {
            status: "partial",
            text: `${correctCount}/${totalAnswers}`,
            color: "warning",
            progress: `${correctCount}/${totalAnswers}`,
          };
        } else {
          return {
            status: "completed",
            text: "Ավարտված",
            color: "success",
            progress: null,
          };
        }
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

  // Analytics calculation functions
  const calculateUserAnalytics = () => {
    if (!userProfile)
      return {
        totalExercises: 0,
        solvedExercises: 0,
        partiallyCompleted: 0,
        accuracy: 0,
        difficultyBreakdown: [],
        progressOverTime: [],
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
            correctAttempts += correctCount / totalAnswers;
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

    const accuracy =
      totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    // Convert to arrays for charts
    const difficultyBreakdown = Object.entries(difficultyStats).map(
      ([, stats]) => ({
        level: stats.name,
        total: stats.total,
        solved: stats.solved,
        accuracy: stats.total > 0 ? (stats.solved / stats.total) * 100 : 0,
      })
    );

    const sectionProgress = Object.entries(sectionStats).map(
      ([name, stats]) => ({
        section: name,
        total: stats.total,
        solved: stats.solved,
        partial: stats.partial,
        percentage:
          stats.total > 0
            ? ((stats.solved + stats.partial * 0.5) / stats.total) * 100
            : 0,
      })
    );

    return {
      totalExercises,
      solvedExercises,
      partiallyCompleted,
      accuracy: Math.round(accuracy * 100) / 100,
      difficultyBreakdown,
      sectionProgress,
      completionRate:
        totalExercises > 0
          ? Math.round((solvedExercises / totalExercises) * 100)
          : 0,
    };
  };

  const analytics = calculateUserAnalytics();

  // Navigation functions
  const navigateToThemes = (sectionId: string, sectionName: string) =>
    setViewState({
      type: "themes",
      selectedId: sectionId,
      selectedName: sectionName,
    });
  const navigateToExercises = (id: string, name: string, isTheme = false) =>
    setViewState({
      type: "exercises",
      selectedId: id,
      selectedName: name,
      parentId: isTheme
        ? themes.find((t: Theme) => t.id === id)?.section.id
        : undefined,
      parentName: isTheme
        ? themes.find((t: Theme) => t.id === id)?.section.name
        : undefined,
    });
  const navigateBack = () => {
    if (viewState.type === "exercises" && viewState.parentId) {
      setViewState({
        type: "themes",
        selectedId: viewState.parentId,
        selectedName: viewState.parentName,
      });
    } else if (viewState.type === "themes") {
      setViewState({ type: "main" });
    } else {
      setViewState({ type: "main" });
    }
  };

  if (exercisesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  if (exercisesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">
          Սխալ՝ {exercisesError.message}
        </div>
      </div>
    );
  }

  // Render different views based on current state
  const renderAnalytics = () => (
    <div className="mb-8 space-y-6">
      {/* Key Metrics Cards */}
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
            <CardTitle className="text-sm font-medium">
              Ավարտման տոկոս
            </CardTitle>
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

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Difficulty Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Բարդության մակարդակով առաջընթաց
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.difficultyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "solved" ? "Ավարտված" : "Ընդամենը",
                    value,
                  ]}
                />
                <Bar dataKey="total" fill="#e5e7eb" name="total" />
                <Bar dataKey="solved" fill="#10b981" name="solved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Section Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Բաժինների առաջընթաց
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={analytics.sectionProgress.slice(0, 5)}
                layout="horizontal"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="section" type="category" width={80} />
                <Tooltip
                  formatter={(value: number) => [
                    `${Math.round(value)}%`,
                    "Առաջընթաց",
                  ]}
                />
                <Bar dataKey="percentage" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMainView = () => {
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
              onClick={() => navigateToThemes(section.id, section.name)}
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
  };

  const renderThemesView = () => {
    // Filter themes that have exercises and belong to the selected section
    const sectionThemes = themes.filter(
      (theme: Theme) =>
        theme.section.id === viewState.selectedId &&
        exercises.some((ex) => ex.themes.some((t) => t.id === theme.id))
    );

    return (
      <>
        <div className="mb-6">
          <Button variant="outline" onClick={navigateBack}>
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
                onClick={() => navigateToExercises(theme.id, theme.name, true)}
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
  };

  const renderExercisesView = () => {
    // Only show exercises from themes now
    const filteredExercises = exercises.filter((ex) =>
      ex.themes.some((t) => t.id === viewState.selectedId)
    );

    return (
      <>
        <div className="mb-6">
          <Button variant="outline" onClick={navigateBack}>
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
                        {new Date(exercise.createdAt).toLocaleDateString(
                          "hy-AM"
                        )}
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {viewState.type === "main"
                ? "Ուսանողական վահանակ"
                : viewState.type === "themes"
                ? `${viewState.selectedName} - Թեմաներ`
                : `${viewState.selectedName} - Վարժություններ`}
            </h1>
            <div className="flex items-center space-x-2 md:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "Ու"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {session?.user?.name}
                </span>
              </div>
              {/* Credits */}
              {userProfile && (
                <span className="flex items-center px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold">
                  <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                  {userProfile.credits} կրեդիտ
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-auto sm:ml-0"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ելք</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Analytics Section - Only show on main page */}
        {viewState.type === "main" && renderAnalytics()}

        {viewState.type === "main" && renderMainView()}
        {viewState.type === "themes" && renderThemesView()}
        {viewState.type === "exercises" && renderExercisesView()}
      </main>
    </div>
  );
}
