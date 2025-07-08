"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save } from "lucide-react";
import { MathEditor } from "@/components/math-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { FileViewer } from "@/components/ui/file-viewer";
import { TagSelector } from "@/components/ui/tag-selector";
import { CourseSelector } from "@/components/ui/course-selector";
import { useExercise, useUpdateExercise } from "@/hooks/use-api";

export default function EditExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;

  const [title, setTitle] = useState("");
  const [problemText, setProblemText] = useState("");
  const [problemImage, setProblemImage] = useState("");
  const [givenText, setGivenText] = useState("");
  const [givenImage, setGivenImage] = useState("");
  const [solutionSteps, setSolutionSteps] = useState("");
  const [solutionImage, setSolutionImage] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selectedTags, setSelectedTags] = useState<
    Array<{ id: string; name: string; url?: string | null }>
  >([]);
  const [selectedCourses, setSelectedCourses] = useState<
    Array<{ id: string; name: string; url?: string | null }>
  >([]);
  const [hintText1, setHintText1] = useState("");
  const [hintImage1, setHintImage1] = useState("");
  const [hintText2, setHintText2] = useState("");
  const [hintImage2, setHintImage2] = useState("");
  const [hintText3, setHintText3] = useState("");
  const [hintImage3, setHintImage3] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const {
    data: exercise,
    isLoading,
    error: fetchError,
  } = useExercise(exerciseId);
  const updateExerciseMutation = useUpdateExercise();

  useEffect(() => {
    if (exercise) {
      setTitle(exercise.title || "");
      setProblemText(exercise.problemText || "");
      setProblemImage(exercise.problemImage || "");
      setGivenText(exercise.givenText || "");
      setGivenImage(exercise.givenImage || "");
      setSolutionSteps(exercise.solutionSteps || "");
      setSolutionImage(exercise.solutionImage || "");
      setCorrectAnswer(exercise.correctAnswer || "");
      setSelectedTags(exercise.tags || []);
      setSelectedCourses(exercise.courses || []);
      setHintText1(exercise.hintText1 || "");
      setHintImage1(exercise.hintImage1 || "");
      setHintText2(exercise.hintText2 || "");
      setHintImage2(exercise.hintImage2 || "");
      setHintText3(exercise.hintText3 || "");
      setHintImage3(exercise.hintImage3 || "");
    }
  }, [exercise]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Վերնագիրը պարտադիր է");
      return;
    }
    if (!problemText.trim() && !problemImage) {
      setError("Տրված տվյալները պետք է պարունակեն տեքստ կամ նկար");
      return;
    }
    if (!solutionSteps.trim() && !solutionImage) {
      setError("Լուծման քայլերը պետք է պարունակի տեքստ կամ նկար");
      return;
    }
    if (!correctAnswer.trim()) {
      setError("Ճիշտ պատասխանը պարտադիր է");
      return;
    }

    updateExerciseMutation.mutate(
      {
        id: exerciseId,
        data: {
          title,
          problemText,
          problemImage,
          givenText,
          givenImage,
          solutionSteps,
          solutionImage,
          correctAnswer,
          tagIds: selectedTags.map((tag) => tag.id),
          courseIds: selectedCourses.map((course) => course.id),
          hintText1,
          hintImage1,
          hintText2,
          hintImage2,
          hintText3,
          hintImage3,
        },
      },
      {
        onSuccess: () => {
          router.push("/admin/exercises");
        },
        onError: (error: Error) => {
          setError(error.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Բեռնվում...</div>
      </div>
    );
  }

  if (fetchError || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">
          Սխալ՝ {fetchError?.message || "Վարժությունը չգտնվեց"}
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
                <Link href="/admin/exercises">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վերադառնալ</span>
                </Link>
              </Button>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                Խմբագրել վարժությունը
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSubmit}
                disabled={updateExerciseMutation.isPending}
                className="flex-1 sm:flex-none text-sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateExerciseMutation.isPending
                  ? "Պահպանվում..."
                  : "Պահպանել"}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 md:py-8">
        {error && (
          <Alert variant="destructive" className="mb-4 md:mb-6">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>Վարժության վերնագիր *</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Օրինակ՝ Մարմնի շարժում թեք հարթության վրա"
                required
              />
            </CardContent>
          </Card>

          {/* Given Data Section */}
          <Card>
            <CardHeader>
              <CardTitle>Տրված տվյալներ *</CardTitle>
              <p className="text-sm text-gray-600">
                Պարտադիր է մուտքագրել տրվածի տեքստ կամ վերբեռնել նկար
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="problemText">Տրվածի տեքստ</Label>
                <MathEditor
                  value={problemText}
                  onChange={setProblemText}
                  height={200}
                  placeholder="Մուտքագրեք տրվածի տեքստը..."
                />
              </div>
              <div>
                <Label>Տրվածի նկար</Label>
                <FileUpload
                  value={problemImage}
                  onChange={setProblemImage}
                  label="Վերբեռնել տրվածի նկար (առավելագույնը 5MB)"
                />
              </div>
              {problemImage && (
                <FileViewer
                  url={problemImage}
                  title="Տրվածի նկար"
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Additional Given Data Section */}
          <Card>
            <CardHeader>
              <CardTitle>Լրացուցիչ տրված տվյալներ</CardTitle>
              <p className="text-sm text-gray-600">
                Լրացուցիչ տրված տվյալներ (ոչ պարտադիր)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="givenText">Լրացուցիչ տրվածի տեքստ</Label>
                <MathEditor
                  value={givenText}
                  onChange={setGivenText}
                  height={200}
                  placeholder="Մուտքագրեք լրացուցիչ տրվածի տեքստը..."
                />
              </div>
              <div>
                <Label>Լրացուցիչ տրվածի նկար</Label>
                <FileUpload
                  value={givenImage}
                  onChange={setGivenImage}
                  label="Վերբեռնել լրացուցիչ տրվածի նկար (առավելագույնը 5MB)"
                />
              </div>
              {givenImage && (
                <FileViewer
                  url={givenImage}
                  title="Լրացուցիչ տրվածի նկար"
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Solution Section */}
          <Card>
            <CardHeader>
              <CardTitle>Լուծման քայլեր *</CardTitle>
              <p className="text-sm text-gray-600">
                Պարտադիր է մուտքագրել լուծման տեքստ կամ վերբեռնել նկար
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="solutionSteps">Լուծման տեքստ</Label>
                <MathEditor
                  value={solutionSteps}
                  onChange={setSolutionSteps}
                  height={250}
                  placeholder="Մուտքագրեք լուծման քայլերը..."
                />
              </div>
              <div>
                <Label>Լուծման նկար</Label>
                <FileUpload
                  value={solutionImage}
                  onChange={setSolutionImage}
                  label="Վերբեռնել լուծման նկար (առավելագույնը 5MB)"
                />
              </div>
              {solutionImage && (
                <FileViewer
                  url={solutionImage}
                  title="Լուծման նկար"
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Correct Answer Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ճիշտ պատասխան *</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                id="correctAnswer"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="Օրինակ՝ 42"
                required
              />
            </CardContent>
          </Card>

          {/* Hints Section */}
          <Card>
            <CardHeader>
              <CardTitle>Հուշումներ (ոչ պարտադիր)</CardTitle>
              <p className="text-sm text-gray-600">
                Ավելացրեք մինչև 3 հուշում ուսանողներին օգնելու համար
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hint 1 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Հուշում 1</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hintText1" className="text-sm">
                      Հուշման տեքստ
                    </Label>
                    <MathEditor
                      value={hintText1}
                      onChange={setHintText1}
                      height={150}
                      placeholder="Մուտքագրեք առաջին հուշումը..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Հուշման նկար</Label>
                    <FileUpload
                      value={hintImage1}
                      onChange={setHintImage1}
                      label="Վերբեռնել հուշման նկար (առավելագույնը 5MB)"
                    />
                  </div>
                  {hintImage1 && (
                    <FileViewer
                      url={hintImage1}
                      title="Հուշում 1 նկար"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Hint 2 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Հուշում 2</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hintText2" className="text-sm">
                      Հուշման տեքստ
                    </Label>
                    <MathEditor
                      value={hintText2}
                      onChange={setHintText2}
                      height={150}
                      placeholder="Մուտքագրեք երկրորդ հուշումը..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Հուշման նկար</Label>
                    <FileUpload
                      value={hintImage2}
                      onChange={setHintImage2}
                      label="Վերբեռնել հուշման նկար (առավելագույնը 5MB)"
                    />
                  </div>
                  {hintImage2 && (
                    <FileViewer
                      url={hintImage2}
                      title="Հուշում 2 նկար"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>

              {/* Hint 3 */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Հուշում 3</Label>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hintText3" className="text-sm">
                      Հուշման տեքստ
                    </Label>
                    <MathEditor
                      value={hintText3}
                      onChange={setHintText3}
                      height={150}
                      placeholder="Մուտքագրեք երրորդ հուշումը..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Հուշման նկար</Label>
                    <FileUpload
                      value={hintImage3}
                      onChange={setHintImage3}
                      label="Վերբեռնել հուշման նկար (առավելագույնը 5MB)"
                    />
                  </div>
                  {hintImage3 && (
                    <FileViewer
                      url={hintImage3}
                      title="Հուշում 3 նկար"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card>
            <CardHeader>
              <CardTitle>Պիտակներ (ոչ պարտադիր)</CardTitle>
            </CardHeader>
            <CardContent>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </CardContent>
          </Card>

          {/* Courses Section */}
          <Card>
            <CardHeader>
              <CardTitle>Թեմաներ (ոչ պարտադիր)</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseSelector
                selectedCourses={selectedCourses}
                onCoursesChange={setSelectedCourses}
              />
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
