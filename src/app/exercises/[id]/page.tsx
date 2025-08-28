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
  Info,
  Check,
  X,
} from "lucide-react";
import { FileViewer } from "@/components/ui/file-viewer";
import { MathPreview } from "@/components/math-preview";
import {
  useExercise,
  useUserProfile,
  useHintUsage,
  useSubmitPartialAnswer,
  useExerciseStats,
} from "@/hooks/use-api";

const HINT_COSTS = { 1: 1, 2: 3, 3: 5 };

export default function StudentExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;

  const [partialAnswers, setPartialAnswers] = useState<string[]>([]);
  const [submittedAnswers, setSubmittedAnswers] = useState<{
    [key: number]: { answer: string; isCorrect: boolean; submittedAt: string };
  }>({});
  const [submittingIndex, setSubmittingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [answerErrors, setAnswerErrors] = useState<{ [key: number]: string }>(
    {}
  );
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
  const { data: exerciseStats } = useExerciseStats(exerciseId);
  const submitPartialAnswerMutation = useSubmitPartialAnswer();
  const hintUsageMutation = useHintUsage();

  console.log("Exercise data:", {
    exercise,
    correctAnswerValues: exercise?.correctAnswerValues,
    correctAnswersLength: exercise?.correctAnswerValues?.length,
    answerUnit: exercise?.answerUnit,
    isLoading,
  });

  // Initialize partial answers array based on exercise correct answer values
  useEffect(() => {
    if (exercise?.correctAnswerValues) {
      setPartialAnswers(new Array(exercise.correctAnswerValues.length).fill(""));
    }
  }, [exercise?.correctAnswerValues]);

  useEffect(() => {
    if (exercise?.solutions && exercise.solutions.length > 0) {
      const solution = exercise.solutions[0];

      // Handle partial answers if they exist
      if (
        solution.submittedAnswers &&
        Array.isArray(solution.submittedAnswers)
      ) {
        const answersMap: {
          [key: number]: {
            answer: string;
            isCorrect: boolean;
            submittedAt: string;
          };
        } = {};
        solution.submittedAnswers.forEach(
          (submittedAnswer: {
            index: number;
            answer: string;
            isCorrect: boolean;
            submittedAt: string;
          }) => {
            answersMap[submittedAnswer.index] = {
              answer: submittedAnswer.answer,
              isCorrect: submittedAnswer.isCorrect,
              submittedAt: submittedAnswer.submittedAt,
            };
          }
        );

        setSubmittedAnswers(answersMap);

        // Check if ALL answers are correct for completion
        const allAnswersCorrect =
          solution.submittedAnswers.length ===
            exercise.correctAnswerValues?.length &&
          solution.submittedAnswers.every(
            (sa: { isCorrect: boolean }) => sa.isCorrect
          );

        setIsCompleted(allAnswersCorrect);
      } else {
        // Fallback to old solution.isCorrect logic
        setIsCompleted(solution.isCorrect);
      }
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

  const handlePartialAnswerSubmit = async (
    answerIndex: number,
    answer: string
  ) => {
    if (!answer.trim()) {
      setError("Պատասխանը պարտադիր է");
      return;
    }

    setSubmittingIndex(answerIndex);
    setError("");
    setSuccess("");
    // Clear any existing error for this answer
    setAnswerErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[answerIndex];
      return newErrors;
    });

    try {
      const result = await submitPartialAnswerMutation.mutateAsync({
        exerciseId,
        answerIndex,
        answer,
      });

      // Update submitted answers
      if (result.submittedAnswers && Array.isArray(result.submittedAnswers)) {
        const answersMap: {
          [key: number]: {
            answer: string;
            isCorrect: boolean;
            submittedAt: string;
          };
        } = {};
        result.submittedAnswers.forEach(
          (submittedAnswer: {
            index: number;
            answer: string;
            isCorrect: boolean;
            submittedAt: string;
          }) => {
            answersMap[submittedAnswer.index] = {
              answer: submittedAnswer.answer,
              isCorrect: submittedAnswer.isCorrect,
              submittedAt: submittedAnswer.submittedAt,
            };
          }
        );

        // Update both states in a way that ensures consistency
        setSubmittedAnswers(answersMap);

        // Only clear the input field if the answer is correct - do this after setting submitted answers
        const currentSubmission = result.submittedAnswers.find(
          (sa: { index: number }) => sa.index === answerIndex
        );
        if (currentSubmission?.isCorrect) {
          setPartialAnswers((prev) => {
            const newPartialAnswers = [...prev];
            newPartialAnswers[answerIndex] = "";
            return newPartialAnswers;
          });
        }
      }

      // Check if exercise is complete - only when ALL answers are correct
      const allAnswersCorrect =
        exercise &&
        result.submittedAnswers?.length === exercise.correctAnswerValues?.length &&
        result.submittedAnswers?.every(
          (sa: { isCorrect: boolean }) => sa.isCorrect
        );
      setIsCompleted(!!allAnswersCorrect);

      if (allAnswersCorrect) {
        setSuccess("Շնորհավորանքներ! Բոլոր պատասխանները ճիշտ են:");
        setShowHints(false);
      } else {
        // Show success for individual answer if correct
        const submittedAnswer = result.submittedAnswers?.find(
          (sa: { index: number }) => sa.index === answerIndex
        );

        if (submittedAnswer?.isCorrect) {
          setSuccess(`Պատասխան ${answerIndex + 1}-ը ճիշտ է!`);
          // Clear any error for this answer
          setAnswerErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[answerIndex];
            return newErrors;
          });
        } else {
          // Set individual error message for this answer
          setAnswerErrors((prev) => ({
            ...prev,
            [answerIndex]: `Պատասխան ${answerIndex + 1}-ը սխալ է, փորձեք նորից`,
          }));
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Սխալ տեղի ունեցավ";
      // Set individual error message for this answer
      setAnswerErrors((prev) => ({
        ...prev,
        [answerIndex]: errorMessage,
      }));
    } finally {
      setSubmittingIndex(null);
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
                  {exercise.exerciseNumber ||
                    `Վարժություն ${exercise.id.slice(-6)}`}
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
              {/* Progress indicator in header */}
              {Object.keys(submittedAnswers).length > 0 && (
                <div className="flex items-center space-x-2">
                  {isCompleted ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium text-sm md:text-base">
                        Ավարտված
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="font-medium text-sm md:text-base">
                        {
                          Object.values(submittedAnswers).filter(
                            (answer) => answer.isCorrect
                          ).length
                        }
                        /{exercise?.correctAnswerValues?.length || 0}
                      </span>
                    </div>
                  )}
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
          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Պատասխաններ</span>
                  {exerciseStats && (
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-500 cursor-help" />
                      <div className="absolute top-6 right-0 bg-gray-900 text-white p-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {exerciseStats.completelyCorrect > 0 ||
                        exerciseStats.partiallyCorrect > 0 ? (
                          <>
                            {exerciseStats.completelyCorrect > 0 && (
                              <div>
                                {exerciseStats.completelyCorrect} մարդ
                                ամբողջությամբ լուծել է
                              </div>
                            )}
                            {exerciseStats.partiallyCorrect > 0 && (
                              <div>
                                {exerciseStats.partiallyCorrect} մարդ մասնակի
                                լուծել է
                              </div>
                            )}
                          </>
                        ) : (
                          "Դեռ ոչ ոք չի լուծել այս վարժությունը"
                        )}
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exercise?.correctAnswerValues?.length > 0 ? (
                  exercise.correctAnswerValues.map(
                    (correctAnswer: string, index: number) => {
                      const submittedAnswer = submittedAnswers[index];
                      const isSubmitted = !!submittedAnswer;
                      const isCorrect = submittedAnswer?.isCorrect;

                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label
                              htmlFor={`answer-${index}`}
                              className="font-medium"
                            >
                              Պատասխան {index + 1}
                              {/* Show expected format if it's a placeholder */}
                              {correctAnswer.startsWith("Պատասխան ") && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (պետք է լրացնել)
                                </span>
                              )}
                            </Label>
                            {isSubmitted && (
                              <div
                                className={`flex items-center space-x-1 text-sm ${
                                  isCorrect ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {isCorrect ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span>Ճիշտ</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4" />
                                    <span>Սխալ - կարող եք փորձել նորից</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <div className="flex gap-2">
                              <Input
                                id={`answer-${index}`}
                                value={(() => {
                                  const displayValue = isCorrect
                                    ? submittedAnswer.answer
                                    : partialAnswers[index] || "";
                                  console.log(
                                    `Input ${index} value calculation:`,
                                    {
                                      isCorrect,
                                      submittedAnswerValue:
                                        submittedAnswer?.answer,
                                      partialAnswerValue: partialAnswers[index],
                                      displayValue,
                                    }
                                  );
                                  return displayValue;
                                })()}
                                onChange={(e) => {
                                  if (!isCorrect) {
                                    // Allow editing if not correct
                                    const newAnswers = [...partialAnswers];
                                    newAnswers[index] = e.target.value;
                                    setPartialAnswers(newAnswers);

                                    // Clear error for this answer when user starts typing
                                    if (answerErrors[index]) {
                                      setAnswerErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors[index];
                                        return newErrors;
                                      });
                                    }
                                  }
                                }}
                                placeholder={`Մուտքագրեք պատասխան ${index + 1}-ը`}
                                disabled={isCorrect || submittingIndex === index}
                                className={`${
                                  isSubmitted
                                    ? isCorrect
                                      ? "bg-green-50 border-green-300"
                                      : "bg-yellow-50 border-yellow-300"
                                    : ""
                                }`}
                              />
                              {exercise.answerUnit && (
                                <div className="flex items-center px-3 bg-gray-100 border border-l-0 rounded-r-md">
                                  <span className="text-sm text-gray-600">{exercise.answerUnit}</span>
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() =>
                                handlePartialAnswerSubmit(
                                  index,
                                  partialAnswers[index] || ""
                                )
                              }
                              disabled={
                                isCorrect || // Disable if already correct
                                submittingIndex !== null ||
                                !partialAnswers[index]?.trim()
                              }
                              size="default"
                              className="whitespace-nowrap"
                            >
                              {submittingIndex === index
                                ? "Ուղարկվում է..."
                                : isSubmitted && !isCorrect
                                ? "Նորից փորձել"
                                : "Ուղարկել"}
                            </Button>
                          </div>

                          {/* Individual error message for this answer */}
                          {answerErrors[index] && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                              {answerErrors[index]}
                            </div>
                          )}

                          {isSubmitted && (
                            <p className="text-xs text-gray-500 mt-2">
                              {isCorrect
                                ? `Ճիշտ պատասխանվել է՝ ${new Date(
                                    submittedAnswer.submittedAt
                                  ).toLocaleString("hy-AM")}`
                                : `Վերջին փորձը՝ ${new Date(
                                    submittedAnswer.submittedAt
                                  ).toLocaleString("hy-AM")} - փորձեք նորից`}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>Այս վարժության համար պատասխանները դեռ սահմանված չեն:</p>
                  </div>
                )}

                {/* Progress indicator */}
                {Object.keys(submittedAnswers).length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Առաջընթաց
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-blue-700">
                        {
                          Object.values(submittedAnswers).filter(
                            (answer) => answer.isCorrect
                          ).length
                        }{" "}
                        / {exercise?.correctAnswerValues?.length || 0} ճիշտ
                        պատասխաններ
                      </div>
                      <div className="flex-1 bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (Object.values(submittedAnswers).filter(
                                (answer) => answer.isCorrect
                              ).length /
                                (exercise?.correctAnswerValues?.length || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                      {exercise.correctAnswerValues &&
                      exercise.correctAnswerValues.length > 0 ? (
                        exercise.correctAnswerValues.map(
                          (ansValue: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-lg font-mono text-green-700 bg-white p-2 rounded border"
                            >
                              {ansValue}{exercise.answerUnits && exercise.answerUnits[idx] ? ` ${exercise.answerUnits[idx]}` : ''}
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
