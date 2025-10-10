"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { useExercises } from "@/hooks/use-api";
import { DeleteExerciseDialog } from "@/components/delete-exercise-dialog";
import { useRouter } from "next/navigation";

export default function AdminExercisesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseToDelete, setExerciseToDelete] = useState<{
    id: string;
    title?: string;
    exerciseNumber?: string;
  } | null>(null);

  const { data: exercises = [], isLoading, error } = useExercises();

  // Handle duplicate exercise
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDuplicateExercise = (exercise: any) => {
    // Store exercise data in sessionStorage
    const duplicateData = {
      exerciseNumber: exercise.exerciseNumber
        ? `${exercise.exerciseNumber} (Copy)`
        : "",
      level: exercise.level || 1,
      class: exercise.class,
      problemText: exercise.problemText || "",
      problemImage: exercise.problemImage || "",
      solutionSteps: exercise.solutionSteps || "",
      solutionImage: exercise.solutionImage || "",
      correctAnswerValues: exercise.correctAnswerValues || [],
      answerUnits: exercise.answerUnits || [],
      tags: exercise.tags || [],
      sources: exercise.sources || [],
      sections: exercise.sections || [],
      themes: exercise.themes || [],
      hintText1: exercise.hintText1 || "",
      hintImage1: exercise.hintImage1 || "",
      hintText2: exercise.hintText2 || "",
      hintImage2: exercise.hintImage2 || "",
      hintText3: exercise.hintText3 || "",
      hintImage3: exercise.hintImage3 || "",
    };

    sessionStorage.setItem(
      "duplicateExerciseData",
      JSON.stringify(duplicateData)
    );

    // Navigate to create page
    router.push("/admin/exercises/create");
  };

  // Filter exercises based on search
  const filteredExercises = exercises.filter((exercise) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      exercise.exerciseNumber?.toLowerCase().includes(searchLower) || false
    );
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getStatusCounts = (solutions: any[]) => {
    const pending = solutions.filter((s) => s.status === "PENDING").length;
    const approved = solutions.filter((s) => s.status === "APPROVED").length;
    const rejected = solutions.filter((s) => s.status === "REJECTED").length;
    const needsWork = solutions.filter((s) => s.status === "NEEDS_WORK").length;

    return { pending, approved, rejected, needsWork, total: solutions.length };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Բեռնվում...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Սխալ՝ {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վահանակ</span>
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  Վարժությունների կառավարում
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Ընդամենը {exercises.length} վարժություն
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/admin/exercises/create">
                <Plus className="h-4 w-4 mr-2" />
                Նոր վարժություն
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Search */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="pt-4 md:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Փնտրել վարժություններ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm md:text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercises Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg md:text-xl">Վարժություններ</span>
              <Badge variant="outline">
                {filteredExercises.length} արդյունք
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📚</div>
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                  {searchQuery
                    ? "Արդյունքներ չգտնվեցին"
                    : "Վարժություններ չկան"}
                </h3>
                <p className="text-sm md:text-base text-gray-500 mb-4">
                  {searchQuery
                    ? "Փորձեք փոխել որոնման բառերը"
                    : "Ստեղծեք ձեր առաջին վարժությունը"}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href="/admin/exercises/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Ստեղծել վարժություն
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4">
                  {filteredExercises.map((exercise) => {
                    const stats = getStatusCounts(exercise.solutions);
                    return (
                      <Card key={exercise.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm truncate">
                                {exercise.exerciseNumber ||
                                  `Վարժություն ${exercise.id.slice(-6)}`}
                              </h3>
                              <p className="text-xs text-gray-500">
                                ID: {exercise.id.substring(0, 8)}...
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/exercises/${exercise.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Դիտել
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/admin/exercises/${exercise.id}/edit`}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Խմբագրել
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDuplicateExercise(exercise)
                                  }
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Պատճենել
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setExerciseToDelete(exercise)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Ջնջել
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="text-xs text-gray-600">
                            Ստեղծված՝{" "}
                            {new Date(exercise.createdAt).toLocaleDateString(
                              "hy-AM"
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="text-xs font-medium">
                              Ընդամենը՝ {stats.total} լուծում
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {stats.pending > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600 text-xs"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {stats.pending}
                                </Badge>
                              )}
                              {stats.approved > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-green-600 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {stats.approved}
                                </Badge>
                              )}
                              {stats.rejected > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-red-600 text-xs"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {stats.rejected}
                                </Badge>
                              )}
                              {stats.needsWork > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-yellow-600 text-xs"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {stats.needsWork}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="flex-1"
                            >
                              <Link href={`/admin/exercises/${exercise.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                Դիտել
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="flex-1"
                            >
                              <Link
                                href={`/admin/exercises/${exercise.id}/edit`}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Խմբագրել
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Վարժություն</TableHead>
                        <TableHead>Ստեղծման ամսաթիվ</TableHead>
                        <TableHead>Լուծումներ</TableHead>
                        <TableHead>Կարգավիճակ</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExercises.map((exercise) => {
                        const stats = getStatusCounts(exercise.solutions);
                        return (
                          <TableRow key={exercise.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {exercise.exerciseNumber ||
                                    `Վարժություն ${exercise.id.slice(-6)}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {exercise.id.substring(0, 8)}...
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="text-sm">
                                {new Date(
                                  exercise.createdAt
                                ).toLocaleDateString("hy-AM")}
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-2">
                                <div className="text-sm font-medium">
                                  Ընդամենը՝ {stats.total}
                                </div>
                                <div className="flex flex-wrap gap-1 text-xs">
                                  {stats.pending > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-orange-600"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      {stats.pending}
                                    </Badge>
                                  )}
                                  {stats.approved > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {stats.approved}
                                    </Badge>
                                  )}
                                  {stats.rejected > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-red-600"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      {stats.rejected}
                                    </Badge>
                                  )}
                                  {stats.needsWork > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-yellow-600"
                                    >
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      {stats.needsWork}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="default">Ակտիվ</Badge>
                            </TableCell>

                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/admin/exercises/${exercise.id}`}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Դիտել
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/admin/exercises/${exercise.id}/edit`}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Խմբագրել
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDuplicateExercise(exercise)
                                    }
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Պատճենել
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      setExerciseToDelete(exercise)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Ջնջել
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      {exerciseToDelete?.id ? (
        <DeleteExerciseDialog
          exercise={exerciseToDelete}
          open={!!exerciseToDelete?.id}
          onClose={() => setExerciseToDelete(null)}
        />
      ) : null}
    </div>
  );
}
