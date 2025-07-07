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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { useExercises, useDeleteExercise } from "@/hooks/use-api";

export default function AdminExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exercise: any;
  }>({ isOpen: false, exercise: null });

  const { data: exercises = [], isLoading, error } = useExercises();
  const deleteExerciseMutation = useDeleteExercise();

  // Filter exercises based on search
  const filteredExercises = exercises.filter((exercise) =>
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (deleteDialog.exercise) {
      deleteExerciseMutation.mutate(deleteDialog.exercise.id, {
        onSuccess: () => {
          setDeleteDialog({ isOpen: false, exercise: null });
        },
      });
    }
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Վահանակ
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Վարժությունների կառավարում
                </h1>
                <p className="text-gray-600">
                  Ընդամենը {exercises.length} վարժություն
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/admin/exercises/create">
                <Plus className="h-4 w-4 mr-2" />
                Նոր վարժություն
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Փնտրել վարժություններ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Exercises Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Վարժություններ</span>
              <Badge variant="outline">
                {filteredExercises.length} արդյունք
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExercises.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-12 w-12 text-gray-400 mx-auto mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery
                    ? "Արդյունքներ չգտնվեցին"
                    : "Վարժություններ չկան"}
                </h3>
                <p className="text-gray-500 mb-4">
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
              <div className="overflow-x-auto">
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
                                {exercise.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {exercise.id.substring(0, 8)}...
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm">
                              {new Date(exercise.createdAt).toLocaleDateString(
                                "hy-AM"
                              )}
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
                                  className="text-red-600"
                                  onClick={() =>
                                    setDeleteDialog({ isOpen: true, exercise })
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
            )}
          </CardContent>
        </Card>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ isOpen: false, exercise: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ջնջել վարժությունը</DialogTitle>
            <DialogDescription>
              Դուք վստա՞հ եք, որ ցանկանում եք ջնջել &quot;
              {deleteDialog.exercise?.title}&quot; վարժությունը: Այս
              գործողությունը հետադարձելի չէ և ջնջելու է նաև բոլոր հարակից
              լուծումները:
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, exercise: null })}
            >
              Չեղարկել
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteExerciseMutation.isPending}
            >
              {deleteExerciseMutation.isPending ? "Ջնջվում..." : "Ջնջել"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
