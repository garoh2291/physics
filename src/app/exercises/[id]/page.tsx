"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { MathEditor } from "@/components/math-editor";
import { FileViewer } from "@/components/ui/file-viewer";
import { FileUpload } from "@/components/ui/file-upload";
import { useExercise, useSubmitSolution } from "@/hooks/use-api";

// Math Content Display Component (same as admin)
function MathContent({ content }: { content: string }) {
  const decodedContent = content
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return (
    <div
      className="math-content-display"
      dangerouslySetInnerHTML={{ __html: decodedContent }}
    />
  );
}

export default function StudentExercisePage() {
  const params = useParams();
  const exerciseId = params.id as string;

  const [givenData, setGivenData] = useState("");
  const [solutionSteps, setSolutionSteps] = useState("");
  const [solutionImage, setSolutionImage] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    data: exercise,
    isLoading,
    error: fetchError,
  } = useExercise(exerciseId);
  const submitSolutionMutation = useSubmitSolution();

  // Load existing solution if any
  useEffect(() => {
    if (exercise?.solutions && exercise.solutions.length > 0) {
      const latestSolution = exercise.solutions[exercise.solutions.length - 1];
      setGivenData(latestSolution.givenData || "");
      setSolutionSteps(latestSolution.solutionSteps || "");
      setSolutionImage(latestSolution.solutionImage || "");
      setFinalAnswer(latestSolution.finalAnswer || "");
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!givenData.trim() || !solutionSteps.trim() || !finalAnswer.trim()) {
      setError("Բոլոր դաշտերը պարտադիր են");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await submitSolutionMutation.mutateAsync({
        exerciseId,
        givenData,
        solutionSteps,
        solutionImage,
        finalAnswer,
      });

      if (result.isCorrect) {
        setSuccess(
          "Շնորհավորում ենք! Ձեր պատասխանը ճիշտ է։ Այժմ սպասեք ադմինիստրատորի ստուգմանը։"
        );
      } else {
        setError(
          "Ձեր պատասխանը սխալ է։ Կարող եք փորձել կրկին կամ շարունակել աշխատել։"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Սխալ է տեղի ունեցել";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "outline" as const,
        icon: Clock,
        text: "Սպասում է",
        className: "text-orange-600",
      },
      APPROVED: {
        variant: "outline" as const,
        icon: CheckCircle,
        text: "Հաստատված",
        className: "text-green-600",
      },
      REJECTED: {
        variant: "outline" as const,
        icon: XCircle,
        text: "Մերժված",
        className: "text-red-600",
      },
      NEEDS_WORK: {
        variant: "outline" as const,
        icon: AlertTriangle,
        text: "Կարիք է շտկման",
        className: "text-yellow-600",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
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

  const latestSolution = exercise.solutions?.[exercise.solutions.length - 1];

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
                <p className="text-sm md:text-base text-gray-600">
                  Փորձեր՝ {exercise.solutions?.length || 0}
                </p>
              </div>
            </div>
            {latestSolution && (
              <div className="flex items-center space-x-2 flex-wrap">
                {getStatusBadge(latestSolution.status)}
                {latestSolution.isCorrect && (
                  <Badge variant="outline" className="text-green-600 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ճիշտ պատասխան
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 space-y-4 md:space-y-6">
        {/* Problem Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📝</span>
              Խնդիր
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exercise.problemImage ? (
              <FileViewer url={exercise.problemImage} title="Խնդիրի նկար/PDF" />
            ) : (
              <MathContent content={exercise.problemText || ""} />
            )}
            {exercise.problemText && exercise.problemImage && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Խնդիրի նկարագրություն</h3>
                <MathContent content={exercise.problemText} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solution Form */}
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Given Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span>
                Տրված է
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MathEditor
                value={givenData}
                onChange={setGivenData}
                height={200}
                placeholder="Մուտքագրեք տրված տվյալները...

Օրինակ՝
N₀ = 20
S = 3 կմ
u = 2,5 մ/վ
v = 5 մ/վ
t₀ = 60 վ"
              />
            </CardContent>
          </Card>

          {/* Solution Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔧</span>
                Լուծում
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="solutionSteps">Լուծման քայլեր</Label>
                <MathEditor
                  value={solutionSteps}
                  onChange={setSolutionSteps}
                  height={300}
                  placeholder="Մուտքագրեք լուծման քայլերը...

Օրինակ՝
Տատիկի տուն հասնելու ժամանակը՝
t = S/u

Գայլի կերած կարկանդակների քանակը՝
N' = t/t' = 10

Հետևաբար տատիկի տուն հասած կարկանդակների քանակը՝
N = N₀ - N' = 10"
                />
              </div>

              <div>
                <Label>Լուծման նկար/PDF (ոչ պարտադիր)</Label>
                <FileUpload
                  value={solutionImage}
                  onChange={setSolutionImage}
                  accept="image/*,.pdf"
                  label="Վերբեռնել լուծման նկար կամ PDF ֆայլ"
                />
              </div>

              {solutionImage && (
                <FileViewer
                  url={solutionImage}
                  title="Լուծման նկար/PDF"
                  className="mt-4"
                />
              )}
            </CardContent>
          </Card>

          {/* Final Answer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>✅</span>
                Պատասխան
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="answer">Վերջնական պատասխան</Label>
                <Input
                  id="answer"
                  value={finalAnswer}
                  onChange={(e) => setFinalAnswer(e.target.value)}
                  placeholder="Օրինակ՝ 10"
                  disabled={latestSolution?.isCorrect}
                />
                {latestSolution?.isCorrect && (
                  <p className="text-sm text-green-600">
                    ✅ Ձեր պատասխանը ճիշտ է։ Այժմ սպասեք ադմինիստրատորի
                    ստուգմանը։
                  </p>
                )}
                {latestSolution?.status === "APPROVED" && (
                  <p className="text-sm text-green-600">
                    ✅ Ձեր լուծումը հաստատված է ադմինիստրատորի կողմից։
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (latestSolution?.isCorrect &&
                  latestSolution?.status === "APPROVED")
              }
              size="lg"
              className="w-full sm:w-auto text-sm md:text-base"
            >
              {isSubmitting ? "Ուղարկվում է..." : "Ուղարկել լուծումը"}
            </Button>
          </div>
        </form>

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Admin Feedback */}
        {latestSolution?.adminFeedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>💬</span>
                Ադմինիստրատորի մեկնաբանություն
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800">{latestSolution.adminFeedback}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
