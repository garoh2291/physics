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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/exercises">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վերադառնալ</span>
                </Link>
              </Button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Խմբագրել վարժությունը
              </h1>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
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
                <Label htmlFor="givenText">Տրվածի տեքստ</Label>
                <MathEditor
                  value={givenText}
                  onChange={setGivenText}
                  height={200}
                  placeholder="Մուտքագրեք տրվածի տեքստը..."
                />
              </div>
              <div>
                <Label>Տրվածի նկար</Label>
                <FileUpload
                  value={givenImage}
                  onChange={setGivenImage}
                  label="Վերբեռնել տրվածի նկար (առավելագույնը 5MB)"
                />
              </div>
              {givenImage && (
                <FileViewer
                  url={givenImage}
                  title="Տրվածի նկար"
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
          {/* Tags Section (optional) */}
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
        </form>
      </main>
    </div>
  );
}
