"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Coins,
} from "lucide-react";
import { FileViewer } from "@/components/ui/file-viewer";
import { MathPreview } from "@/components/math-preview";
import {
  useExercise,
  useSubmitSolution,
  useUserProfile,
  useHintUsage,
} from "@/hooks/use-api";
import { useSession } from "next-auth/react";

const HINT_COSTS = { 1: 1, 2: 3, 3: 5 };

export default function StudentExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;

  const [finalAnswer, setFinalAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSolution, setShowSolution] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);

  const {
    data: exercise,
    isLoading,
    error: fetchError,
  } = useExercise(exerciseId);
  const {
    data: userProfile,
    isLoading: userLoading,
    error: userError,
  } = useUserProfile();
  const submitSolutionMutation = useSubmitSolution();
  const hintUsageMutation = useHintUsage();
  const { data: session } = useSession();

  console.log("User profile state:", {
    userProfile,
    userLoading,
    userError,
    session,
  });

  useEffect(() => {
    if (exercise?.solutions && exercise.solutions.length > 0) {
      const solution = exercise.solutions[0];
      setFinalAnswer(solution.finalAnswer || "");
      setIsCompleted(solution.isCorrect);
    }
  }, [exercise]);

  // Get unlocked hints for this exercise from user profile
  useEffect(() => {
    if (userProfile && exerciseId) {
      const exerciseHints = userProfile.hintUsages
        .filter((usage) => usage.exerciseId === exerciseId)
        .map((usage) => usage.hintLevel);
      console.log("Setting unlocked hints", {
        exerciseHints,
        userProfile,
        exerciseId,
      });
      setUnlockedHints(exerciseHints);
    }
  }, [userProfile, exerciseId]);

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
        setShowHints(false);
      } else {
        setError("Պատասխանը սխալ է, փորձեք նորից կամ օգտվեք հուշումներից:");
        setShowHints(true);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Սխալ տեղի ունեցավ";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestHint = async (hintLevel: 1 | 2 | 3) => {
    if (!userProfile || !exerciseId) {
      console.log("No userProfile or exerciseId", { userProfile, exerciseId });
      return;
    }

    const cost = HINT_COSTS[hintLevel];
    const currentCredits = userProfile.credits ?? 0;
    console.log("Requesting hint", {
      hintLevel,
      cost,
      currentCredits,
      unlockedHints,
    });

    if (currentCredits < cost) {
      setError(`Բավարար կրեդիտներ չկան: պետք է ${cost} կրեդիտ`);
      return;
    }

    try {
      console.log("Calling hint usage API...");
      const requestData = {
        exerciseId,
        hintLevel,
      };
      console.log("Request data being sent:", requestData);
      const result = await hintUsageMutation.mutateAsync(requestData);
      console.log("Hint usage result", result);
      setUnlockedHints(result.unlockedHints);
      setError(""); // Clear any previous errors
    } catch (error: unknown) {
      console.error("Hint usage error", error);
      const errorMessage =
        error instanceof Error ? error.message : "Հուշում բացելու սխալ";
      setError(errorMessage);
    }
  };

  const hasHints =
    exercise?.hintText1 ||
    exercise?.hintImage1 ||
    exercise?.hintText2 ||
    exercise?.hintImage2 ||
    exercise?.hintText3 ||
    exercise?.hintImage3;

  const getNextAvailableHint = () => {
    if (!unlockedHints.includes(1)) return 1;
    if (!unlockedHints.includes(2)) return 2;
    if (!unlockedHints.includes(3)) return 3;
    return null; // All hints unlocked
  };

  const nextHint = getNextAvailableHint();
  console.log("Hint state", {
    unlockedHints,
    nextHint,
    userProfile: userProfile?.credits,
  });

  if (isLoading || userLoading) {
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

  if (userError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-red-600">
          Սխալ՝ {userError.message || "Օգտատիրոջ տվյալները բեռնելու սխալ"}
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
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Վերադառնալ</span>
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {exercise.title}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              {/* Credits */}
              {userProfile && (
                <span className="flex items-center px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold">
                  <Coins className="h-4 w-4 mr-1 text-yellow-500" />
                  {userProfile.credits} կրեդիտ
                </span>
              )}
              {isCompleted && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium text-sm md:text-base">
                    Ավարտված
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Խնդիր</CardTitle>
          </CardHeader>
          <CardContent>
            {exercise.problemImage && (
              <FileViewer
                url={exercise.problemImage}
                title="Խնդրի նկար"
                className="mb-4"
              />
            )}
            {exercise.problemText && (
              <MathPreview
                value={exercise.problemText}
                className="prose prose-lg max-w-none bg-white p-6 rounded-lg border"
              />
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

        {/* Hints Section */}
        {hasHints && !isCompleted && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <span>Հուշումներ</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                  className="ml-auto"
                >
                  {showHints ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {(showHints || unlockedHints.length > 0) && (
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Օգտվեք հուշումներից՝ ձեր պատասխանը ստուգելուց հետո:
                </p>
                {nextHint && (
                  <p className="text-sm text-blue-600 font-medium">
                    Հասանելի է՝ Հուշում {nextHint} ({HINT_COSTS[nextHint]}{" "}
                    կրեդիտ)
                  </p>
                )}
                {!nextHint && unlockedHints.length > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    Բոլոր հուշումները օգտագործված են
                  </p>
                )}

                {/* Hint 1 */}
                {(exercise.hintText1 || exercise.hintImage1) && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-800 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Հուշում 1
                        {unlockedHints.includes(1) && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Օգտագործված
                          </span>
                        )}
                      </h4>
                      {!unlockedHints.includes(1) && nextHint === 1 && (
                        <Button
                          onClick={() => requestHint(1)}
                          disabled={hintUsageMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-100"
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          {HINT_COSTS[1]} կրեդիտ
                        </Button>
                      )}
                    </div>
                    {unlockedHints.includes(1) && (
                      <>
                        {exercise.hintImage1 && (
                          <FileViewer
                            url={exercise.hintImage1}
                            title="Հուշում 1 նկար"
                            className="mb-3"
                          />
                        )}
                        {exercise.hintText1 && (
                          <MathPreview
                            value={exercise.hintText1}
                            className="prose prose-sm max-w-none"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Hint 2 */}
                {(exercise.hintText2 || exercise.hintImage2) && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-800 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Հուշում 2
                        {unlockedHints.includes(2) && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Օգտագործված
                          </span>
                        )}
                      </h4>
                      {!unlockedHints.includes(2) && nextHint === 2 && (
                        <Button
                          onClick={() => requestHint(2)}
                          disabled={hintUsageMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-100"
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          {HINT_COSTS[2]} կրեդիտ
                        </Button>
                      )}
                    </div>
                    {unlockedHints.includes(2) && (
                      <>
                        {exercise.hintImage2 && (
                          <FileViewer
                            url={exercise.hintImage2}
                            title="Հուշում 2 նկար"
                            className="mb-3"
                          />
                        )}
                        {exercise.hintText2 && (
                          <MathPreview
                            value={exercise.hintText2}
                            className="prose prose-sm max-w-none"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Hint 3 */}
                {(exercise.hintText3 || exercise.hintImage3) && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-red-800 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Հուշում 3
                        {unlockedHints.includes(3) && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Օգտագործված
                          </span>
                        )}
                      </h4>
                      {!unlockedHints.includes(3) && nextHint === 3 && (
                        <Button
                          onClick={() => requestHint(3)}
                          disabled={hintUsageMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                          <Coins className="h-3 w-3 mr-1" />
                          {HINT_COSTS[3]} կրեդիտ
                        </Button>
                      )}
                    </div>
                    {unlockedHints.includes(3) && (
                      <>
                        {exercise.hintImage3 && (
                          <FileViewer
                            url={exercise.hintImage3}
                            title="Հուշում 3 նկար"
                            className="mb-3"
                          />
                        )}
                        {exercise.hintText3 && (
                          <MathPreview
                            value={exercise.hintText3}
                            className="prose prose-sm max-w-none"
                          />
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
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
                    <div className="flex flex-wrap gap-2">
                      {exercise.correctAnswers &&
                      exercise.correctAnswers.length > 0 ? (
                        exercise.correctAnswers.map(
                          (ans: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-lg font-mono text-green-700 bg-white p-2 rounded border"
                            >
                              {ans}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-lg font-mono text-green-700 bg-white p-2 rounded border">
                          Չկա պատասխան
                        </span>
                      )}
                    </div>
                  </div>

                  {exercise.givenImage && (
                    <FileViewer
                      url={exercise.givenImage}
                      title="Տրված տվյալների նկար"
                      className="mb-4"
                    />
                  )}
                  {exercise.givenText && (
                    <MathPreview
                      value={exercise.givenText}
                      className="prose prose-lg max-w-none bg-white p-6 rounded-lg border"
                    />
                  )}
                  {exercise.solutionImage && (
                    <FileViewer
                      url={exercise.solutionImage}
                      title="Լուծման նկար"
                      className="mb-4"
                    />
                  )}
                  {exercise.solutionSteps && (
                    <MathPreview
                      value={exercise.solutionSteps}
                      className="prose prose-lg max-w-none bg-white p-6 rounded-lg border"
                    />
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
