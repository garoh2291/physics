"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, BookOpen, CheckCircle, Coins } from "lucide-react";
import { useExercises, useUserProfile, useCourses } from "@/hooks/use-api";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { data: exercises = [], isLoading, error } = useExercises();
  const { data: userProfile } = useUserProfile();
  const { data: courses = [] } = useCourses();
  const [filter, setFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // Helper: solved exercise IDs
  const solvedIds = useMemo(() => {
    if (!userProfile) return new Set<string>();
    return new Set(
      userProfile.solutions.filter((s) => s.isCorrect).map((s) => s.exerciseId)
    );
  }, [userProfile]);

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    if (filter === "solved") {
      return exercises.filter((ex) => solvedIds.has(ex.id));
    }
    if (filter === "course" && selectedCourse) {
      return exercises.filter((ex) =>
        ex.courses.some((c) => c.id === selectedCourse)
      );
    }
    return exercises;
  }, [exercises, filter, selectedCourse, solvedIds]);

  const getExerciseStatus = (exercise: any) => {
    if (!userProfile) return { status: "new", text: "Նոր", color: "default" };
    const solved = solvedIds.has(exercise.id);
    if (solved)
      return { status: "completed", text: "Ավարտված", color: "success" };
    if (exercise.solutions.length > 0)
      return { status: "in_progress", text: "Ընթացքում", color: "secondary" };
    return { status: "new", text: "Նոր", color: "default" };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
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
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => {
              setFilter("all");
              setSelectedCourse("");
            }}
            size="sm"
          >
            Բոլոր վարժությունները
          </Button>
          <Button
            variant={filter === "solved" ? "default" : "outline"}
            onClick={() => {
              setFilter("solved");
              setSelectedCourse("");
            }}
            size="sm"
          >
            Ավարտվածները
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Թեմա՝</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setFilter("course");
              }}
            >
              <option value="">Ընտրել թեմա</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
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
