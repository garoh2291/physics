"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, BookOpen, ArrowLeft } from "lucide-react";

interface Course {
  id: string;
  name: string;
  url?: string | null;
  exercises?: Array<{ id: string; title: string }>;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseUrl, setNewCourseUrl] = useState("");
  const [editCourseName, setEditCourseName] = useState("");
  const [editCourseUrl, setEditCourseUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError("Թեմաները բեռնելու սխալ");
      }
    } catch {
      setError("Սերվերի սխալ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) {
      setError("Թեմայի անունը պարտադիր է");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCourseName.trim(),
          url: newCourseUrl.trim() || null,
        }),
      });

      if (response.ok) {
        const newCourse = await response.json();
        setCourses([...courses, newCourse]);
        setNewCourseName("");
        setNewCourseUrl("");
        setIsCreateDialogOpen(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Թեմա ստեղծելու սխալ");
      }
    } catch {
      setError("Սերվերի սխալ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editCourseName.trim()) {
      setError("Թեմայի անունը պարտադիր է");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editCourseName.trim(),
          url: editCourseUrl.trim() || null,
        }),
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(
          courses.map((course) =>
            course.id === editingCourse.id ? updatedCourse : course
          )
        );
        setIsEditDialogOpen(false);
        setEditingCourse(null);
        setEditCourseName("");
        setEditCourseUrl("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Թեմա թարմացնելու սխալ");
      }
    } catch {
      setError("Սերվերի սխալ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Դուք վստա՞հ եք, որ ցանկանում եք ջնջել այս թեման:")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses(courses.filter((course) => course.id !== courseId));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Թեմա ջնջելու սխալ");
      }
    } catch {
      setError("Սերվերի սխալ");
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setEditCourseName(course.name);
    setEditCourseUrl(course.url || "");
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վերադառնալ</span>
                </Link>
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Թեմաների կառավարում
              </h1>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Նոր թեմա
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ստեղծել նոր թեմա</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div>
                    <Label htmlFor="courseName">Թեմայի անուն *</Label>
                    <Input
                      id="courseName"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="Օրինակ՝ Մեխանիկա"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="courseUrl">URL (ոչ պարտադիր)</Label>
                    <Input
                      id="courseUrl"
                      value={newCourseUrl}
                      onChange={(e) => setNewCourseUrl(e.target.value)}
                      placeholder="https://example.com/course"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Չեղարկել
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Ստեղծվում..." : "Ստեղծել"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ընդամենը թեմաներ
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Թեմաներ չկան
                </h3>
                <p className="text-gray-500 mb-4">
                  Ստեղծեք առաջին թեման՝ վարժությունները կազմակերպելու համար:
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ստեղծել թեմա
                </Button>
              </CardContent>
            </Card>
          ) : (
            courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {course.name}
                        </h3>
                      </div>
                      {course.url && (
                        <p className="text-sm text-gray-600 truncate">
                          URL: {course.url}
                        </p>
                      )}
                      {course.exercises && (
                        <p className="text-sm text-gray-500 mt-1">
                          {course.exercises.length} վարժություն
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Խմբագրել
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Ջնջել
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Խմբագրել թեման</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditCourse} className="space-y-4">
              <div>
                <Label htmlFor="editCourseName">Թեմայի անուն *</Label>
                <Input
                  id="editCourseName"
                  value={editCourseName}
                  onChange={(e) => setEditCourseName(e.target.value)}
                  placeholder="Օրինակ՝ Մեխանիկա"
                  required
                />
              </div>
              <div>
                <Label htmlFor="editCourseUrl">URL (ոչ պարտադիր)</Label>
                <Input
                  id="editCourseUrl"
                  value={editCourseUrl}
                  onChange={(e) => setEditCourseUrl(e.target.value)}
                  placeholder="https://example.com/course"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Չեղարկել
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Պահպանվում..." : "Պահպանել"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
