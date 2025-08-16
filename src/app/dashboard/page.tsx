"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, BookOpen, CheckCircle, Coins, XCircle } from "lucide-react";
import { useExercises, useUserProfile, useSources } from "@/hooks/use-api";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { data: exercises = [], isLoading, error } = useExercises();
  const { data: userProfile } = useUserProfile();
  const { data: sources = [] } = useSources();
  
  const [filter, setFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle onboarding completion
  useEffect(() => {
    if (searchParams.get("onboarded") === "true") {
      // Remove the query parameter and refresh the page to update session
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    if (filter === "solved") {
      const solvedExercises = exercises.filter((ex) => {
        if (!userProfile) return false;
        const userSolution = ex.solutions.find(s => s.userId === userProfile.id);
        if (!userSolution) return false;
        
        // Check if exercise is completed (either legacy isCorrect or all partial answers correct)
        if (userSolution.isCorrect) {
          return true;
        }
        if (userSolution.submittedAnswers && Array.isArray(userSolution.submittedAnswers)) {
          const correctCount = userSolution.correctAnswersCount || 0;
          const isCompleted = correctCount === ex.correctAnswers.length;
          return isCompleted;
        }
        return false;
      });
      return solvedExercises;
    }
    if (filter === "course" && selectedCourse) {
      return exercises.filter((ex) =>
        ex.sources.some((s) => s.id === selectedCourse)
      );
    }
    return exercises;
  }, [exercises, filter, selectedCourse, userProfile]);

  const getExerciseStatus = (exercise: {
    id: string;
    correctAnswers: string[];
    solutions: Array<{ 
      isCorrect: boolean; 
      userId: string; 
      submittedAnswers?: { index: number; answer: string; isCorrect: boolean; submittedAt: string }[];
      correctAnswersCount?: number;
    }>;
  }) => {
    if (!userProfile) return { status: "new", text: "Նոր", color: "default", progress: null };
    
    // Get the user's solution for this exercise
    const userSolution = exercise.solutions.find(s => s.userId === userProfile.id);
    
    if (userSolution) {
      // Check for partial completion using submittedAnswers and correctAnswersCount
      if (userSolution.submittedAnswers && Array.isArray(userSolution.submittedAnswers)) {
        const totalAnswers = exercise.correctAnswers.length;
        const correctCount = userSolution.correctAnswersCount || 0;
        
        if (correctCount === 0) {
          return { 
            status: "wrong", 
            text: "Սխալ պատասխան", 
            color: "destructive",
            progress: `0/${totalAnswers}`
          };
        } else if (correctCount < totalAnswers) {
          return { 
            status: "partial", 
            text: `${correctCount}/${totalAnswers}`, 
            color: "warning",
            progress: `${correctCount}/${totalAnswers}`
          };
        } else {
          return { 
            status: "completed", 
            text: "Ավարտված", 
            color: "success",
            progress: null
          };
        }
      } else {
        // Legacy solution - check if it's marked as correct
        if (userSolution.isCorrect) {
          return { status: "completed", text: "Ավարտված", color: "success", progress: null };
        } else {
          return { status: "wrong", text: "Սխալ պատասխան", color: "destructive", progress: null };
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
        return <div className="h-4 w-4 rounded-full border-2 border-yellow-500 bg-yellow-100" />;
      case "wrong":
        return <XCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Սխալ՝ {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Ուսանողական վահանակ
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
        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => {
                setFilter("all");
                setSelectedCourse("");
              }}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Բոլորը
            </Button>
            <Button
              variant={filter === "solved" ? "default" : "outline"}
              onClick={() => {
                setFilter("solved");
                setSelectedCourse("");
              }}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Ավարտված
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Թեմա՝
            </span>
            <select
              className="border rounded px-3 py-2 text-sm flex-1 max-w-xs"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setFilter("course");
              }}
            >
              <option value="">Ընտրել թեմա</option>
              {sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exercises Grid */}
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
                        {exercise.exerciseNumber || `Վարժություն ${exercise.id.slice(-6)}`}
                      </CardTitle>
                      <Badge
                        variant={
                          status.color === "warning" 
                            ? "secondary" 
                            : (status.color as "default" | "destructive" | "secondary")
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
              Դեռ վարժություններ չեն ավելացվել կամ ֆիլտրի արդյունք չկա:
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
