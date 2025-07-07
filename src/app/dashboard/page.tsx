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
  solutions: {
    id: string;
    status: string;
    isCorrect: boolean;
    attemptNumber: number;
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

    if (latestSolution.status === "APPROVED" && latestSolution.isCorrect) {
      return { status: "completed", text: "Ավարտված", color: "success" };
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Ուսանողական վահանակ
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback>
                  {session?.user?.name?.charAt(0) || "Ու"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{session?.user?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Ելք
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Բարի գալուստ, {session?.user?.name}!
          </h2>
          <p className="text-gray-600">
            Ստորև տեսնում եք ձեր վարժությունների ցանկը:
          </p>
        </div>

        {/* Exercises Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">
                        {exercise.title}
                      </CardTitle>
                      <Badge
                        variant={
                          status.color as
                            | "default"
                            | "destructive"
                            | "secondary"
                        }
                        className="ml-2 flex items-center gap-1"
                      >
                        {getStatusIcon(status.status)}
                        {status.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        Ստեղծված՝{" "}
                        {new Date(exercise.createdAt).toLocaleDateString(
                          "hy-AM"
                        )}
                      </p>
                      <p>Փորձեր՝ {exercise.solutions.length}</p>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
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
