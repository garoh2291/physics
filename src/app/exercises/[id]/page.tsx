"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Eye } from "lucide-react";
import { FileViewer } from "@/components/ui/file-viewer";
import { useExercise, useSubmitSolution } from "@/hooks/use-api";

export default function StudentExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;

  const [finalAnswer, setFinalAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    data: exercise,
    isLoading,
    error: fetchError,
  } = useExercise(exerciseId);
  const submitSolutionMutation = useSubmitSolution();

  useEffect(() => {
    if (exercise?.solutions && exercise.solutions.length > 0) {
      const solution = exercise.solutions[0];
      setFinalAnswer(solution.finalAnswer || "");
      setIsCompleted(solution.isCorrect);
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!finalAnswer.trim()) {
      setError("Պատասխանը պարտադիր է");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitSolutionMutation.mutateAsync({
        exerciseId,
        finalAnswer,
      });
      if (result.isCorrect) {
        setSuccess("Շնորհավորանքներ, ճիշտ պատասխան է!");
        setIsCompleted(true);
      } else {
        setError("Պատասխանը սխալ է, փորձեք նորից:");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Սխալ տեղի ունեցավ";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վերադառնալ</span>
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {exercise.title}
                </h1>
              </div>
            </div>
            {isCompleted && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Ավարտված</span>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Տրված տվյալներ</CardTitle>
          </CardHeader>
          <CardContent>
            {exercise.problemImage && (
              <FileViewer
                url={exercise.problemImage}
                title="Տրվածի նկար"
                className="mb-4"
              />
            )}
            {exercise.problemText && (
              <div className="prose prose-lg max-w-none bg-white p-6 rounded-lg border">
                {exercise.problemText}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!isCompleted ? (
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Պատասխան</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="finalAnswer">Ձեր պատասխանը *</Label>
                <Input
                  id="finalAnswer"
                  value={finalAnswer}
                  onChange={(e) => setFinalAnswer(e.target.value)}
                  placeholder="Օրինակ՝ 42"
                  required
                  disabled={isSubmitting}
                />
              </CardContent>
            </Card>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Ուղարկվում է..." : "Ուղարկել"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Վարժությունը ավարտված է</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Շնորհավորանքներ! Դուք ճիշտ պատասխանել եք այս վարժությանը:
                </p>
                <Button
                  onClick={() => setShowSolution(!showSolution)}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showSolution ? "Թաքցնել լուծումը" : "Տեսնել լուծումը"}
                </Button>
              </CardContent>
            </Card>

            {showSolution && (
              <Card>
                <CardHeader>
                  <CardTitle>Լուծում</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Correct Answer */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 text-green-800">
                      Ճիշտ պատասխան:
                    </h4>
                    <p className="text-lg font-mono text-green-700 bg-white p-2 rounded border">
                      {exercise.correctAnswer}
                    </p>
                  </div>

                  {exercise.givenImage && (
                    <FileViewer
                      url={exercise.givenImage}
                      title="Լրացուցիչ տրվածի նկար"
                      className="mb-4"
                    />
                  )}
                  {exercise.givenText && (
                    <div className="prose prose-lg max-w-none bg-white p-6 rounded-lg border">
                      <h4 className="font-semibold mb-2">
                        Լրացուցիչ տրված տվյալներ:
                      </h4>
                      {exercise.givenText}
                    </div>
                  )}
                  {exercise.solutionImage && (
                    <FileViewer
                      url={exercise.solutionImage}
                      title="Լուծման նկար"
                      className="mb-4"
                    />
                  )}
                  {exercise.solutionSteps && (
                    <div className="prose prose-lg max-w-none bg-white p-6 rounded-lg border">
                      <h4 className="font-semibold mb-2">Լուծման քայլեր:</h4>
                      {exercise.solutionSteps}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
