"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, BookOpen } from "lucide-react";

interface Course {
  id: string;
  name: string;
  url?: string | null;
}

interface CourseSelectorProps {
  selectedCourses: Course[];
  onCoursesChange: (courses: Course[]) => void;
  className?: string;
}

export function CourseSelector({
  selectedCourses,
  onCoursesChange,
  className,
}: CourseSelectorProps) {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const courses = await response.json();
          setAvailableCourses(courses);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const addCourse = (course: Course) => {
    if (!selectedCourses.find((c) => c.id === course.id)) {
      onCoursesChange([...selectedCourses, course]);
    }
  };

  const removeCourse = (courseId: string) => {
    onCoursesChange(selectedCourses.filter((c) => c.id !== courseId));
  };

  const createNewCourse = async () => {
    if (!newCourseName.trim()) return;

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCourseName.trim() }),
      });

      if (response.ok) {
        const newCourse = await response.json();
        setAvailableCourses((prev) => [...prev, newCourse]);
        addCourse(newCourse);
        setNewCourseName("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Սխալ թեմա ստեղծելիս");
      }
    } catch {
      setError("Սերվերի սխալ");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      createNewCourse();
    }
  };

  const unselectedCourses = availableCourses.filter(
    (course) => !selectedCourses.find((selected) => selected.id === course.id)
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-sm font-medium">Թեմաներ</Label>
        <p className="text-sm text-gray-500 mt-1">
          Ընտրեք գոյություն ունեցող թեմաներ կամ ստեղծեք նորերը
        </p>
      </div>

      {/* Selected Courses */}
      {selectedCourses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCourses.map((course) => (
            <Badge
              key={course.id}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <BookOpen className="h-3 w-3" />
              {course.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeCourse(course.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Create New Course */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Նոր թեմայի անուն..."
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCreating}
              />
            </div>
            <Button
              onClick={createNewCourse}
              disabled={!newCourseName.trim() || isCreating}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              {isCreating ? "Ստեղծվում..." : "Ավելացնել"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Available Courses */}
      {unselectedCourses.length > 0 && (
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Գոյություն ունեցող թեմաներ
          </Label>
          <div className="flex flex-wrap gap-2">
            {unselectedCourses.map((course) => (
              <Badge
                key={course.id}
                variant="outline"
                className="cursor-pointer hover:bg-gray-50 px-3 py-1"
                onClick={() => addCourse(course)}
              >
                <BookOpen className="h-3 w-3 mr-1" />
                {course.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {availableCourses.length === 0 && selectedCourses.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Դեռ թեմաներ չկան: Ստեղծեք առաջին թեման:
        </p>
      )}
    </div>
  );
}
