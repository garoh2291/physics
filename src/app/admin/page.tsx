"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  BookOpen,
  Plus,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { useExercises } from "@/hooks/use-api";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data: exercises = [], isLoading } = useExercises();

  // Calculate statistics
  const totalExercises = exercises.length;
  const totalSolutions = exercises.reduce(
    (acc, ex) => acc + ex.solutions.length,
    0
  );
  const pendingSolutions = exercises.reduce(
    (acc, ex) =>
      acc + ex.solutions.filter((s) => s.status === "PENDING").length,
    0
  );
  const approvedSolutions = exercises.reduce(
    (acc, ex) =>
      acc + ex.solutions.filter((s) => s.status === "APPROVED").length,
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
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
              Ադմին վահանակ
            </h1>
            <div className="flex items-center space-x-2 md:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback className="bg-blue-100">
                    {session?.user?.name?.charAt(0) || "Ա"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session?.user?.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {session?.user?.role === "SUPERADMIN"
                      ? "Սուպեր ադմին"
                      : "Ադմին"}
                  </Badge>
                </div>
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
            Կառավարեք վարժությունները և ուսանողների աշխատանքները:
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Վարժություններ
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExercises}</div>
              <p className="text-xs text-muted-foreground">Ընդամենը</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Լուծումներ</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSolutions}</div>
              <p className="text-xs text-muted-foreground">Ընդամենը</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ստուգման կարիք
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pendingSolutions}
              </div>
              <p className="text-xs text-muted-foreground">
                Սպասում է գնահատման
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Հաստատված</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approvedSolutions}
              </div>
              <p className="text-xs text-muted-foreground">Հաջողվել է</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Removed PDF Upload */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Նոր վարժություն
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Ստեղծեք նոր ֆիզիկայի վարժություն ուսանողների համար:
              </p>
              <Button asChild className="w-full">
                <Link href="/admin/exercises/create">Ստեղծել վարժություն</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Վարժությունների ցանկ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Դիտեք և խմբագրեք առկա վարժությունները:
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/exercises">Դիտել բոլորը</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Լուծումներ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Գնահատեք ուսանողների լուծումները:
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/solutions">
                  Գնահատել
                  {pendingSolutions > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingSolutions}
                    </Badge>
                  )}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Exercises */}
        <Card>
          <CardHeader>
            <CardTitle>Վերջին վարժությունները</CardTitle>
          </CardHeader>
          <CardContent>
            {exercises.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Վարժություններ չկան
                </h3>
                <p className="text-gray-500 mb-4">
                  Սկսեք ձեր առաջին վարժությունը ստեղծելով:
                </p>
                <Button asChild>
                  <Link href="/admin/exercises/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Ստեղծել վարժություն
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.slice(0, 5).map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm md:text-base truncate">
                        {exercise.title}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-500">
                        Ստեղծված՝{" "}
                        {new Date(exercise.createdAt).toLocaleDateString(
                          "hy-AM"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Badge variant="outline" className="text-xs">
                        {exercise.solutions.length} լուծում
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="ml-auto sm:ml-0"
                      >
                        <Link href={`/admin/exercises/${exercise.id}`}>
                          Դիտել
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                {exercises.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href="/admin/exercises">Դիտել բոլորը</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
