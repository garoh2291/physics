"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, BookOpen, CheckCircle, Clock, XCircle } from "lucide-react";
import { useExercises } from "@/hooks/use-api";
import Link from "next/link";

interface Exercise {
  id: string;
  title: string;
  createdAt: string;
  exerciseAnswer?: {
    id: string;
    correctAnswer: string;
  };
  solutions: {
    id: string;
    status: string;
    isCorrect: boolean;
  }[];
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { data: exercises = [], isLoading, error } = useExercises();

  const getExerciseStatus = (exercise: Exercise) => {
    if (exercise.solutions.length === 0) {
      return { status: "new", text: "Նոր", color: "default" };
    }

    const latestSolution = exercise.solutions[exercise.solutions.length - 1];

    // Check if exercise has a correct answer
    const hasCorrectAnswer = !!exercise.exerciseAnswer?.correctAnswer;

    if (latestSolution.status === "APPROVED") {
      // For exercises with correct answers, also check if the answer is correct
      if (hasCorrectAnswer && latestSolution.isCorrect) {
        return { status: "completed", text: "Ավարտված", color: "success" };
      } else if (!hasCorrectAnswer) {
        // For exercises without correct answers, just being approved is enough
        return { status: "completed", text: "Հաստատված", color: "success" };
      }
    } else if (latestSolution.status === "PENDING") {
      return { status: "pending", text: "Ստուգվում է", color: "warning" };
    } else if (
      latestSolution.status === "REJECTED" ||
      latestSolution.status === "NEEDS_WORK"
    ) {
      return {
        status: "needs_work",
        text: "Վերամշակման կարիք",
        color: "destructive",
      };
    }

    return { status: "in_progress", text: "Ընթացքում", color: "secondary" };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "needs_work":
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
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-semibold mb-2">
            Բարի գալուստ, {session?.user?.name}!
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Ստորև տեսնում եք ձեր վարժությունների ցանկը:
          </p>
        </div>

        {/* Exercises Grid */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => {
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
                        {exercise.title}
                      </CardTitle>
                      <Badge
                        variant={
                          status.color as
                            | "default"
                            | "destructive"
                            | "secondary"
                        }
                        className="flex items-center gap-1 text-xs"
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
                    </div>
                    <Button className="w-full mt-4 text-sm" variant="outline">
                      {exercise.solutions.length === 0 ? "Սկսել" : "Շարունակել"}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Վարժություններ չկան
            </h3>
            <p className="text-gray-500">Դեռ վարժություններ չեն ավելացվել:</p>
          </div>
        )}
      </main>
    </div>
  );
}
